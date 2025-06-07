
let express =require('express')
let router =express.Router();
const authMiddleware = require('../authMiddleware');
let userController =require('../controller/user.controller')

router.post('/registerUser', userController.registerUser);
router.post('/loginUser', userController.loginUser);
router.get('/notifications', authMiddleware, userController.getNotifications)

module.exports = router;