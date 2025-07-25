// // models/Order.js
// import mongoose from 'mongoose';
// import shortid from 'shortid';

// const OrderItemSchema = new mongoose.Schema({
//   productId: mongoose.Schema.Types.ObjectId,
//   Name: String,
//   SalePrice: Number,
//   Picture: String,
//   Category: String,
//   BarcodeNumber: String,
//   quantity: { type: Number, default: 1 },
// });
// const userschema = new mongoose.Schema({
//   name: {type: String, required: true},
//     email: {type: String, required: true},
//    number: {type: String, required: true},
//      illness: {type: String, required: true},
//        address: {type: String, required: true},
// })

// const OrderSchema = new mongoose.Schema({
//   browserId:      { type: String, required: true },
//   items:          [OrderItemSchema],
//   customer: [userschema],
//   totalAmount:    { type: Number, required: true },
//   confirmationPin:{ type: String, default: () => shortid.generate().toUpperCase() },
//   status:         { type: String, enum: ['PENDING','SHIPPED','CONFIRMED'], default: 'PENDING' },
// }, { timestamps: true });

// export default mongoose.model('Order', OrderSchema);














import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true },
  number:   { type: String, required: true },
  illness:  { type: String, required: true },
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
  browserId:      { type: String, required: true },
  customer:       CustomerSchema,          // <- single object
  items:          [OrderItemSchema],
  totalAmount:    { type: Number, required: true },
  status:         { type: String, enum: ['PENDING','SHIPPED','CONFIRMED'], default: 'PENDING' },
  confirmationPin:{ type: String, default: () => Math.floor(100000 + Math.random()*900000).toString() },
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);
