import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema({}, { strict: false, collection: 'Patients' });

const User = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);

export default User;
