

// import mongoose from 'mongoose';

// const CustomerSchema = new mongoose.Schema({
//   name:     { type: String, required: true },
//   email:    { type: String, required: true },
//   number:   { type: String, required: true },
//   illness:  { type: String, required: true },
//   address:  { type: String, required: true },
// });

// const OrderItemSchema = new mongoose.Schema({
//   productId:     { type: mongoose.Types.ObjectId, ref: 'Drug', required: true },
//   Name:          String,
//   SalePrice:     Number,
//   Picture:       String,
//   Category:      String,
//   BarcodeNumber: String,
//   quantity:      Number,
// });

// const OrderSchema = new mongoose.Schema({
//   browserId:      { type: String, required: true },
//   customer:       CustomerSchema,          // <- single object
//   items:          [OrderItemSchema],
//   totalAmount:    { type: Number, required: true },
//   status:         { type: String, enum: ['PENDING','SHIPPED','CONFIRMED'], default: 'PENDING' },
//   confirmationPin:{ type: String, default: () => Math.floor(100000 + Math.random()*900000).toString() },
// }, { timestamps: true });

// export default mongoose.model('Order', OrderSchema);
import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  number:   { type: String, required: true },
  address:  { type: String, required: true },
});

const OrderItemSchema = new mongoose.Schema({
  productId:     { type: mongoose.Types.ObjectId, ref: 'Drug', required: true },
  Name:          String,
  SalePrice:     Number,
  Picture:       String,
  Category:      String,
  BarcodeNumber: String,
  quantity:      Number,
});

const OrderSchema = new mongoose.Schema({
  customer:       CustomerSchema,
  items:          [OrderItemSchema],
  totalAmount:    { type: Number, required: true },
  status:         { type: String, enum: ['PENDING', 'SHIPPED', 'CONFIRMED'], default: 'PENDING' },
  confirmationPin:{ type: String, default: () => Math.floor(100000 + Math.random() * 900000).toString() },  // auto generated
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);
