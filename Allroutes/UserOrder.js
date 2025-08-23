import express from 'express';
import LoginModel from '../models/Login.js';
import User from '../models/loginmodel.js';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import Orders from '../models/Orders.js';

const router = express.Router();

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

router.post('/place', async (req, res) => {
  try {
    const { name, number, address, cart: cartFromClient } = req.body;

    let cartItems = [];

    if (Array.isArray(cartFromClient) && cartFromClient.length > 0) {
      cartItems = cartFromClient;
    } else if (number) {
      const userDoc = await LoginModel.findOne({ number });
      if (userDoc && Array.isArray(userDoc.userCat) && userDoc.userCat.length > 0) {
        cartItems = userDoc.userCat;
        userDoc.userCat = [];
        await userDoc.save();
      }
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (item.SalePrice * item.quantity),
      0
    );

    const newOrder = new Orders({
      customer: { name, number, address },  // no email or illness here
      items: cartItems,
      totalAmount,
      status: 'PENDING',
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);

    const admins = await User.find();
    for (const admin of admins) {
      if (!admin.Email) continue;

      try {
        const sendSmtpEmail = {
          sender: { email: 'vildashnetwork@gmail.com', name: 'BTC' },
          to: [{ email: admin.Email }],
          subject: `🚀 New Order: ${newOrder.customer.name}`,
          htmlContent: `
                  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>BTC Pharmacy | Order Notification</title>
</head>
<body style="margin:0; padding:0; background:#0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">

  <!-- Outer Wrapper -->
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#0a0a0a">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        
        <!-- Inner Card -->
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" 
          style="max-width:600px; background: linear-gradient(145deg,#0d0d0d,#1a1a1a); border-radius:20px; box-shadow:0 0 30px rgba(0,255,255,0.2); overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 30px; background: linear-gradient(90deg,#001f3f,#0056b3);">
              <h1 style="margin:0; font-size:34px; color:#ffffff; font-weight:800; letter-spacing:1px; text-shadow:0 0 12px rgba(0,255,255,0.8);">
                🚀 New BTC Pharmacy Order
              </h1>
              <p style="margin:10px 0 0; font-size:18px; color:#f0f0f0;">An order has just been placed securely via BTC</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="font-size:22px; margin-bottom:12px; color:#00e6e6;">📦 Order Details</h2>
              <h2 style="font-size:22px; margin-bottom:12px; color:#ffaa33;">👤 Customer Details</h2>

              <p style="color:#e6e6e6; font-size:16px; margin:8px 0;"><strong>Name:</strong> ${newOrder.customer.name}</p>
          
              <p style="color:#e6e6e6; font-size:16px; margin:8px 0;"><strong>Address:</strong> ${newOrder.customer.address}</p>
           
              <p style="color:#e6e6e6; font-size:16px; margin:8px 0;"><strong>Phone:</strong> ${newOrder.customer.number}</p>
              
              <hr style="border:0; border-top:1px solid #00e6e6; margin:20px 0;" />

              <!-- Loop Products -->
              ${
                newOrder.items.map(p => `
                  <div style="margin-bottom:20px; border:1px solid #333; padding:15px; border-radius:10px; background:#111;">
                    <img src="${p.Picture}" alt="Product Image" style="height:100px; border-radius:8px; box-shadow:0 0 12px rgba(0,255,255,0.3);" />
                    <p style="color:#fff; font-size:15px; margin:8px 0;"><strong>💰 Price:</strong> ${p.SalePrice}</p>
                    <p style="color:#ccc; font-size:15px; margin:8px 0;"><strong>📂 Category:</strong> ${p.Category}</p>
                    <p style="color:#ccc; font-size:15px; margin:8px 0;"><strong>🔖 Batch No:</strong> ${p.BarcodeNumber}</p>
                    <p style="color:#ccc; font-size:15px; margin:8px 0;"><strong>📦 Quantity:</strong> ${p.quantity}</p>
                  </div>
                `).join('')
              }

              <h2 style="color:#00e6e6; margin-top:20px;">💳 Payment Summary</h2>
              <p style="color:#e6e6e6; font-size:16px; margin:8px 0;"><strong>Total Amount:</strong> ${newOrder.totalAmount}</p>
              <p style="color:#e6e6e6; font-size:16px; margin:8px 0;"><strong>Status:</strong> ${newOrder.status}</p>
              <p style="color:#e6e6e6; font-size:16px; margin:8px 0;"><strong>Confirmation Pin:</strong> ${newOrder.confirmationPin}</p>
              <p style="color:#e6e6e6; font-size:16px; margin:8px 0;"><strong>Date Ordered:</strong> ${newOrder.createdAt}</p>

              <p style="margin-top:20px; font-size:14px; color:#999;">⚠️ This is an automated notification for BTC Admins only.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 25px; background:#0d0d0d; color:#777; font-size:13px;">
              <p style="margin:0; color:#888;">BTC Pharmacy © 2025 | All Rights Reserved</p>
              <p style="margin:5px 0 0;"><a href="mailto:infor@btcpharmacy.org" style="color:#00e6e6; text-decoration:none;">📧 infor@btcpharmacy.org</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
          `
        };
        await emailApi.sendTransacEmail(sendSmtpEmail);
        console.log(`📧 Email sent to: ${admin.Email}`);
      } catch (err) {
        console.error(`❌ Failed to email ${admin.Email}:`, err.message);
      }
    }

  } catch (error) {
    console.error('❌ Error placing order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
