import mongoose from "mongoose";

const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false, collection: 'Vendors' }));

export default Vendor;