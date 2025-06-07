
let express =require('express')
let router =express.Router();
let doctorRouter =require('./doctor.route')
let patientRouter =require('./patient.router')
let appointmentRouter =require('./appointments.route')
let adminRouter = require('./admin.route')
let userRouter = require('./user.route')


router.use('/doctors',doctorRouter);
router.use('/patients',patientRouter);
router.use('/appointments',appointmentRouter);
router.use('/admin',adminRouter);
router.use('/user',userRouter);


router.get('/', function (req, res, next) {
  res.json("App ready");
});



module.exports =router