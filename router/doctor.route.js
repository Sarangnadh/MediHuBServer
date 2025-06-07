let express =require('express')
let router =express.Router();
let doctorController =require('../controller/doctor.controller')


router.get('/getall', doctorController.getAllDoctors);
router.post('/add', doctorController.addDoctor);
router.put('/edit/:id', doctorController.updateDoctor);
router.delete('/delete/:id', doctorController.deleteDoctor);



module.exports=router