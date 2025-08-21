import express from "express";
import Drug from "../models/Drugs.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query) {
      return res.status(400).json({ message: "No query provided" });
    }

    // Partial, case-insensitive match
    const result = await Drug.find({
      Name: { $regex: query, $options: "i" }
    });

    if (result) {
      res.json({ data: result });
    } else {
      res.status(404).json({ message: "No results found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
