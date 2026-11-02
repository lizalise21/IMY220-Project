const router = require('express').Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { handle } = require('../utils/helpers');

router.get('/', auth, handle(async (req, res) => {
  res.json(await Notification.find({ user: req.user.id }).sort('-createdAt').limit(50));
}));

router.get('/unread', auth, handle(async (req, res) => {
  res.json({ count: await Notification.countDocuments({ user: req.user.id, read: false }) });
}));

router.post('/read', auth, handle(async (req, res) => {
  await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
  res.json({ message: 'ok' });
}));

module.exports = router;