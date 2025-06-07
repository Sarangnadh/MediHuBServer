

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ['user'],
    default: 'user'
  },
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
    notifications: [
    {
      message: String,
      date: { type: Date, default: Date.now },
      read: { type: Boolean, default: false }
    }
  ],
  approvedAppointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointments' }],
cancelledAppointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointments' }]


});

module.exports = mongoose.model('User', userSchema);