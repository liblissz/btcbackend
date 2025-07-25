import mongoose from "mongoose";

const Patient = mongoose.model('Patient', new mongoose.Schema({}, { strict: false, collection: 'Patients' }));

export default Patient;