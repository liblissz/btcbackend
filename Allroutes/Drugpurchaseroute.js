import e from "express";
import DrugPurchase from "../models/DrugPurchase.js";

const router = e.Router();

router.get("/", async (req, res) => {
  try {
    // ✅ Use await to get the data from the database
    const allDrugPurchases = await DrugPurchase.find();

    res.status(200).json(allDrugPurchases);
  } catch (error) {
    console.error("Error fetching drug purchases:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
