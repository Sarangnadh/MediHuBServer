

const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  contact: Number,
  admitted: Date,
  discharged: Date,
  expenses: Number,

});
module.exports = mongoose.model('Patient', patientSchema);