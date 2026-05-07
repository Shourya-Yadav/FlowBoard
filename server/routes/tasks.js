const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const canEditTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = task.project;
    const userId = req.user._id.toString();
    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.some(m => m.user && m.user.toString() === userId);
    const isGlobalAdmin = req.user.role === 'admin';

    if (!isOwner && !isMember && !isGlobalAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    req.task = task;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @GET /api/tasks — My tasks (assigned to me or created by me)
router.get('/', protect, async (req, res) => {
  try {

    const {
      status,
      priority,
      overdue,
      projectId
    } = req.query;

    let filter = {};

    // ADMIN → can see all tasks
    if (req.user.role === 'admin') {

      if (projectId) {
        filter.project = projectId;
      }

    } else {

      // MEMBER → only assigned tasks
      filter.assignee = req.user._id;

      if (projectId) {
        filter.project = projectId;
      }
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Priority filter
    if (priority) {
      filter.priority = priority;
    }

    // Overdue filter
    if (overdue === 'true') {

      filter.dueDate = {
        $lt: new Date()
      };

      filter.status = {
        $ne: 'completed'
      };
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color')
      .sort({
        dueDate: 1,
        createdAt: -1
      });

    res.json({
      tasks
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: 'Failed to fetch tasks',
      error: error.message
    });

  }
});

// @POST /api/tasks — Create task
router.post('/', protect, [
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be 2-200 characters'),
  body('project').isMongoId().withMessage('Valid project ID required'),
  body('status').optional().isIn(['todo', 'in-progress', 'in-review', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('assignee').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, description, project: projectId, status, priority, dueDate, assignee, tags } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const userId = req.user._id.toString();
    const canAccess = project.owner.toString() === userId ||
      project.members.some(m => m.user && m.user.toString() === userId) ||
      req.user.role === 'admin';

    if (!canAccess) return res.status(403).json({ message: 'You are not a member of this project.' });

    // Validate assignee is a project member
    if (assignee) {
      const isValidAssignee = project.owner.toString() === assignee ||
        project.members.some(m => m.user && m.user.toString() === assignee);
      if (!isValidAssignee) return res.status(400).json({ message: 'Assignee must be a project member.' });
    }

    const task = await Task.create({
      title, description, project: projectId, status, priority, dueDate,
      assignee: assignee || null, tags: tags || [], createdBy: req.user._id
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color');

    res.status(201).json({ message: 'Task created successfully!', task: populated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
});

// @GET /api/tasks/:id
router.get('/:id', protect, canEditTask, async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'name color members owner')
    .populate('comments.user', 'name avatar');
  res.json({ task });
});

// @PUT /api/tasks/:id
router.put('/:id', protect, canEditTask, [
  body('title').optional().trim().isLength({ min: 2, max: 200 }),
  body('status').optional().isIn(['todo', 'in-progress', 'in-review', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('dueDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const updates = {};
    const allowed = ['title', 'description', 'status', 'priority', 'dueDate', 'assignee', 'tags'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color');

    res.json({ message: 'Task updated!', task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
});

// @DELETE /api/tasks/:id
router.delete('/:id', protect, canEditTask, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
});

// @POST /api/tasks/:id/comments
router.post('/:id/comments', protect, canEditTask, [
  body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const task = await Task.findById(req.params.id);
    task.comments.push({ user: req.user._id, text: req.body.text });
    await task.save();

    const updated = await Task.findById(task._id)
      .populate('comments.user', 'name avatar')
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color');

    res.status(201).json({ message: 'Comment added!', task: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
});

// @PATCH /api/tasks/:id/status — Quick status update
router.patch('/:id/status', protect, canEditTask, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['todo', 'in-progress', 'in-review', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const task = await Task.findById(req.params.id);
    task.status = status;
    await task.save();

    const updated = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color');

    res.json({ message: 'Status updated!', task: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
});

module.exports = router;