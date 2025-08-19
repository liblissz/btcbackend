
import express from 'express';
import Order from '../models/Orders.js';
import Cart from '../models/Cart.js';
import PDFDocument from 'pdfkit';
import User from '../models/loginmodel.js';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import bodyParser from 'body-parser';

import QRCode  from 'qrcode'

const router = express.Router();

// Middleware: get browserId from header
function getBrowserId(req, res, next) {
  const browserId = req.header('X-Browser-Id');

  if (!browserId) return res.status(400).json({ error: 'Missing X-Browser-Id header' });
  req.browserId = browserId;
  next();
}
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY; 


const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();
// POST /orders/place - create an order from current cart
router.post('/place', getBrowserId, async (req, res) => {
  try {
    const { name, email, number, illness, address } = req.body;
    const browserId = req.browserId;
    const cart = await Cart.findOne({ browserId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.SalePrice * item.quantity,
      0
    );

    const orderItems = cart.items.map(item => ({
      productId:     item.productId,
      Name:          item.Name,
      SalePrice:     item.SalePrice,
      Picture:       item.Picture,
      Category:      item.Category,
      BarcodeNumber: item.BarcodeNumber,
      quantity:      item.quantity,
    }));

    // build the Order document with customer embedded
    const newOrder = new Order({
      browserId,
      customer: { name, email, number, illness, address },
      items:    orderItems,
      totalAmount,
      status:   'PENDING',
    });

    const savedOrder = await newOrder.save();

    // clear the cart afterward
    cart.items = [];
    await cart.save();

    res.status(201).json(savedOrder);




    

 const admins = await User.find();
   for (const admin of admins) {
    console.log(admin.Email);
    
  const adminEmail = admin.Email ; // try both common casings
  if (!adminEmail) {
    console.warn('⚠️ Skipping admin without email:', admin);
    continue;
  }
        try {
          const sendSmtpEmail = {
            sender: { email: 'vildashnetwork@gmail.com', name: 'BTC' },
            to: [{ email: adminEmail }],
            subject: `🚀 New Order Made to  BTC PHARMACY: ${newOrder.customer.name}`,
            htmlContent: `
              <!DOCTYPE html>
              <html lang="en">
              <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Pefscom Posts Notification</title></head>
              <body>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#000000">
                  <tr><td align="center" style="padding: 20px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; background: linear-gradient(135deg, #000000 0%, #1c1c1c 100%); border-radius: 8px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,255,0.3);">
                      <tr><td align="center">
                       <div style="padding: 20px; text-align: center; color: orange;">
                          <h1 style="font-size: 36px; font-weight: 700; font-family: 'Georgia', serif; text-shadow: 0 0 10px rgba(0, 81, 255, 0.9);">🚀 New Order Notification</h1>
                          <p style="font-size: 18px;">A new Order Has Been Made to BTC</p>
                        </div>
                         </td></tr>
                      <tr><td style="padding: 0 30px 30px;">
                        <h2 style="color: orange; font-family: 'Georgia', serif; font-size: 24px; margin-bottom: 10px;"> Order Details</h2>
                  <h2 style="color: orange; font-family: 'Georgia', serif; font-size: 24px; margin-bottom: 10px;"> 
                  Customer Details</h2>
                 
                        <p><strong>Customer Name:</strong> ${newOrder.customer.name}</p>
                        <p style="color: orange;"><strong>Email:</strong> ${newOrder.customer.email}</p>
                        <p style="color: orange;"><strong>Address:</strong> ${newOrder.customer.address}</p>
                        <p style="color: orange;"><strong>Illness Details:</strong> ${newOrder.customer.illness}</p>
                        <hr style="border-color: blue;">
                          <p style="color: orange;"><strong>Number:</strong> ${newOrder.customer.number}</p>

               ${
  newOrder.items.map(p => `
    <img src="${p.Picture}" alt="Product Image" style="height: 100px;"/>
    <p><strong>Sale Price:</strong> ${p.SalePrice}</p>
    <p style="color: orange;"><strong>Category:</strong> ${p.Category}</p>
    <p style="color: orange;"><strong>Batch Number:</strong> ${p.BarcodeNumber}</p>
    <hr style="border-color: blue;">
    <p style="color: orange;"><strong>Quantity:</strong> ${p.quantity}</p>
  `).join('')
}


                          <p style="color: orange;"><strong>BrowserID:</strong> ${newOrder.browserId}</p>
                          <p style="color: orange;"><strong>Total Amount:</strong> ${newOrder.totalAmount}</p>
                          <p style="color: orange;"><strong>Status:</strong> ${newOrder.status}</p>
                          <p style="color: orange;"><strong>Confirmation Pin:</strong> ${newOrder.confirmationPin}</p>
                          <p style="color: orange;"><strong>Date Ordered:</strong> ${newOrder.createdAt}</p>
                         

                          <p style="font-size: 0.9em; color: orange;">This is an automatic notification to BTC admins.</p>
                      </td></tr>
                      <tr><td align="center" style="padding: 20px; background: #111; color: orange; font-size: 14px;">
                        <p style="margin: 0;">btc &copy; 2025 | All rights reserved</p>
                        <p style="margin: 0;">Contact us: <a href="mailto:infor@btc.org" style="color: #1e90ff; text-decoration: none;">infor@btcpharmacy.org</a></p>
                      </td></tr>
                    </table>
                  </td></tr>
                </table>
              </body>
              </html>
            `
          };
          const result = await emailApi.sendTransacEmail(sendSmtpEmail);
          console.log(`📧 Email sent to: ${adminEmail} | MessageId: ${result.messageId}`);
        } catch (emailErr) {
          console.error(`❌ Failed to email ${adminEmail}:`, emailErr.message);
        }
      }
      

  } catch (error) {
    console.error('❌ Error placing order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});












// GET /orders - get all orders for browserId
router.get('/', getBrowserId, async (req, res) => {
  try {
    const orders = await Order.find({ browserId: req.browserId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /orders/:orderId - get details of a single order
router.get('/:orderId', getBrowserId, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, browserId: req.browserId }).populate('items.productId', 'Name SalePrice');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/updatestatus/:id', async (req, res) => {
  try {
    const { pin } = req.body;
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.confirmationPin !== pin) {
      return res.status(400).json({ message: "Incorrect confirmation PIN" });
    }

    // PIN is correct, update status
    order.status = 'CONFIRMED';
    await order.save();

    res.status(200).json({ message: "Order confirmed successfully", order });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});





router.patch('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['PENDING','SHIPPED','CONFIRMED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

  

  const order = await Order.findByIdAndUpdate(req.params.orderId, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
    
  
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});











router.get('/receipt/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ _id: orderId })
      .populate('items.productId', 'Name Category BarcodeNumber Picture SalePrice');

    if (!order) return res.status(404).json({ error: 'Order not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${orderId}.pdf`);

    const doc = new PDFDocument({ size: 'A4', margins: { top: 60, bottom: 60, left: 50, right: 50 } });
    doc.pipe(res);

    // Compose text for QR code
    let qrText = `BTC PHARMACY RECEIPT\n\nOrder ID: ${order._id}\nDate: ${order.createdAt.toLocaleString()}\nStatus: ${order.status}\nPIN: ${order.confirmationPin}\n\nItems:\n`;
    order.items.forEach(item => {
      const lineTotal = item.quantity * item.SalePrice;
      qrText += `${item.Name} | Qty: ${item.quantity} | Unit: ${item.SalePrice} | Total: ${lineTotal}\n`;
    });
    qrText += `\nGRAND TOTAL: ${order.totalAmount.toFixed(2)} FCFA`;

    const qrImageBuffer = await QRCode.toBuffer(qrText, { type: 'png' });

    // Header
    doc
      .fontSize(32)
      .fillColor('#000')
      .text('BTC PHARMACY', 180, 40)
      .fontSize(10)
      .fillColor('#555')
      .text('123 Health St, Wellness City', { align: 'right' })
      .text('Phone: +237 123 456 789', { align: 'right' })
      .moveDown(2);

    // Title box
    doc
      .rect(50, 120, doc.page.width - 100, 30)
      .fill('#004080')
      .fillColor('#fff')
      .fontSize(16)
      .text('OFFICIAL RECEIPT', 0, 126, { align: 'center' })
      .moveDown(2)
      .fillColor('#000');

    // Metadata
    const metaY = 165;
    doc
      .fontSize(10)
      .text(`Order ID: `, 50, metaY, { continued: true })
      .font('Helvetica-Bold').text(order._id)
      .font('Helvetica')
      .text(`Date: `, 50, metaY + 15, { continued: true })
      .font('Helvetica-Bold').text(order.createdAt.toLocaleString())
      .font('Helvetica')
      .text(`Status: `, 300, metaY, { continued: true })
      .font('Helvetica-Bold').text(order.status)
      .font('Helvetica')
      .text(`PIN: `, 300, metaY + 15, { continued: true })
      .font('Helvetica-Bold').text(order.confirmationPin)
     
      .moveDown(2)
 

      .font('Helvetica')
      .text(`Customer Name: `, 700, metaY + 16, { continued: true })
      .font('Helvetica-Bold').text(order.customer.Name)
       .font('Helvetica')
      .text(`Address: `, 700, metaY, { continued: true })
      .font('Helvetica-Bold').text(order.customer.address);
    // Table header
    const tableTop = 210;
    const cols = { name: 50, cat: 200, barcode: 300, qty: 380, unit: 430, total: 500 };
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Item', cols.name, tableTop)
      .text('Category', cols.cat, tableTop)
      .text('Barcode', cols.barcode, tableTop)
      .text('Qty', cols.qty, tableTop, { width: 30, align: 'center' })
      .text('Unit Price', cols.unit, tableTop, { width: 60, align: 'center' })
      .text('Line Total', cols.total, tableTop, { width: 60, align: 'center' });

    doc.moveTo(50, tableTop + 15).lineTo(doc.page.width - 50, tableTop + 15).stroke('#ccc');

    // Table rows
    let y = tableTop + 25;
    doc.font('Helvetica').fontSize(10).fillColor('#333');
    order.items.forEach(item => {
      const lineTotal = item.quantity * item.SalePrice;
      doc
        .text(item.Name, cols.name, y)
        .text(item.Category, cols.cat, y)
        .text(item.BarcodeNumber, cols.barcode, y)
        .text(item.quantity.toString(), cols.qty, y, { width: 30, align: 'center' })
        .text(item.SalePrice.toFixed(2), cols.unit, y, { width: 60, align: 'center' })
        .text(lineTotal.toFixed(2), cols.total, y, { width: 60, align: 'center' });
      y += 20;
      if (y > doc.page.height - 150) {
        doc.addPage();
        y = 60;
      }
    });

    // Grand total
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(`GRAND TOTAL: ${order.totalAmount.toFixed(2)} FCFA`, 50, y + 20, { align: 'right' });

    // QR Code below grand total
const qrWidth = 100;
const rightX = doc.page.width - qrWidth - 100; // pushed further left
doc.image(qrImageBuffer, rightX, y + 50, { width: qrWidth });


    // Footer
    doc
      .fontSize(8)
      .fillColor('#777')
      .text(
        'Thank you for choosing BTC Pharmacy! We wish you good health. www.btc-pharmacy.com',
        50,
        doc.page.height - 60,
        { align: 'center' }
      );

    doc.end();
  } catch (err) {
    console.error('❌ Error generating receipt PDF with QR code:', err);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

































export default router;
















































// import express from 'express';
// import Order from '../models/Orders.js';
// import Cart from '../models/Cart.js';
// import PDFDocument from 'pdfkit';
// const router = express.Router();

// // Middleware: get browserId from header
// function getBrowserId(req, res, next) {
//   const browserId = req.header('X-Browser-Id');
//   if (!browserId) return res.status(400).json({ error: 'Missing X-Browser-Id header' });
//   req.browserId = browserId;
//   next();
// }

// // POST /orders/place - create an order from current cart
// router.post('/place', getBrowserId, async (req, res) => {
//   try {
//     const { name, email, number, illness, address } = req.body;
//     const browserId = req.browserId;
//     const cart = await Cart.findOne({ browserId });

//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ error: 'Cart is empty' });
//     }

//     const totalAmount = cart.items.reduce(
//       (sum, item) => sum + item.SalePrice * item.quantity,
//       0
//     );

//     const orderItems = cart.items.map(item => ({
//       productId:     item.productId,
//       Name:          item.Name,
//       SalePrice:     item.SalePrice,
//       Picture:       item.Picture,
//       Category:      item.Category,
//       BarcodeNumber: item.BarcodeNumber,
//       quantity:      item.quantity,
//     }));

//     // build the Order document with customer embedded
//     const newOrder = new Order({
//       browserId,
//       customer: { name, email, number, illness, address },
//       items:    orderItems,
//       totalAmount,
//       status:   'PENDING',
//     });

//     const savedOrder = await newOrder.save();

//     // clear the cart afterward
//     cart.items = [];
//     await cart.save();

//     res.status(201).json(savedOrder);
//   } catch (error) {
//     console.error('❌ Error placing order:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });












// // GET /orders - get all orders for browserId
// router.get('/', getBrowserId, async (req, res) => {
//   try {
//     const orders = await Order.find({ browserId: req.browserId }).sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // GET /orders/:orderId - get details of a single order
// router.get('/:orderId', getBrowserId, async (req, res) => {
//   try {
//     const order = await Order.findOne({ _id: req.params.orderId, browserId: req.browserId }).populate('items.productId', 'Name SalePrice');
//     if (!order) return res.status(404).json({ error: 'Order not found' });
//     res.json(order);
//   } catch (error) {
//     console.error('Error fetching order:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


// router.post('/updatestatus/:id', async (req, res) => {
//   try {
//     const { pin } = req.body;
//     const { id } = req.params;

//     const order = await Order.findById(id);

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     if (order.confirmationPin !== pin) {
//       return res.status(400).json({ message: "Incorrect confirmation PIN" });
//     }

//     // PIN is correct, update status
//     order.status = 'CONFIRMED';
//     await order.save();

//     res.status(200).json({ message: "Order confirmed successfully", order });
//   } catch (error) {
//     console.error("Error updating status:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });








// // PATCH /orders/:orderId/status - update order status
// router.patch('/:orderId/status', async (req, res) => {
//   try {
//     const { status } = req.body;
//     if (!['PENDING','SHIPPED','CONFIRMED'].includes(status)) {
//       return res.status(400).json({ error: 'Invalid status' });
//     }

  

//   const order = await Order.findByIdAndUpdate(req.params.orderId, { status }, { new: true });
//     if (!order) return res.status(404).json({ error: 'Order not found' });
//     res.json(order);
    
  
//   } catch (error) {
//     console.error('Error updating order status:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });









// // router.get('/receipt/:orderId', getBrowserId, async (req, res) => {
// //   try {
// //     const { orderId } = req.params;
// //     const order = await Order.findOne({
// //       _id: orderId,
// //       browserId: req.browserId
// //     }).populate('items.productId', 'Name Category BarcodeNumber Picture');

// //     if (!order) {
// //       return res.status(404).json({ error: 'Order not found' });
// //     }

// //     // PDF response headers
// //     res.setHeader('Content-Type', 'application/pdf');
// //     res.setHeader(
// //       'Content-Disposition',
// //       `attachment; filename=receipt-${orderId}.pdf`
// //     );

// //      const doc = new PDFDocument({ size: 'A4', margins: { top: 60, bottom: 60, left: 50, right: 50 } });
// //     doc.pipe(res);


    
// //     // --- HEADER ---
// //     doc.fontSize(20).text('BTC Pharmacy Receipt', { align: 'center' });
// //     doc.moveDown(0.5);
// //     doc.fontSize(12)
// //        .text(`Order ID:        ${order._id}`)
// //        .text(`Browser ID:      ${order.browserId}`)
// //        .text(`Confirmation PIN:${order.confirmationPin}`)
// //        .text(`Status:          ${order.status}`)
// //        .text(`Date:            ${order.createdAt.toLocaleString()}`)
// //        .moveDown();

// //     // --- TABLE HEADER ---
// //     const tableTop = doc.y + 10;
// //     const cols = { name: 40, category: 200, barcode: 310, qty: 400, unit: 440, line: 500 };
// //     doc.font('Helvetica-Bold');
// //     doc.text('Name',       cols.name,     tableTop);
// //     doc.text('Category',   cols.category, tableTop);
// //     doc.text('Barcode',    cols.barcode,  tableTop);
// //     doc.text('Qty',        cols.qty,      tableTop, { width: 30, align: 'right' });
// //     doc.text('Unit',       cols.unit,     tableTop, { width: 50, align: 'right' });
// //     doc.text('Line Total', cols.line,     tableTop, { width: 70, align: 'right' });
// //     doc.moveDown(0.5).font('Helvetica');

// //     // --- TABLE ROWS ---
// //     order.items.forEach(item => {
// //       const y = doc.y;
// //       const lineTotal = item.quantity * item.SalePrice;
// //       doc.text(item.Name,               cols.name,     y);
// //       doc.text(item.Category,           cols.category, y);
// //       doc.text(item.BarcodeNumber,      cols.barcode,  y);
// //       doc.text(item.quantity,           cols.qty,      y, { width: 30, align: 'right' });
// //       doc.text(`${item.SalePrice}`,     cols.unit,     y, { width: 50, align: 'right' });
// //       doc.text(`${lineTotal}`,          cols.line,     y, { width: 70, align: 'right' });
// //       doc.moveDown();
// //     });

// //     // --- GRAND TOTAL ---
// //     doc.moveDown(1);
// //     doc.font('Helvetica-Bold')
// //        .text(`Total Amount: ${order.totalAmount} FCFA`, { align: 'right' });

// //     doc.end();
// //   } catch (err) {
// //     console.error('❌ Error generating receipt PDF:', err);
// //     res.status(500).json({ error: 'Failed to generate receipt' });
// //   }
// // });






// router.get('/receipt/:orderId', getBrowserId, async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const order = await Order.findOne({ _id: orderId, browserId: req.browserId })
//       .populate('items.productId', 'Name Category BarcodeNumber Picture SalePrice');

//     if (!order) return res.status(404).json({ error: 'Order not found' });

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=receipt-${orderId}.pdf`);

//     const doc = new PDFDocument({ size: 'A4', margins: { top: 60, bottom: 60, left: 50, right: 50 } });
//     doc.pipe(res);

   
//     // Header
//     doc
    
//       .fontSize(32)
//       .fillColor('#000')
//       .text('BTC PHARMACY', 180, 40)
//       .fontSize(10)
//       .fillColor('#555')
//       .text('123 Health St, Wellness City', { align: 'right' })
//       .text('Phone: +237 123 456 789', { align: 'right' })
//       .moveDown(2);

//     // Title box
//     doc
//       .rect(50, 120, doc.page.width - 100, 30)
//       .fill('#004080')
//       .fillColor('#fff')
//       .fontSize(16)
//       .text('OFFICIAL RECEIPT', 0, 126, { align: 'center' })
//       .moveDown(2)
//       .fillColor('#000');

//     // Metadata
//     const metaY = 165;
//     doc
//       .fontSize(10)
//       .text(`Order ID: `, 50, metaY, { continued: true }).font('Helvetica-Bold').text(order._id)
//       .font('Helvetica')
//       .text(`Date: `, 50, metaY + 15, { continued: true }).font('Helvetica-Bold').text(order.createdAt.toLocaleString())
//       .font('Helvetica')
//       .text(`Status: `, 300, metaY, { continued: true }).font('Helvetica-Bold').text(order.status)
//       .font('Helvetica')
//       .text(`PIN: `, 300, metaY + 15, { continued: true }).font('Helvetica-Bold').text(order.confirmationPin)
//       .moveDown(2);

//     // Table header
//     const tableTop = 210;
//     const cols = { name:50, cat:200, barcode:300, qty:380, unit:430, total:500 };
//     doc
//       .font('Helvetica-Bold')
//       .fontSize(10)
//       .text('Item', cols.name, tableTop)
//       .text('Category', cols.cat, tableTop)
//       .text('Barcode', cols.barcode, tableTop)
//       .text('Qty', cols.qty, tableTop, { width:30, align:'right' })
//       .text('Unit Price', cols.unit, tableTop, { width:60, align:'right' })
//       .text('Line Total', cols.total, tableTop, { width:60, align:'right' });

//     doc.moveTo(50, tableTop+15).lineTo(doc.page.width-50, tableTop+15).stroke('#ccc');

//     // Table rows
//     let y = tableTop + 25;
//     doc.font('Helvetica').fontSize(10).fillColor('#333');
//     order.items.forEach(item => {
//       const lineTotal = item.quantity * item.SalePrice;
//       doc
//         .text(item.Name, cols.name, y)
//         .text(item.Category, cols.cat, y)
//         .text(item.BarcodeNumber, cols.barcode, y)
//         .text(item.quantity, cols.qty, y, { width:30, align:'right' })
//         .text(item.SalePrice.toFixed(2), cols.unit, y, { width:60, align:'right' })
//         .text(lineTotal.toFixed(2), cols.total, y, { width:60, align:'right' });
//       y += 20;
//       if (y > doc.page.height - 100) {
//         doc.addPage(); y = 60;
//       }
//     });

//     // Grand total
//     doc.font('Helvetica-Bold').fontSize(14)
//        .text(`GRAND TOTAL: ${order.totalAmount.toFixed(2)} FCFA`, 50, y+20, { align:'right' });

//     // Footer
//     doc.fontSize(8).fillColor('#777')
//        .text('Thank you for choosing BTC Pharmacy! We wish you good health.www.btc-pharmacy.com', 50,  doc.page.height - 60, { align:'center' });
//       doc.end();
//   } catch (err) {
//     console.error('❌ Error generating receipt PDF:', err);
//     res.status(500).json({ error: 'Failed to generate receipt' });
//   }
// });


































// export default router;





























































// // import express from 'express';
// // import Order from '../models/Orders.js';
// // import Cart from '../models/Cart.js';
// // import PDFDocument from 'pdfkit';
// // const router = express.Router();

// // // Middleware: get browserId from header
// // function getBrowserId(req, res, next) {
// //   const browserId = req.header('X-Browser-Id');
// //   if (!browserId) return res.status(400).json({ error: 'Missing X-Browser-Id header' });
// //   req.browserId = browserId;
// //   next();
// // }

// // // POST /orders/place - create an order from current cart
// // router.post('/place', getBrowserId, async (req, res) => {
// //   try {
    
// //     const browserId = req.browserId;

// //     const cart = await Cart.findOne({ browserId });
// //     if (!cart || cart.items.length === 0) {
// //       return res.status(400).json({ error: 'Cart is empty' });
// //     }


// //     const totalAmount = cart.items.reduce(
// //   (sum, item) => sum + item.SalePrice * item.quantity, 
// //   0
// // );


// //    const orderItems = cart.items.map(item => ({
// //   productId:     item.productId,
// //   Name:          item.Name,
// //   SalePrice:     item.SalePrice,
// //   Picture:       item.Picture,
// //   Category:      item.Category,
// //   BarcodeNumber: item.BarcodeNumber,
// //   quantity:      item.quantity,  
// // }));


// //     const newOrder = new Order({
// //       browserId,
// //       items: orderItems,
// //       totalAmount,
// //       status: 'PENDING',
// //     });

// //     const savedOrder = await newOrder.save();

// //     cart.items = [];
// //     await cart.save();

// //     res.status(201).json(savedOrder);
// //   } catch (error) {
// //     console.error('❌ Error placing order:', error);
// //     res.status(500).json({ error: 'Internal server error' });
// //   }
// // });


// // // GET /orders - get all orders for browserId
// // router.get('/', getBrowserId, async (req, res) => {
// //   try {
// //     const orders = await Order.find({ browserId: req.browserId }).sort({ createdAt: -1 });
// //     res.json(orders);
// //   } catch (error) {
// //     console.error('Error fetching orders:', error);
// //     res.status(500).json({ error: 'Internal server error' });
// //   }
// // });

// // // GET /orders/:orderId - get details of a single order
// // router.get('/:orderId', getBrowserId, async (req, res) => {
// //   try {
// //     const order = await Order.findOne({ _id: req.params.orderId, browserId: req.browserId }).populate('items.productId', 'Name SalePrice');
// //     if (!order) return res.status(404).json({ error: 'Order not found' });
// //     res.json(order);
// //   } catch (error) {
// //     console.error('Error fetching order:', error);
// //     res.status(500).json({ error: 'Internal server error' });
// //   }
// // });


// // router.post('/updatestatus/:id', async (req, res) => {
// //   try {
// //     const { pin } = req.body;
// //     const { id } = req.params;

// //     const order = await Order.findById(id);

// //     if (!order) {
// //       return res.status(404).json({ message: "Order not found" });
// //     }

// //     if (order.confirmationPin !== pin) {
// //       return res.status(400).json({ message: "Incorrect confirmation PIN" });
// //     }

// //     // PIN is correct, update status
// //     order.status = 'CONFIRMED';
// //     await order.save();

// //     res.status(200).json({ message: "Order confirmed successfully", order });
// //   } catch (error) {
// //     console.error("Error updating status:", error);
// //     res.status(500).json({ message: "Internal server error" });
// //   }
// // });








// // // PATCH /orders/:orderId/status - update order status
// // router.patch('/:orderId/status', async (req, res) => {
// //   try {
// //     const { status } = req.body;
// //     if (!['PENDING','SHIPPED','CONFIRMED'].includes(status)) {
// //       return res.status(400).json({ error: 'Invalid status' });
// //     }

  

// //   const order = await Order.findByIdAndUpdate(req.params.orderId, { status }, { new: true });
// //     if (!order) return res.status(404).json({ error: 'Order not found' });
// //     res.json(order);
    
  
// //   } catch (error) {
// //     console.error('Error updating order status:', error);
// //     res.status(500).json({ error: 'Internal server error' });
// //   }
// // });









// // // router.get('/receipt/:orderId', getBrowserId, async (req, res) => {
// // //   try {
// // //     const { orderId } = req.params;
// // //     const order = await Order.findOne({
// // //       _id: orderId,
// // //       browserId: req.browserId
// // //     }).populate('items.productId', 'Name Category BarcodeNumber Picture');

// // //     if (!order) {
// // //       return res.status(404).json({ error: 'Order not found' });
// // //     }

// // //     // PDF response headers
// // //     res.setHeader('Content-Type', 'application/pdf');
// // //     res.setHeader(
// // //       'Content-Disposition',
// // //       `attachment; filename=receipt-${orderId}.pdf`
// // //     );

// // //      const doc = new PDFDocument({ size: 'A4', margins: { top: 60, bottom: 60, left: 50, right: 50 } });
// // //     doc.pipe(res);


    
// // //     // --- HEADER ---
// // //     doc.fontSize(20).text('BTC Pharmacy Receipt', { align: 'center' });
// // //     doc.moveDown(0.5);
// // //     doc.fontSize(12)
// // //        .text(`Order ID:        ${order._id}`)
// // //        .text(`Browser ID:      ${order.browserId}`)
// // //        .text(`Confirmation PIN:${order.confirmationPin}`)
// // //        .text(`Status:          ${order.status}`)
// // //        .text(`Date:            ${order.createdAt.toLocaleString()}`)
// // //        .moveDown();

// // //     // --- TABLE HEADER ---
// // //     const tableTop = doc.y + 10;
// // //     const cols = { name: 40, category: 200, barcode: 310, qty: 400, unit: 440, line: 500 };
// // //     doc.font('Helvetica-Bold');
// // //     doc.text('Name',       cols.name,     tableTop);
// // //     doc.text('Category',   cols.category, tableTop);
// // //     doc.text('Barcode',    cols.barcode,  tableTop);
// // //     doc.text('Qty',        cols.qty,      tableTop, { width: 30, align: 'right' });
// // //     doc.text('Unit',       cols.unit,     tableTop, { width: 50, align: 'right' });
// // //     doc.text('Line Total', cols.line,     tableTop, { width: 70, align: 'right' });
// // //     doc.moveDown(0.5).font('Helvetica');

// // //     // --- TABLE ROWS ---
// // //     order.items.forEach(item => {
// // //       const y = doc.y;
// // //       const lineTotal = item.quantity * item.SalePrice;
// // //       doc.text(item.Name,               cols.name,     y);
// // //       doc.text(item.Category,           cols.category, y);
// // //       doc.text(item.BarcodeNumber,      cols.barcode,  y);
// // //       doc.text(item.quantity,           cols.qty,      y, { width: 30, align: 'right' });
// // //       doc.text(`${item.SalePrice}`,     cols.unit,     y, { width: 50, align: 'right' });
// // //       doc.text(`${lineTotal}`,          cols.line,     y, { width: 70, align: 'right' });
// // //       doc.moveDown();
// // //     });

// // //     // --- GRAND TOTAL ---
// // //     doc.moveDown(1);
// // //     doc.font('Helvetica-Bold')
// // //        .text(`Total Amount: ${order.totalAmount} FCFA`, { align: 'right' });

// // //     doc.end();
// // //   } catch (err) {
// // //     console.error('❌ Error generating receipt PDF:', err);
// // //     res.status(500).json({ error: 'Failed to generate receipt' });
// // //   }
// // // });






// // router.get('/receipt/:orderId', getBrowserId, async (req, res) => {
// //   try {
// //     const { orderId } = req.params;
// //     const order = await Order.findOne({ _id: orderId, browserId: req.browserId })
// //       .populate('items.productId', 'Name Category BarcodeNumber Picture SalePrice');

// //     if (!order) return res.status(404).json({ error: 'Order not found' });

// //     res.setHeader('Content-Type', 'application/pdf');
// //     res.setHeader('Content-Disposition', `attachment; filename=receipt-${orderId}.pdf`);

// //     const doc = new PDFDocument({ size: 'A4', margins: { top: 60, bottom: 60, left: 50, right: 50 } });
// //     doc.pipe(res);

   
// //     // Header
// //     doc
    
// //       .fontSize(32)
// //       .fillColor('#000')
// //       .text('BTC PHARMACY', 180, 40)
// //       .fontSize(10)
// //       .fillColor('#555')
// //       .text('123 Health St, Wellness City', { align: 'right' })
// //       .text('Phone: +237 123 456 789', { align: 'right' })
// //       .moveDown(2);

// //     // Title box
// //     doc
// //       .rect(50, 120, doc.page.width - 100, 30)
// //       .fill('#004080')
// //       .fillColor('#fff')
// //       .fontSize(16)
// //       .text('OFFICIAL RECEIPT', 0, 126, { align: 'center' })
// //       .moveDown(2)
// //       .fillColor('#000');

// //     // Metadata
// //     const metaY = 165;
// //     doc
// //       .fontSize(10)
// //       .text(`Order ID: `, 50, metaY, { continued: true }).font('Helvetica-Bold').text(order._id)
// //       .font('Helvetica')
// //       .text(`Date: `, 50, metaY + 15, { continued: true }).font('Helvetica-Bold').text(order.createdAt.toLocaleString())
// //       .font('Helvetica')
// //       .text(`Status: `, 300, metaY, { continued: true }).font('Helvetica-Bold').text(order.status)
// //       .font('Helvetica')
// //       .text(`PIN: `, 300, metaY + 15, { continued: true }).font('Helvetica-Bold').text(order.confirmationPin)
// //       .moveDown(2);

// //     // Table header
// //     const tableTop = 210;
// //     const cols = { name:50, cat:200, barcode:300, qty:380, unit:430, total:500 };
// //     doc
// //       .font('Helvetica-Bold')
// //       .fontSize(10)
// //       .text('Item', cols.name, tableTop)
// //       .text('Category', cols.cat, tableTop)
// //       .text('Barcode', cols.barcode, tableTop)
// //       .text('Qty', cols.qty, tableTop, { width:30, align:'right' })
// //       .text('Unit Price', cols.unit, tableTop, { width:60, align:'right' })
// //       .text('Line Total', cols.total, tableTop, { width:60, align:'right' });

// //     doc.moveTo(50, tableTop+15).lineTo(doc.page.width-50, tableTop+15).stroke('#ccc');

// //     // Table rows
// //     let y = tableTop + 25;
// //     doc.font('Helvetica').fontSize(10).fillColor('#333');
// //     order.items.forEach(item => {
// //       const lineTotal = item.quantity * item.SalePrice;
// //       doc
// //         .text(item.Name, cols.name, y)
// //         .text(item.Category, cols.cat, y)
// //         .text(item.BarcodeNumber, cols.barcode, y)
// //         .text(item.quantity, cols.qty, y, { width:30, align:'right' })
// //         .text(item.SalePrice.toFixed(2), cols.unit, y, { width:60, align:'right' })
// //         .text(lineTotal.toFixed(2), cols.total, y, { width:60, align:'right' });
// //       y += 20;
// //       if (y > doc.page.height - 100) {
// //         doc.addPage(); y = 60;
// //       }
// //     });

// //     // Grand total
// //     doc.font('Helvetica-Bold').fontSize(14)
// //        .text(`GRAND TOTAL: ${order.totalAmount.toFixed(2)} FCFA`, 50, y+20, { align:'right' });

// //     // Footer
// //     doc.fontSize(8).fillColor('#777')
// //        .text('Thank you for choosing BTC Pharmacy! We wish you good health.www.btc-pharmacy.com', 50,  doc.page.height - 60, { align:'center' });
// //       doc.end();
// //   } catch (err) {
// //     console.error('❌ Error generating receipt PDF:', err);
// //     res.status(500).json({ error: 'Failed to generate receipt' });
// //   }
// // });


































// // export default router;

