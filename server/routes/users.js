const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// @GET /api/users — Search users (for member invitation)
router.get('/', protect, async (req, res) => {
  try {
    const { search, limit = 10 } = req.query;
    let filter = { _id: { $ne: req.user._id } };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('name email avatar role')
      .limit(parseInt(limit))
      .sort({ name: 1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// @GET /api/users/all — Admin only - all users
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// @PUT /api/users/:id/role — Admin: change user role
router.put('/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Role updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update role', error: error.message });
  }
});

module.exports = router;