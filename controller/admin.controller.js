const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const Appointments = require('../models/Appointment')

exports.registerAdmin=async(req,res)=>{
      try {
        const { name, email, password, role, key } = req.body;
    
        // Optional: Validate key on backend (not required if already validated on client)
        const VALID_SECRET_KEY = process.env.SECRET_KEY
        if (key !== VALID_SECRET_KEY) {
          return res.status(403).json({ message: 'Invalid admin key' });
        }
    
        const existing = await Admin.findOne({ email });
        if (existing) {
          return res.status(409).json({ message: 'Admin already exists' });
        }
    
        const admin = new Admin({ name, email, password, role, key });
        await admin.save();
    
        res.status(201).json({ message: 'Admin registered successfully', admin });
      } catch (error) {
        res.status(500).json({ message: 'Error registering admin', error });
      }
}

exports.loginAdmin =async(req,res)=>{
     try {
        const { email, password } = req.body;
    
        const admin = await Admin.findOne({ email });
    
        if (!admin) {
          return res.status(401).json({ message: 'Invalid email or admin does not exist' });
        }
    
        if (admin.password !== password) {
          return res.status(401).json({ message: 'Invalid password' });
        }
        const token = jwt.sign(
          { userId: admin._id, email: admin.email },
          process.env.JWT_SECRET,
          { expiresIn: '2h' }
        )
        res.status(200).json({ message: 'Admin login successful',token, admin });
      } catch (error) {
        res.status(500).json({ message: 'Error logging in admin', error });
      }
}

exports.deleteAppointment = async (req, res) => {
  const appointmentDetailsId = req.params.id;

  try {
    const deletedAppointmentDetails = await Appointments.findByIdAndDelete(appointmentDetailsId);

    if (!deletedAppointmentDetails) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    console.log("Appointment deleted successfully");
    res.status(200).json({ message: 'Booking deleted successfully', Appointment: deletedAppointmentDetails });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error while deleting appointment' });
  }
};