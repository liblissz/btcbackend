import express from "express";
import PDFDocument from "pdfkit";
import Order from "../models/Orders.js";
import QRCode from "qrcode";
import QuickChart from "quickchart-js";
import fetch from "node-fetch";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();

    if (!orders || orders.length === 0)
      return res.status(404).json({ error: "No orders found" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=btc-pharmacy-balancesheet.pdf`
    );

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 60, bottom: 60, left: 50, right: 50 },
    });
    doc.pipe(res);

    // ===== HEADER =====
    doc
      .fontSize(28)
      .fillColor("#004080")
      .text("BTC PHARMACY", 50, 40)
      .fontSize(10)
      .fillColor("#555")
      .text("123 Health St, Wellness City", { align: "right" })
      .text("Phone: +237 123 456 789", { align: "right" })
      .moveDown(2);

    // ===== TITLE =====
    doc
      .rect(50, 100, doc.page.width - 100, 30)
      .fill("#004080")
      .fillColor("#fff")
      .fontSize(16)
      .text("BALANCE SHEET", 0, 108, { align: "center" })
      .fillColor("#000");

    // ===== TABLE HEADER =====
    const tableTop = 160;
    const cols = { name: 50, product: 180, qty: 300, price: 370, total: 450 };
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("Customer", cols.name, tableTop)
      .text("Product", cols.product, tableTop)
      .text("Qty", cols.qty, tableTop)
      .text("Unit Price", cols.price, tableTop)
      .text("Line Total", cols.total, tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(doc.page.width - 50, tableTop + 15).stroke("#ccc");

    // ===== TABLE ROWS =====
    let y = tableTop + 25;
    doc.font("Helvetica").fontSize(10);

    let grandTotal = 0;
    const categoryTotals = {};
    const monthlyTotals = {};

    for (const order of orders) {
      const orderDate = order.createdAt || new Date();
      const month = orderDate.toLocaleString("default", { month: "long" });

      for (const item of order.items) {
        const lineTotal = item.SalePrice * item.quantity;
        grandTotal += lineTotal;

        // Category totals
        categoryTotals[item.Category] = (categoryTotals[item.Category] || 0) + lineTotal;

        // Monthly totals
        monthlyTotals[month] = (monthlyTotals[month] || 0) + lineTotal;

        // Alternating row color
        if ((y - tableTop) / 20 % 2 === 0) {
          doc.rect(50, y - 2, doc.page.width - 100, 20).fill("#f5f5f5").fillColor("#333");
        }

        doc
          .text(order.customer?.name || "-", cols.name, y)
          .text(item.Name || "-", cols.product, y)
          .text(item.quantity?.toString() || "0", cols.qty, y)
          .text(item.SalePrice?.toFixed(2) || "0.00", cols.price, y)
          .text(lineTotal.toFixed(2), cols.total, y);

        y += 20;
        if (y > doc.page.height - 200) {
          doc.addPage();
          y = 60;
        }
      }
    }

    // ===== GRAND TOTAL =====
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text(`GRAND TOTAL: ${grandTotal.toFixed(2)} FCFA`, 50, y + 20, { align: "right" });

    // ===== CATEGORY PIE CHART =====
    const categoryChart = new QuickChart();
    categoryChart.setConfig({
      type: "pie",
      data: {
        labels: Object.keys(categoryTotals),
        datasets: [{
          data: Object.values(categoryTotals),
          backgroundColor: ["#004080", "#FF6384", "#36A2EB", "#FFCE56"],
        }],
      },
      options: { plugins: { legend: { position: "right" } } },
    });
    const categoryUrl = await categoryChart.getShortUrl();
    const categoryResp = await fetch(categoryUrl);
    const categoryBuffer = await categoryResp.buffer();

    doc.addPage();
    doc.fontSize(14).fillColor("#004080").text("Sales by Category", 50, 60);
    doc.image(categoryBuffer, 70, 100, { width: 400 });

    // ===== MONTHLY SALES BAR CHART =====
    const barChart = new QuickChart();
    barChart.setConfig({
      type: "bar",
      data: {
        labels: Object.keys(monthlyTotals),
        datasets: [{
          label: "Total Sales (FCFA)",
          data: Object.values(monthlyTotals),
          backgroundColor: "#004080",
        }],
      },
      options: { scales: { y: { beginAtZero: true } } },
    });
    const barUrl = await barChart.getShortUrl();
    const barResp = await fetch(barUrl);
    const barBuffer = await barResp.buffer();

    doc.addPage();
    doc.fontSize(14).fillColor("#004080").text("Monthly Sales", 50, 60);
    doc.image(barBuffer, 70, 100, { width: 450 });

    // ===== QR CODE =====
    const qrText = `BTC PHARMACY BALANCESHEET\n\nTotal Orders: ${orders.length}\nGrand Total: ${grandTotal.toFixed(2)} FCFA`;
    const qrImageBuffer = await QRCode.toBuffer(qrText, { type: "png" });

    doc.addPage();
    doc.fontSize(14).text("Verification QR Code", { align: "center" });
    doc.image(qrImageBuffer, doc.page.width / 2 - 50, 150, { width: 100 });

    // ===== FOOTER =====
    doc
      .fontSize(8)
      .fillColor("#777")
      .text(
        "Thank you for trusting BTC Pharmacy - A Billion Dollar Health Partner",
        50,
        doc.page.height - 60,
        { align: "center" }
      );

    doc.end();
  } catch (err) {
    console.error("❌ Error generating balance sheet PDF:", err);
    res.status(500).json({ error: "Failed to generate balance sheet" });
  }
});

export default router;
