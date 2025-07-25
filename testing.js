import mongoose from 'mongoose';
import env from "dotenv";
import express from "express";
import cors from 'cors';

const app = express();
env.config({ path: "./config.env" });

app.use(express.json());
app.use(cors());

// MongoDB connection
const connectdb = async () => {
    try {
      await mongoose.connect("mongodb+srv://vildashnetwork02:goldblissz@zozaccomunity.qx1vsv7.mongodb.net/HospitalDB?retryWrites=true&w=majority&appName=ZOZACCOMUNITY");

        console.log("✅ Database connected successfully");
    } catch (err) {
        console.error("❌ DB connection error:", err.message);
    }
};

// Patient model (loose schema)
const Patient = mongoose.model('Patient', new mongoose.Schema({}, { strict: false, collection: 'Patients' }));

// GET all patients
app.get('/Patients', async (req, res) => {
  try {
    const allpatients = await Patient.find();
    console.log("✅ Patients from DB:", allpatients);  // Log result to console
    res.status(200).json(allpatients);
  } catch (error) {
    console.error("❌ Error fetching patients:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false, collection: 'Vendors' }));

// GET all patients
app.get('/allVendors', async (req, res) => {
  try {
    const allVendors = await Vendor.find();
    console.log("✅ Patients from DB:", allVendors);  // Log result to console
    res.status(200).json(allVendors);
  } catch (error) {
    console.error("❌ Error fetching patients:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});



const Drug = mongoose.model('Drug', new mongoose.Schema({}, { strict: false, collection: 'Drugs' }));

// GET all patients
app.get('/Drug', async (req, res) => {
  try {
    const allDrug = await Drug.find();
    console.log("✅ drugs from DB:", allDrug);  // Log result to console
    res.status(200).json(allDrug);
  } catch (error) {
    console.error("❌ Error fetching patients:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});




const DrugPurchase = mongoose.model('DrugPurchase', new mongoose.Schema({}, { strict: false, collection: 'DrugPurchase' }));

// GET all patients
app.get('/DrugPurchase', async (req, res) => {
  try {
    const allDrugPurchase = await DrugPurchase.find();
    console.log("✅ drugs from DB:", allDrugPurchase);  // Log result to console
    res.status(200).json(allDrugPurchase);
  } catch (error) {
    console.error("❌ Error fetching patients:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});




// Start server after DB connection
connectdb().then(() => {
    app.listen(1000, () => {
        console.log("🚀 Server running on port 1000");
    });
});
