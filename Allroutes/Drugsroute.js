import e from "express";
import Drug from '../models/Drugs.js'

const router = e.Router();

router.get("/", async (req,res)=>{
    try {
        const alldrugs = await Drug.find().sort({DateOfInclusion: -1});
        res.status(200).json(alldrugs) 
    } catch (error) {
        res.status(500).json({message: "internal server error"})
        console.error(error);
        
    }
})
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const drug = await Drug.findById(id);

    if (!drug) {
      return res.status(404).json({ message: "Drug not found" });
    }

    
    res.status(200).json(drug);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
export default router