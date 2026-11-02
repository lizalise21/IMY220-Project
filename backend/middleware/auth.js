const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET = process.env.JWT_SECRET || 'dev-secret';
const WEEK = 7 * 24 * 60 * 60 * 1000;

// Reads the session from an httpOnly cookie.
const auth = async (req, res, next) => {
  const token = req.cookies && req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const { id } = jwt.verify(token, SECRET);
    const user = await User.findById(id).select('role username');
    if (!user) return res.status(401).json({ error: 'Account no longer exists' });
    req.user = { id: user._id.toString(), role: user.role, username: user.username };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
};

auth.admin = (req, res, next) =>
  req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admins only' });

// Used by GET /auth/me: returns null instead of a 401, so logged-out page loads don't log console errors.
auth.optional = async (req) => {
  const token = req.cookies && req.cookies.token;
  if (!token) return null;
  try {
    const { id } = jwt.verify(token, SECRET);
    return await User.findById(id);
  } catch {
    return null;
  }
};

auth.login = (res, user) =>
  res.cookie('token', jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' }), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: WEEK,
  });

auth.logout = (res) => res.clearCookie('token');

module.exports = auth;