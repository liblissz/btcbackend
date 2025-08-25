import mongoose, { mongo } from "mongoose";
import express from "express";
import env from "dotenv";
import cors from 'cors'
import patientroute from "./Allroutes/patientroutes.js";
import vendorroute from "./Allroutes/vendorroute.js";
import dugsroute from './Allroutes/Drugsroute.js'
import drugpurchsing from './Allroutes/Drugpurchaseroute.js'
import chartbot from './AImodules/AImodule.js'
import cartRoutes  from './Allroutes/cart.js';
import orderRoutes from './Allroutes/orders.js';
import login from './Allroutes/Loginroute.js'
import vendors from './Allroutes/vendorroute.js'
import purchase from './Allroutes/Drugpurchaseroute.js'
import balancesheet from './Allroutes/balancesheet.js'
import subscriber from './Allroutes/Subscriberoute.js'

import allorders from './Allroutes/AllOrders.js'
// import deleteall from './Allroutes/delete.js'
import loginuser from './Allroutes/NormalusersLogin.js'
import userorder from './Allroutes/UserOrder.js'
// import deletedrug from './Allroutes/deletedrug.js'
import Search from './Allroutes/Search.js'
import usercart from './Allroutes/usercart.js'
import SibApiV3Sdk from 'sib-api-v3-sdk';
import bodyParser from 'body-parser';
// import sms from './models/sms.js'
env.config({path : "./config.env"});

const app = express();

//middle wares
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY; 


app.use(express.json())
app.use(cors())

app.use("/patient", patientroute)
app.use("/vendors", vendorroute)
app.use("/drugs", dugsroute)
app.use('/purchase', purchase)
app.use("/api/search", Search);
// app.use('/delete', deleteall)
app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);
app.use('/vendors', vendors)
app.use('/allorders', allorders)
app.use("/subscriber", subscriber)
app.use("/balancesheet", balancesheet)
// app.use("/drugs/delete/id", deletedrug)
app.use("/loginnormal", loginuser)

app.use("/userorder", userorder)
// drugid/:id
app.use('/ai/chat', chartbot)
app.use("/drugpurchsing", drugpurchsing)
app.use('/login', login)
app.use('/usercart', usercart)
// app.use("/send-otp", sms)
const port = 2500;


//connecting to mongodb

const connectdb = async ()=>{
try {
  await mongoose.connect(process.env.url)
  console.log('====================================');
  console.log("database connected sucessfully");
  console.log('====================================');
} catch (error) {
 console.log('====================================');
 console.log(error);
 console.log('====================================');
}
}


connectdb().then(()=>{
    app.listen(port,()=>{
console.log('====================================');
console.log(`server listening at http://localhost:${port}`);
console.log('====================================');
    })
})








