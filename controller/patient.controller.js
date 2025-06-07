
const Patient = require('../models/Patient')


exports.addPatientDetails = async (req, res) => {
    try {
        const patient = new Patient(req.body);
        await patient.save();
        res.status(201).json(patient);
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding patient details', error });
    }
}

exports.getAllPatientsDetails = async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching Patients Details', error });
    }
}

exports.updatePatientDetails = async (req, res) => {
    try {
        const patientDetailId = req.params.id;
        const updatedPatientDetialsData = req.body;

        const updatedPatientDetails = await Patient.findByIdAndUpdate(
            patientDetailId,
            updatedPatientDetialsData,
            { new: true, runValidators: true }
        );

        if (!updatedPatientDetails) {
            return res.status(404).json({ message: 'patient not found' });
        }
        res.status(200).json(updatedPatientDetails);
        console.log("updated success");
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating patient details', error });
    }
}

exports.deletePatientDetails = async (req, res) => {
    try {
        const patientDetailsId = req.params.id;

        const deletedPatientDetails = await Patient.findByIdAndDelete(patientDetailsId);

        if (!deletedPatientDetails) {
            return res.status(404).json({ message: 'patient not found' });
        }

        res.status(200).json({ message: 'Doctor deleted successfully', patient: deletedPatientDetails });
        console.log("Doctor deleted successfully");
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting patient data', error });
    }
}