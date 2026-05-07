const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_in_production');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Token is invalid. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

const projectAdmin = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const project = await Project.findById(req.params.id || req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const memberEntry = project.members.find(m => m.user && m.user.toString() === req.user._id.toString());
    const isProjectAdmin = memberEntry && memberEntry.role === 'admin';
    const isGlobalAdmin = req.user.role === 'admin';

    if (!isOwner && !isProjectAdmin && !isGlobalAdmin) {
      return res.status(403).json({ message: 'Access denied. Project admin privileges required.' });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const projectMember = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const projectId = req.params.id || req.params.projectId || req.body.project;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.user && m.user.toString() === req.user._id.toString());
    const isGlobalAdmin = req.user.role === 'admin';

    if (!isOwner && !isMember && !isGlobalAdmin) {
      return res.status(403).json({ message: 'Access denied. Not a project member.' });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { protect, adminOnly, projectAdmin, projectMember };