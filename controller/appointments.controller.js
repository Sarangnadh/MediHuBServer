
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

    // Find the appointment before deleting
    const appointment = await Appointments.findById(appointmentDetailsId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Delete the appointment
    await Appointments.findByIdAndDelete(appointmentDetailsId);

    // Fetch the user
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isApproved = user.approvedAppointments.includes(appointmentDetailsId);

    // Remove from appointments and optionally approvedAppointments
    const updateFields = {
      $pull: { appointments: appointmentDetailsId },
      $push: { userDeletedAppointments: appointment }
    };

    if (isApproved) {
      updateFields.$pull.approvedAppointments = appointmentDetailsId;
    }

    await User.findByIdAndUpdate(req.user.userId, updateFields);

    // Send notification to user
    let userNotificationMsg = `Your appointment with Dr. ${appointment.doctor} on ${appointment.date.toDateString()} has been deleted.`;
    if (isApproved) {
      userNotificationMsg += ` Note: This was an approved appointment.`;
    }

    sendNotificationToUser(user.email, userNotificationMsg);

    // Notify all admins if it was an approved appointment
    if (isApproved) {
      const admins = await User.find({ role: 'admin' });

      const adminNotification = {
        message: `Approved appointment with Dr. ${appointment.doctor} on ${appointment.date.toDateString()} was deleted by ${user.name}.`,
        date: new Date(),
        read: false
      };

      for (const admin of admins) {
        admin.notifications.push(adminNotification);
        await admin.save();
      }
    }

    res.status(200).json({
      message: 'Booking deleted successfully.',
      deletedAppointment: appointment,
      adminNotified: isApproved
    });

    console.log("✅ Appointment deleted and archived. Admin notified:", isApproved);

  } catch (error) {
    console.error("❌ Error deleting appointment:", error);
    res.status(500).json({ message: 'Error deleting appointment', error });
  }
};



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

    // Format date for notification
    const formattedDate = new Date(appointment.date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    });

    const user = await User.findById(appointment.user._id);

    // === Handle Approval ===
    if (status === 'Approved') {
      const reminderDate = new Date(appointment.date);
      reminderDate.setHours(reminderDate.getHours() - 24);
      appointment.reminder = reminderDate;
      appointment.status = 'Approved';

      await appointment.save();

      if (!user.approvedAppointments.includes(appointment._id)) {
        user.approvedAppointments.push(appointment._id);
      }

      user.notifications.push({
        message: `✅ Your appointment with Dr. ${appointment.doctor} is approved for ${formattedDate}.`
      });

      await user.save();

      if (user.email) {
        sendNotificationToUser(user.email, `✅ Your appointment with Dr. ${appointment.doctor} is approved for ${formattedDate}.`);
      }
    }

    // === Handle Rejection ===
    else if (status === 'Booking Rejected') {
      appointment.status = 'Booking Rejected';
      await appointment.save();

      // Remove from main appointments if present
      user.appointments.pull(appointment._id);

      if (!user.cancelledAppointments.includes(appointment._id)) {
        user.cancelledAppointments.push(appointment._id);
      }

      user.notifications.push({
        message: `❌ Your appointment with Dr. ${appointment.doctor} on ${formattedDate} has been rejected.`
      });

      await user.save();

      if (user.email) {
        sendNotificationToUser(user.email, `❌ Your appointment with Dr. ${appointment.doctor} on ${formattedDate} has been rejected.`);
      }

      return res.status(200).json({ message: 'Appointment rejected and moved to cancelled list', appointment });
    }

    // === Handle Other Status Updates ===
    else {
      appointment.status = status;
      await appointment.save();

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
      appointment
    });
  } catch (error) {
    console.error('❌ Failed to update appointment status:', error);
    res.status(500).json({ message: 'Failed to update appointment status', error });
  }
};

exports.getUserDeletedAppointments = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('userDeletedAppointments');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      userDeletedAppointments: user.userDeletedAppointments
    });
  } catch (error) {
    console.error('Error fetching deleted appointments:', error);
    res.status(500).json({ message: 'Error fetching deleted appointments', error });
  }
};
