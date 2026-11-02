const mongoose = require('mongoose');

const ref = (name) => [{ type: mongoose.Schema.Types.ObjectId, ref: name }];

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    name: { type: String, default: '', trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // plain text on purpose (marking requirement)
    pronouns: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    links: [String],
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    friends: ref('User'),
    friendRequests: ref('User'), // incoming
    sentRequests: ref('User'), // outgoing
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);