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

import subscriber from './Allroutes/Subscriberoute.js'

import allorders from './Allroutes/AllOrders.js'

import SibApiV3Sdk from 'sib-api-v3-sdk';
import bodyParser from 'body-parser';
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

app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);
app.use('/vendors', vendors)
app.use('/allorders', allorders)
app.use("/subscriber", subscriber)

// drugid/:id
app.use('/ai/chat', chartbot)
app.use("/drugpurchsing", drugpurchsing)
app.use('/login', login)
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







