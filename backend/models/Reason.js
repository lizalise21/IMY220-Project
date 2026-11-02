const mongoose = require('mongoose');

module.exports = mongoose.model(
  'Reason',
  new mongoose.Schema({ name: { type: String, required: true, unique: true, trim: true } }, { timestamps: true })
);