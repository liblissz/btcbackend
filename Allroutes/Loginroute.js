import express from "express";
import User from "../models/loginmodel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import tokenmodel from "../models/Authtoken.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

router.post("/", async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const finuser = await User.findOne({ Email });
    if (!finuser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isPasswordCorrect = Password === finuser.Password;
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    const token = jwt.sign({ Email: finuser.Email }, JWT_SECRET, { expiresIn: "1d" });

    const existingToken = await tokenmodel.findOne({ useremail: Email });

    if (existingToken) {
      await tokenmodel.findOneAndUpdate(
        { useremail: Email },
        { token },
        { new: true }
      );
    } else {
      await tokenmodel.create({ useremail: Email, token });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Authorization token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
    });
  }
}



router.get("/me/admin", authRequired, async (req, res) => {
  try {
    const { Email } = req.user;

    if (!Email) {
      return res.status(400).json({ success: false, message: "Invalid token payload" });
    }

    // Exclude password from response (case sensitive)
    const user = await User.findOne({ Email }).select("-Password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Fetch user error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});



router.get("/token", async (req, res)=>{
  try {
    const response = await tokenmodel.find();
    res.status(200).json({response})
  } catch (error) {

    res.status(500).json({message: "internal server error"})
    console.log(error);
    

  }
})

router.delete("/token", async (req, res)=>{
  try {
    const response = await tokenmodel.deleteMany();
    if(response){
    res.status(201).json({message: "deleted"})

    }
  } catch (error) {

    res.status(500).json({message: "internal server error"})
    console.log(error);
    

  }
})


router.post("/checktoken", async (req, res) => {
  try {
    const { UserEmail, token } = req.body;

    const normalizedEmail = UserEmail?.toLowerCase().trim();

    console.log("Incoming email:", normalizedEmail);
    console.log("Incoming token:", token);

    const findToken = await tokenmodel.findOne({
      useremail: normalizedEmail,
    });

    if (!findToken) {
      return res.status(400).json({ message: "You have not been given a session" });
    }

    console.log("DB token doc:", findToken);
    

    if (findToken.token !== token) {
      return res.status(401).json({ message: "You are not authorized to use this site" });
    }

    return res.status(200).json({ message: "You have been granted permission" });
  } catch (error) {
    console.error("Check token error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


export default router;
