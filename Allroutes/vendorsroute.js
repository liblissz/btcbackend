import Vendor from "../models/vendormodel.js";
import e from "express";

const router = e();

router.get('/', async (req,res)=>{
    try {
        const allvendors = await Vendor.find();
        res.status(200).json(allvendors)
        
    } catch (error) {
        res.status(500).json({message: "internal server error"});
    }
})
export default router