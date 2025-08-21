import mongoose from "mongoose";

  const CartItemSchema = new mongoose.Schema({
    productId:     { type: mongoose.Types.ObjectId, ref: 'Drug', required: true },
    Name:          { type: String },
    SalePrice:     { type: Number },
    Picture:       { type: String },
    Category:      { type: String },
    BarcodeNumber: { type: String },
    quantity:      { type: Number, default: 1 }
  });

const loginSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true
        },
         number:{
            type: String,
            required: true
        },
         password:{
            type: String,
            required: true
        },
      location:{
            type: String,
            required: true
        },
        userCat: [CartItemSchema],
    },
    {timestamps: true}
);

const LoginModel = mongoose.model("LogedInUsers", loginSchema);


export default LoginModel