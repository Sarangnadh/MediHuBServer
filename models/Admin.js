
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
  key: String
});
module.exports = mongoose.model('Admin', adminSchema);