import mongoose from "mongoose";
const DrugPurchase = mongoose.model('DrugPurchase', new mongoose.Schema({}, { strict: false, collection: 'DrugPurchase' }));

export default DrugPurchase