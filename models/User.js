

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
  approvedAppointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
  cancelledAppointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
  userDeletedAppointments: [mongoose.Schema.Types.Mixed],
    notifications: [
    {
      message: String,
      date: { type: Date, default: Date.now },
      read: { type: Boolean, default: false }
    }
  ],
},
  {
    timestamps: true // <-- This automatically adds `createdAt` and `updatedAt`
  });

module.exports = mongoose.model('User', userSchema);