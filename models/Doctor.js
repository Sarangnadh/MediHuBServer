

const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: String,
  specialty: String,
  image: String,
  experience: Number,
  day: {
    type: [String],
    require: true
  }

});

module.exports = mongoose.model('Doctor', doctorSchema);