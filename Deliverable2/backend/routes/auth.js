const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const sign = (u) =>
  jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
const clean = (u) => {
  const o = u.toObject();
  delete o.password;
  return o;
};

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'Username, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (exists) return res.status(409).json({ error: 'Username or email already in use' });
    const user = await User.create({ username, email, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: sign(user), user: clean(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.password)))
      return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ token: sign(user), user: clean(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// JWTs are stateless, the client discards the token. Endpoint exists for completeness.
router.post('/logout', auth, (req, res) => res.json({ message: 'Logged out' }));

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(clean(user));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;