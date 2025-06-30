
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin'
  },
  key: String,
  notifications: [
    {
      message: String,
      date: { type: Date, default: Date.now },
      read: { type: Boolean, default: false }
    }
  ]
}, {
  timestamps: true
});
module.exports = mongoose.model('Admin', adminSchema);