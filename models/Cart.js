// models/Cart.js
import mongoose from 'mongoose';
const CartItemSchema = new mongoose.Schema({
  productId:     { type: mongoose.Types.ObjectId, ref: 'Drug', required: true },
  Name:          { type: String },
  SalePrice:     { type: Number },
  Picture:       { type: String },
  Category:      { type: String },
  BarcodeNumber: { type: String },
  // Missing:
  quantity:      { type: Number, default: 1 }
});

const CartSchema = new mongoose.Schema({
  browserId: { type: String, required: true, unique: true },
  items:     [CartItemSchema],
}, { timestamps: true });

export default mongoose.model('Cart', CartSchema);
