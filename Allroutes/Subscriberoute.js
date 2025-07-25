import subscribemodel from "../models/SubscriptionModel.js";
import e from "express";

const router = e()

router.post("/", async(req,res)=>{
    try {
        const { Email } = req.body
        const saveemail = subscribemodel({ Email })
        await saveemail.save()
        res.status(200).json({message: "subscribed sucessfully"})
    } catch (error) {
       console.log('====================================');
       console.log(error);
       console.log('===================================='); 
       res.status(500).json({message: "internal server error" + error})
    }
})

export default router