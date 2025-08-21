// routes/userCart.js
import express from "express";
import mongoose from "mongoose";
import LoginModel from "../models/Login.js"; // adjust path to your model
import Drug from "../models/Drugs.js";       // adjust path to your product model
import { authRequired } from "./authMiddleware.js"; // your middleware

const router = express.Router();

// helper to get user from token payload (authRequired must set req.user)
async function getUserFromReq(req) {
  const { number } = req.user || {};
  if (!number) throw new Error("Invalid token payload");
  const user = await LoginModel.findOne({ number });
  if (!user) throw new Error("User not found");
  return user;
}

/**
//  * POST  /user/cart/add
//  * Body: { productId, quantity = 1 }
//  */
router.post("/add", authRequired, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid or missing productId" });
    }

    const user = await getUserFromReq(req);

    // snapshot product info from Drug collection
    const drug = await Drug.findById(productId);
    if (!drug) return res.status(404).json({ message: "Product not found" });

    const idx = user.userCat.findIndex(
      (it) => it.productId && it.productId.toString() === productId.toString()
    );

    if (idx >= 0) {
      // increase quantity
      user.userCat[idx].quantity += Number(quantity);
    } else {
      user.userCat.push({
        productId,
        Name: drug.Name || "",
        SalePrice: drug.SalePrice || 0,
        Picture: drug.Picture || "",
        Category: drug.Category || "",
        BarcodeNumber: drug.BarcodeNumber || "",
        quantity: Number(quantity) || 1,
      });
    }

    await user.save();
    return res.status(200).json({ message: "Cart updated", cart: user.userCat });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
});

/**
 * GET /user/cart
 * returns user's cart array
 */
router.get("/", authRequired, async (req, res) => {
  try {
    const user = await getUserFromReq(req);
    return res.status(200).json({ cart: user.userCat || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
});

/**
 * POST /user/cart/remove
 * Body: { productId }
 */
router.post("/remove", authRequired, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid or missing productId" });
    }
    const user = await getUserFromReq(req);
    user.userCat = user.userCat.filter(
      (it) => !(it.productId && it.productId.toString() === productId.toString())
    );
    await user.save();
    return res.status(200).json({ message: "Item removed", cart: user.userCat });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
});

/**
 * POST /user/cart/update
 * Body: { productId, quantity }
 */
router.post("/update", authRequired, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid or missing productId" });
    }
    const qty = Number(quantity);
    if (Number.isNaN(qty)) return res.status(400).json({ message: "Invalid quantity" });

    const user = await getUserFromReq(req);
    const idx = user.userCat.findIndex(
      (it) => it.productId && it.productId.toString() === productId.toString()
    );

    if (idx === -1) return res.status(404).json({ message: "Item not found in cart" });

    if (qty <= 0) {
      user.userCat.splice(idx, 1);
    } else {
      user.userCat[idx].quantity = qty;
    }

    await user.save();
    return res.status(200).json({ message: "Cart updated", cart: user.userCat });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
});

/**
 * POST /user/cart/clear
 * Clears the whole cart
 */
router.post("/clear", authRequired, async (req, res) => {
  try {
    const user = await getUserFromReq(req);
    user.userCat = [];
    await user.save();
    return res.status(200).json({ message: "Cart cleared", cart: [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
});

export default router;
