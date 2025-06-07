
let express =require('express')
let router =express.Router();
const authMiddleware = require('../authMiddleware');
let appointmentsController =require('../controller/appointments.controller')
const User = require('../models/User')

router.get('/appointmentDetails',authMiddleware, appointmentsController.getAllAppointments);
router.post('/bookappointment',authMiddleware, appointmentsController.addBooking);
router.put('/editAppointment/:id',authMiddleware,appointmentsController.updateAppointment );
router.delete('/deleteAppointment/:id',authMiddleware, appointmentsController.deleteBooking);
router.get('/allAppointmentDetails', appointmentsController.allAppointments);
router.put('/updateStatus/:id', authMiddleware, appointmentsController.updateAppointmentStatus);

// router.get('/users/notifications', authMiddleware, async (req, res) => {
//   const user = await User.findById(req.user.userId);
//   res.json({ notifications: user.notifications });
// });


module.exports=router