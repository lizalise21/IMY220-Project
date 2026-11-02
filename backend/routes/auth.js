const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const { handle, httpError, cleanUser } = require('../utils/helpers');

router.post('/signup', handle(async (req, res) => {
  const { username = '', email = '', password = '' } = req.body;
  if (username.trim().length < 3) throw httpError(400, 'Username must be at least 3 characters');
  if (!/\S+@\S+\.\S+/.test(email)) throw httpError(400, 'Enter a valid email address');
  if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.trim() }] });
  if (exists) throw httpError(409, 'Username or email already in use');
  const user = await User.create({ username: username.trim(), email, password });
  auth.login(res, user); // registering logs the user in automatically
  res.status(201).json({ user: cleanUser(user) });
}));

router.post('/login', handle(async (req, res) => {
  const { email = '', password = '' } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || user.password !== password) throw httpError(401, 'Invalid email or password');
  auth.login(res, user);
  res.json({ user: cleanUser(user) });
}));

router.post('/logout', (req, res) => {
  auth.logout(res);
  res.json({ message: 'Logged out' });
});

router.get('/me', handle(async (req, res) => {
  const user = await auth.optional(req);
  res.json(user ? cleanUser(user) : null);
}));

module.exports = router;