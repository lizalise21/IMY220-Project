const router = require('express').Router();
const User = require('../models/User');
const Report = require('../models/Report');
const Reason = require('../models/Reason');
const auth = require('../middleware/auth');
const { handle, httpError, cleanUser, deleteUser } = require('../utils/helpers');

router.use(auth, auth.admin);

// Reported posts grouped per post, with every reason
router.get('/reports', handle(async (req, res) => {
  const reports = await Report.find()
    .sort('-createdAt')
    .populate('reporter', 'username')
    .populate({ path: 'post', populate: { path: 'author', select: 'username' } });
  const map = new Map();
  for (const r of reports) {
    if (!r.post) continue;
    const key = r.post._id.toString();
    if (!map.has(key)) map.set(key, { post: r.post, reports: [] });
    map.get(key).reports.push({
      _id: r._id,
      reason: r.reason,
      details: r.details,
      reporter: r.reporter ? r.reporter.username : 'deleted user',
    });
  }
  res.json([...map.values()].sort((a, b) => b.reports.length - a.reports.length));
}));

// Remove all reports from a post (keeps the post)
router.delete('/reports/:postId', handle(async (req, res) => {
  await Report.deleteMany({ post: req.params.postId });
  res.json({ message: 'Reports removed' });
}));

router.get('/users', handle(async (req, res) => {
  res.json(await User.find().select('-password').sort('username'));
}));

router.put('/users/:id', handle(async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) throw httpError(404, 'User not found');
  const { username, email, name, bio } = req.body;
  if (username !== undefined) {
    const v = String(username).trim();
    if (v.length < 3) throw httpError(400, 'Username must be at least 3 characters');
    if (await User.exists({ _id: { $ne: u._id }, username: v })) throw httpError(409, 'Username taken');
    u.username = v;
  }
  if (email !== undefined) {
    const v = String(email).trim().toLowerCase();
    if (!/\S+@\S+\.\S+/.test(v)) throw httpError(400, 'Enter a valid email address');
    if (await User.exists({ _id: { $ne: u._id }, email: v })) throw httpError(409, 'Email already in use');
    u.email = v;
  }
  if (name !== undefined) u.name = String(name).trim();
  if (bio !== undefined) u.bio = String(bio).slice(0, 300);
  await u.save();
  res.json(cleanUser(u));
}));

router.delete('/users/:id', handle(async (req, res) => {
  if (req.params.id === req.user.id) throw httpError(400, 'Use "Delete my account" for your own account');
  await deleteUser(req.params.id);
  res.json({ message: 'User deleted' });
}));

router.post('/reasons', handle(async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) throw httpError(400, 'Reason cannot be empty');
  if (await Reason.exists({ name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') })) {
    throw httpError(409, 'That reason already exists');
  }
  await Reason.create({ name });
  res.status(201).json({ message: 'Reason added' });
}));

module.exports = router;