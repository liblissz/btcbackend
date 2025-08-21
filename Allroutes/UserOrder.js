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
            <h1 style="color: orange;">🚀 New Order</h1>
            <p><strong>Name:</strong> ${newOrder.customer.name}</p>
            <p><strong>Number:</strong> ${newOrder.customer.number}</p>
            <p><strong>Address:</strong> ${newOrder.customer.address}</p>
            <h2>Order Items</h2>
            ${newOrder.items.map(p => `
              <div>
                <p><strong>${p.Name}</strong> - ${p.SalePrice} x ${p.quantity}</p>
              </div>
            `).join('')}
            <p><strong>Total Amount:</strong> ${newOrder.totalAmount}</p>
            <p><strong>Status:</strong> ${newOrder.status}</p>
            <p><strong>Confirmation PIN:</strong> ${newOrder.confirmationPin}</p>
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
