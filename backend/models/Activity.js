const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['post', 'album', 'album_add'], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);