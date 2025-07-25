import express from "express";
import User from "../models/loginmodel.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { Email, Password, Role } = req.body;

    const finuser = await User.findOne({ Email });

    if (!finuser) {
      return res.status(404).json({ message: "User not found" });
    }

      // const findspecific = await User.findOne({Email, Password, Role});
    const confirmpass =  Password === finuser.Password && Role === finuser.Role;
    // = Email === findspecific.Email && Password === findspecific.Password 

    if (confirmpass) {
      const token = jwt.sign({ Email }, "auth-token", { expiresIn: "1d" });
      res.status(200).json({
        message: "Login successful",
        success: true,
        token,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Your password or role is incorrect",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
