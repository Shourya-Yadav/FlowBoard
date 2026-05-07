const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [2, 'Project name must be at least 2 characters'],
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'on-hold', 'completed', 'archived'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  deadline: {
    type: Date
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  color: {
    type: String,
    default: () => {
      const colors = ['#6C63FF', '#00D4AA', '#FF6B6B', '#FFB800', '#4ECDC4', '#A78BFA', '#F472B6'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for task count
projectSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  count: true
});

// Ensure owner is always in members with admin role
projectSchema.pre('save', function (next) {
  if (this.isNew) {
    const ownerExists = this.members.some(m => m.user && m.user.toString() === this.owner.toString());
    if (!ownerExists) {
      this.members.push({ user: this.owner, role: 'admin' });
    }
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);