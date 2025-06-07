
const Appointments = require('../models/Appointment')
const User = require('../models/User')


exports.allAppointments = async (req,res)=>{
    try{
        const bookings = await Appointments.find();
          res.json(bookings);
    //       const user = await User.findById(req.user.userId).populate('appointments');
    // res.status(200).json(user.appointments);
    }
      catch (error) {
        res.status(500).json({ message: 'Error fetching booking Details', error });
    }
}
exports.getAllAppointments = async (req, res) => {
  try {

    const user = await User.findById(req.user.userId).populate('appointments');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user.appointments);
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ message: 'Error fetching booking details', error });
  }
};


exports.addBooking = async (req, res) => {
  try {
    const bookAppointments = new Appointments({
      ...req.body,
      user: req.user.userId
    });
    const saved = await bookAppointments.save();
    const user = await User.findById(req.user.userId);
    user.appointments.push(saved._id);
    await user.save();
    res.status(201).json(bookAppointments);
    console.log("booking confirm");
  }
  catch (error) {
    res.status(500).json({ message: 'Error Booking appointments', error });
    console.log("errors", error);

  }
}



exports.updateAppointment = async (req, res) => {
  try {
    const appointmenttDetailsId = req.params.id;
    const updatedAppointmentDetialsData = req.body;

    const updatedppointmentDetails = await Appointments.findByIdAndUpdate(
      appointmenttDetailsId,
      updatedAppointmentDetialsData,
      { new: true, runValidators: true }
    );

    if (!updatedppointmentDetails) {
      return res.status(404).json({ message: 'appointment not found' });
    }
    res.status(200).json(updatedppointmentDetails);
    console.log("Appointment updated success");
  }
  catch (error) {
    res.status(500).json({ message: 'Error updating appointment', error });
  }
}


exports.deleteBooking = async (req, res) => {
  try {
    const appointmentDetailsId = req.params.id;

    const deletedAppointmentDetails = await Appointments.findByIdAndDelete(appointmentDetailsId);

    if (!deletedAppointmentDetails) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    await User.findByIdAndUpdate(
      req.user.userId,
      { $pull: { appointments: appointmentDetailsId } }
    );
    res.status(200).json({ message: 'Booking deleted successfully', Appointment: deletedAppointmentDetails });
    console.log("Appointment deleted successfully");
  }
  catch (error) {
    res.status(500).json({ message: 'Error deleting  appointment ', error });
  }
}



const sendNotificationToUser = (email, message) => {
  console.log(`📩 Notification to ${email}: ${message}`);
};


exports.updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const appointment = await Appointments.findById(id).populate('user');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Block edits if already approved
    if (appointment.status === 'Approved') {
      return res.status(400).json({ message: 'Cannot update an already approved appointment' });
    }

    // Update status
    appointment.status = status;

 const formattedDate = new Date(appointment.date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    });

    // For 'Approved' status: add reminder and push to user.approvedAppointments
    if (status === 'Approved') {
      const now = new Date();
      const reminderDate = new Date(appointment.date);
      reminderDate.setHours(reminderDate.getHours() - 24); // 24h before appointment
      appointment.reminder = reminderDate;

      await appointment.save();

      const user = await User.findById(appointment.user._id);
      user.approvedAppointments.push(appointment._id);
      user.notifications.push({
        message: `✅ Your appointment with Dr. ${appointment.doctor} is approved for ${formattedDate}.`
      });
      await user.save();

      if (user.email) {
        sendNotificationToUser(user.email, `✅ Your appointment with Dr. ${appointment.doctor} is approved for ${formattedDate}.`);
      }

    } else if (status === 'Booking Rejected') {
      const user = await User.findById(appointment.user._id);

      // Remove from appointments and push to cancelled
      user.appointments.pull(appointment._id);
      user.cancelledAppointments.push(appointment._id);
      user.notifications.push({
        message: ` Your appointment with Dr. ${appointment.doctor} on ${formattedDate} has been rejected.`
      });

      await user.save();
      await Appointments.findByIdAndDelete(id); // Delete actual appointment

      if (user.email) {
        sendNotificationToUser(user.email, ` Your appointment with Dr. ${appointment.doctor} on ${formattedDate} has been rejected.`);
      }

      return res.status(200).json({ message: 'Appointment rejected and removed from user list' });
    } else {
      await appointment.save();
      const user = await User.findById(appointment.user._id);

  // Add a generic notification message for other status changes
  user.notifications.push({
    message: `ℹ️ The status of your appointment with Dr. ${appointment.doctor} on ${formattedDate} has been updated to "${status}".`
  });

  await user.save();

  if (user.email) {
    sendNotificationToUser(user.email, `ℹ️ The status of your appointment with Dr. ${appointment.doctor} on ${formattedDate} has been updated to "${status}".`);
  }

      
    }

    res.status(200).json({
      message: 'Appointment status updated',
      appointment,
    });
  } catch (error) {
    console.error('❌ Failed to update appointment status:', error);
    res.status(500).json({ message: 'Failed to update appointment status', error });
  }
};
