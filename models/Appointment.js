
const mongoose = require('mongoose');

const appointmentsSchema= new mongoose.Schema({
  name: String,
  age: Number,
  doctor: String,         
  date: Date,            
  time: String,           
  phone: Number,
  email: String,
  notes: String,
 status: { type: String, required: true } ,
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } ,
reminder: { type: Date }

})

module.exports = mongoose.model('Appointment', appointmentsSchema);