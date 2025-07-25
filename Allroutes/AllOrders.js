// Allroutes/adminOrders.js
import express from 'express';
import Order from '../models/Orders.js';

const router = express.Router();

/**
 * GET /allorders
 * Admin‑only: returns EVERY order.
 * No headers, no filters.
 */
router.get('/', async (req, res) => {
  try {
    const allOrders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(allOrders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const specificOrder = await Order.findById(id);

    if (!specificOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(specificOrder);
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    //  CastError means the id was invalid format
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
