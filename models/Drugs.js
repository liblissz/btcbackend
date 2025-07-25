import mongoose from "mongoose";

const Drug = mongoose.model('Drug', new mongoose.Schema({}, { strict: false, collection: 'Drugs' }));

export default Drug