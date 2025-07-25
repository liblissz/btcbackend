router.get('/receipt/:orderId', getBrowserId, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ _id: orderId, browserId: req.browserId })
      .populate('items.productId', 'Name Category BarcodeNumber Picture SalePrice');

    if (!order) return res.status(404).json({ error: 'Order not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${orderId}.pdf`);

    const doc = new PDFDocument({ size: 'A4', margins: { top: 60, bottom: 60, left: 50, right: 50 } });
    doc.pipe(res);

   
    // Header
    doc
      .image('https://i.imgur.com/3V4uETe.png', 50, 30, { width: 120 })
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
      .text(`Order ID: `, 50, metaY, { continued: true }).font('Helvetica-Bold').text(order._id)
      .font('Helvetica')
      .text(`Date: `, 50, metaY + 15, { continued: true }).font('Helvetica-Bold').text(order.createdAt.toLocaleString())
      .font('Helvetica')
      .text(`Status: `, 300, metaY, { continued: true }).font('Helvetica-Bold').text(order.status)
      .font('Helvetica')
      .text(`PIN: `, 300, metaY + 15, { continued: true }).font('Helvetica-Bold').text(order.confirmationPin)
      .moveDown(2);

    // Table header
    const tableTop = 210;
    const cols = { name:50, cat:200, barcode:300, qty:380, unit:430, total:500 };
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Item', cols.name, tableTop)
      .text('Category', cols.cat, tableTop)
      .text('Barcode', cols.barcode, tableTop)
      .text('Qty', cols.qty, tableTop, { width:30, align:'right' })
      .text('Unit Price', cols.unit, tableTop, { width:60, align:'right' })
      .text('Line Total', cols.total, tableTop, { width:60, align:'right' });

    doc.moveTo(50, tableTop+15).lineTo(doc.page.width-50, tableTop+15).stroke('#ccc');

    // Table rows
    let y = tableTop + 25;
    doc.font('Helvetica').fontSize(10).fillColor('#333');
    order.items.forEach(item => {
      const lineTotal = item.quantity * item.SalePrice;
      doc
        .text(item.Name, cols.name, y)
        .text(item.Category, cols.cat, y)
        .text(item.BarcodeNumber, cols.barcode, y)
        .text(item.quantity, cols.qty, y, { width:30, align:'right' })
        .text(item.SalePrice.toFixed(2), cols.unit, y, { width:60, align:'right' })
        .text(lineTotal.toFixed(2), cols.total, y, { width:60, align:'right' });
      y += 20;
      if (y > doc.page.height - 100) {
        doc.addPage(); y = 60;
      }
    });

    // Grand total
    doc.font('Helvetica-Bold').fontSize(14)
       .text(`GRAND TOTAL: ${order.totalAmount.toFixed(2)} FCFA`, 50, y+20, { align:'right' });

    // Footer
    doc.fontSize(8).fillColor('#777')
       .text('Thank you for choosing BTC Pharmacy! We wish you good health.www.btc-pharmacy.com', 50,  doc.page.height - 60, { align:'center' });
      doc.end();
  } catch (err) {
    console.error('❌ Error generating receipt PDF:', err);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});