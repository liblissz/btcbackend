import e from "express";
import Vendor from "../models/vendormodel.js";

 const router = e.Router();


router.get("/", async(req, res)=>{
    try {
        const allvendors = await Vendor.find();
   res.status(200).json(allvendors)
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "internal server error"})
    }
})

export default router