const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect, projectAdmin, projectMember } = require('../middleware/auth');

// @GET /api/projects — Get all projects user is part of
router.get('/', protect, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    };

    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };

    const projects = await Project.find(query)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role')
      .sort({ updatedAt: -1 });

    // Get task counts per project
    const projectsWithCounts = await Promise.all(projects.map(async (project) => {
      const taskStats = await Task.aggregate([
        { $match: { project: project._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      const stats = { todo: 0, 'in-progress': 0, 'in-review': 0, completed: 0, total: 0 };
      taskStats.forEach(s => {
        stats[s._id] = s.count;
        stats.total += s.count;
      });

      return { ...project.toObject(), taskStats: stats };
    }));

    res.json({ projects: projectsWithCounts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
  }
});

// @POST /api/projects — Create project
router.post('/', protect, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Project name must be 2-100 characters'),
  body('description').optional().trim().isLength({ max: 500 }),
  body('deadline').optional().isISO8601().withMessage('Invalid date format'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, description, deadline, priority, color } = req.body;

    const project = await Project.create({
      name,
      description,
      deadline,
      priority,
      color,
      owner: req.user._id
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role');

    res.status(201).json({ message: 'Project created successfully!', project: populated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
});

// @GET /api/projects/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isAuthorized = project.owner._id.toString() === req.user._id.toString() ||
      project.members.some(m => m.user && m.user._id.toString() === req.user._id.toString()) ||
      req.user.role === 'admin';

    if (!isAuthorized) return res.status(403).json({ message: 'Access denied' });

    // Task breakdown
    const taskStats = await Task.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const stats = { todo: 0, 'in-progress': 0, 'in-review': 0, completed: 0, total: 0 };
    taskStats.forEach(s => { stats[s._id] = s.count; stats.total += s.count; });

    res.json({ project, taskStats: stats });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project', error: error.message });
  }
});

// @PUT /api/projects/:id
router.put('/:id', protect, projectAdmin, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('status').optional().isIn(['active', 'on-hold', 'completed', 'archived']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, description, status, priority, deadline, color } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, status, priority, deadline, color },
      { new: true, runValidators: true }
    ).populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role');

    res.json({ message: 'Project updated successfully!', project });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update project', error: error.message });
  }
});

// @DELETE /api/projects/:id
router.delete('/:id', protect, projectAdmin, async (req, res) => {
  try {
    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project and all associated tasks deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project', error: error.message });
  }
});

// @POST /api/projects/:id/members — Add member
router.post('/:id/members', protect, projectAdmin, async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: 'User ID is required'
      });
    }

    const userToAdd = await User.findById(userId);

    if (!userToAdd) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const project = req.project;

    const alreadyMember = project.members.some(
      m => m.user && m.user.toString() === userId
    );

    if (alreadyMember) {
      return res.status(409).json({
        message: 'User already added'
      });
    }

    project.members.push({
      user: userToAdd._id,
      role
    });

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role');

    res.json({
      message: 'Member added successfully',
      project: updatedProject
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Failed to add member',
      error: error.message
    });
  }
});

// @DELETE /api/projects/:id/members/:userId
router.delete('/:id/members/:userId', protect, projectAdmin, async (req, res) => {
  try {
    const project = req.project;
    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove the project owner.' });
    }

    project.members = project.members.filter(m => m.user && m.user.toString() !== req.params.userId);
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role');

    res.json({ message: 'Member removed from project.', project: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove member', error: error.message });
  }
});

// @GET /api/projects/:id/tasks — Tasks for a project
router.get('/:id/tasks', protect, async (req, res) => {
  try {
    const { status, priority, assignee } = req.query;
    let filter = { project: req.params.id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
});

module.exports = router;