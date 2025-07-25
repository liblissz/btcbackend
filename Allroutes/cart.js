// routes/cart.js
import express from 'express';
import Cart from '../models/Cart.js';
import Drug from '../models/Drugs.js'; // Make sure this correctly imports the Drug model

const router = express.Router();

// Middleware to get or create cart using browserId
async function getCart(req, res, next) {
  const browserId = req.header('X-Browser-Id');
  if (!browserId) return res.status(400).send('Missing browserId header');
  
  let cart = await Cart.findOne({ browserId });
  if (!cart) cart = await Cart.create({ browserId, items: [] });

  req.cart = cart;
  next();
}

// Add to cart - includes product details snapshot
router.post('/add', getCart, async (req, res) => {
  const { productId, quantity } = req.body;

  // Check if item already in cart
  let item = req.cart.items.find(i => i.productId.equals(productId));

  if (item) {
    item.quantity += quantity;
  } else {
    const drug = await Drug.findById(productId);
    if (!drug) return res.status(404).send('Product not found');
   
   req.cart.items.push({
  productId,
  Name: drug.Name || '',
  SalePrice: drug.SalePrice || 0,
  Picture: drug.Picture || '',
  Category: drug.Category || '',
  BarcodeNumber: drug.BarcodeNumber || ''
});


  }

  await req.cart.save();
  res.json(req.cart);
});

// Get cart
router.get('/', getCart, (req, res) => {
  res.json(req.cart);
});

// Remove item from cart
router.post('/remove', getCart, async (req, res) => {
  const { productId } = req.body;
  req.cart.items = req.cart.items.filter(i => !i.productId.equals(productId));
  await req.cart.save();
  res.json(req.cart);
});

// Update quantity
router.post('/update', getCart, async (req, res) => {
  const { productId, quantity } = req.body;
  const item = req.cart.items.find(i => i.productId.equals(productId));

  if (item) {
    item.quantity = quantity;
    if (item.quantity <= 0) {
      req.cart.items = req.cart.items.filter(i => !i.productId.equals(productId));
    }
    await req.cart.save();
  }

  res.json(req.cart);
});

export default router;






























// // routes/cart.js
// import express from 'express';
// import Cart from '../models/Cart.js';
// import Drug from '../models/Drugs.js'; // Make sure this correctly imports the Drug model

// const router = express.Router();

// // Middleware to get or create cart using browserId
// async function getCart(req, res, next) {
//   const browserId = req.header('X-Browser-Id');
//   if (!browserId) return res.status(400).send('Missing browserId header');
  
//   let cart = await Cart.findOne({ browserId });
//   if (!cart) cart = await Cart.create({ browserId, items: [] });

//   req.cart = cart;
//   next();
// }

// // Add to cart - includes product details snapshot
// router.post('/add', getCart, async (req, res) => {
//   const { productId, quantity } = req.body;

//   // Check if item already in cart
//   let item = req.cart.items.find(i => i.productId.equals(productId));

//   if (item) {
//     item.quantity += quantity;
//   } else {
//     const drug = await Drug.findById(productId);
//     if (!drug) return res.status(404).send('Product not found');
   
//    req.cart.items.push({
//   productId,
//   Name: drug.Name || '',
//   SalePrice: drug.SalePrice || 0,
//   Picture: drug.Picture || '',
//   Category: drug.Category || '',
//   BarcodeNumber: drug.BarcodeNumber || ''
// });

//   }

//   await req.cart.save();
//   res.json(req.cart);
// });

// // Get cart
// router.get('/', getCart, (req, res) => {
//   res.json(req.cart);
// });

// // Remove item from cart
// router.post('/remove', getCart, async (req, res) => {
//   const { productId } = req.body;
//   req.cart.items = req.cart.items.filter(i => !i.productId.equals(productId));
//   await req.cart.save();
//   res.json(req.cart);
// });

// // Update quantity
// router.post('/update', getCart, async (req, res) => {
//   const { productId, quantity } = req.body;
//   const item = req.cart.items.find(i => i.productId.equals(productId));

//   if (item) {
//     item.quantity = quantity;
//     if (item.quantity <= 0) {
//       req.cart.items = req.cart.items.filter(i => !i.productId.equals(productId));
//     }
//     await req.cart.save();
//   }

//   res.json(req.cart);
// });

// export default router;
