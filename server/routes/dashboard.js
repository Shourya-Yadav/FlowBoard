const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Projects user is part of
    const userProjects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }]
    }).select('_id name status color deadline');

    const projectIds = userProjects.map(p => p._id);

    // All tasks in those projects
    const [allTaskStats, myTaskStats, overdueCount, completedThisWeek] = await Promise.all([
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $match: { assignee: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Task.countDocuments({
        project: { $in: projectIds },
        dueDate: { $lt: now },
        status: { $ne: 'completed' }
      }),
      Task.countDocuments({
        project: { $in: projectIds },
        status: 'completed',
        completedAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    const taskStats = { todo: 0, 'in-progress': 0, 'in-review': 0, completed: 0, total: 0 };
    allTaskStats.forEach(s => { taskStats[s._id] = s.count; taskStats.total += s.count; });

    const myStats = { todo: 0, 'in-progress': 0, 'in-review': 0, completed: 0, total: 0 };
    myTaskStats.forEach(s => { myStats[s._id] = s.count; myStats.total += s.count; });

    // Recent activity — latest 8 tasks
    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignee', 'name avatar')
      .populate('project', 'name color')
      .sort({ updatedAt: -1 })
      .limit(8);

    // Overdue tasks list
    const overdueTasks = await Task.find({
      $or: [{ assignee: userId }, { createdBy: userId }],
      dueDate: { $lt: now },
      status: { $ne: 'completed' }
    })
      .populate('project', 'name color')
      .populate('assignee', 'name avatar')
      .sort({ dueDate: 1 })
      .limit(5);

    // Upcoming tasks (next 7 days)
    const upcomingTasks = await Task.find({
      $or: [{ assignee: userId }, { project: { $in: projectIds } }],
      dueDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      status: { $ne: 'completed' }
    })
      .populate('project', 'name color')
      .populate('assignee', 'name avatar')
      .sort({ dueDate: 1 })
      .limit(5);

    // Stats for admin
    let adminStats = null;
    if (req.user.role === 'admin') {
      const [totalUsers, totalProjects, totalTasks] = await Promise.all([
        User.countDocuments(),
        Project.countDocuments(),
        Task.countDocuments()
      ]);
      adminStats = { totalUsers, totalProjects, totalTasks };
    }

    res.json({
      projectStats: {
        total: userProjects.length,
        active: userProjects.filter(p => p.status === 'active').length,
        completed: userProjects.filter(p => p.status === 'completed').length,
        onHold: userProjects.filter(p => p.status === 'on-hold').length,
      },
      taskStats,
      myTaskStats: myStats,
      overdueCount,
      completedThisWeek,
      recentTasks,
      overdueTasks,
      upcomingTasks,
      adminStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
});

module.exports = router;