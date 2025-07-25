import e from "express";
import Patient from "../models/patientmodel.js";



const router = e.Router();

router.get("/", async (req,res)=>{

    try {
        const allpatient = await Patient.find();
        res.status(200).json(allpatient);
        
    } catch (error) {
        res.status(500).json({message: "internal server error"})
        console.error(error);  
    }
})

export default router