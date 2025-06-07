
let express =require('express')
let router =express.Router();
let patientsController =require('../controller/patient.controller')

router.get('/getPatients', patientsController.getAllPatientsDetails);
router.post('/addpatient', patientsController.addPatientDetails);
router.put('/updatedPatientsDetails/:id',patientsController.updatePatientDetails );
router.delete('/deletePatientDetails/:id', patientsController.deletePatientDetails);


module.exports=router