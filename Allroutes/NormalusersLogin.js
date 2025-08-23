import e from "express";
import jwt from "jsonwebtoken";
import LoginModel from "../models/Login.js";
import bycrypt from 'bcrypt'
import { jwtDecode } from "jwt-decode";

const router = e();

const hashRounds = 6;
const JWT_SECRET = "auth-token";



router.post('/', async (req, res) => {
    try {
        const { name, number, password, location } = req.body;
  if (!name || !number || !password || !location) {
      return res.status(400).json({ message: "name, number and password are required" });
    }
       

        const checkuser = await LoginModel.findOne({number})
        if(checkuser){
             res.status(400).json({message: "account already taken"})
        }
        
        else{
            const encryptpass = await bycrypt.hash(password, hashRounds);
        const saveuser = LoginModel({ name, number, password: encryptpass, location })

        await saveuser.save();

   const token = jwt.sign({ number }, JWT_SECRET, { expiresIn: "1d" });
      
    return res.status(201).json({
      message: "account created successfully",
      success: true,
      token,
    });

        }  
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" });
    }

});


router.get("/", async (req,res)=>{
    try{
  const allusers = await LoginModel.find().sort({createdAt: -1})
 res.status(200).json(allusers)
    }catch(error){
        res.status(500).json({message: "internal server error"})
     console.log(error);
     
    }
})

router.delete("/", async (req,res)=>{
    try {
        await LoginModel.deleteMany({});
         res.status(201).json({message: "deleted successfully"})
    } catch (error) {
        res.status(500).json({message: "internal server error"})
    }
})


function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "authorization token missing" });
    }

    // Verify the token signature and expiration
    const decoded = jwt.verify(token, JWT_SECRET);
    // Expecting { number } from your sign payload
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "token expired" });
    }
    return res.status(401).json({ message: "invalid token" });
  }
}



router.get("/me", authRequired, async (req, res) => {
  try {
    const { number } = req.user;

    if (!number) {
      return res.status(400).json({ message: "invalid token payload" });
    }

    // Fetch the user by number and exclude the password
    const user = await LoginModel.findOne({ number }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "internal server error" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { number, password } = req.body;

    const check = await LoginModel.findOne({ number: number});
    if (!check) {
      return res.status(404).json({ message: "User not found" });
    }

    const confirmpass = await bycrypt.compare(password, check.password);
    if (!confirmpass) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ number }, "auth-token", { expiresIn: "1d" });
    return res.status(200).json({
      message: "Login successfully",
      success: true,
      token,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error});
  }
});

router.put("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let { name, number, password } = req.body;

    // Hash password if provided
    if (password) {
      password = await bycrypt.hash(password, 6);
    }

    const updatedUser = await LoginModel.findByIdAndUpdate(
      id,
      { name, number, password },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    
    res.status(200).json({
      message: "User updated successfully",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router