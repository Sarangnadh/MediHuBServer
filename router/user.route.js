
let express =require('express')
let router =express.Router();
const authMiddleware = require('../authMiddleware');
let userController =require('../controller/user.controller')

router.post('/registerUser', userController.registerUser);
router.post('/loginUser', userController.loginUser);
router.get('/notifications', authMiddleware, userController.getNotifications)
router.get('/getallUsers',authMiddleware,userController.getAllUsers)
router.get('/approvedAppointments',authMiddleware,userController.getApprovedAppointments)
router.get('/cancelledAppointments',authMiddleware,userController.getCancelledAppointments)


module.exports = router;