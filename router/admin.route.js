
let express =require('express')
let router =express.Router();
// const authMiddleware = require('../authMiddleware');
let adminController =require('../controller/admin.controller')

router.post('/registerAdmin', adminController.registerAdmin);
router.post('/loginAdmin',adminController.loginAdmin);
router.delete('/deleteAppointment/:id',adminController.deleteAppointment)
module.exports = router;