const router = require('express').Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');
const Employee = require('../models/Employee');
const Invoice = require('../models/Invoice');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    // fetch live data from MongoDB
    const [products, employees, invoices] = await Promise.all([
      Product.find().limit(10),
Employee.find().limit(10),
Invoice.find().sort({ createdAt: -1 }).limit(5),
    ]);

    // build summary numbers
    const totalSales  = invoices.reduce((s, i) => s + i.totalAmount, 0);
    const lowStock    = products.filter(p => p.stock < p.lowStockAlert);
    const paidCount   = invoices.filter(i => i.status === 'paid').length;
    const pendingCount= invoices.filter(i => i.status === 'pending').length;

    // build context string sent to Gemini
    const context = `
You are SmartERP AI, a helpful business assistant. Answer in clear, concise bullet points or short paragraphs. Use ₹ for currency. Never make up data — only use what is provided below.

=== BUSINESS DATA ===

PRODUCTS (${products.length} total):
${products.map(p =>
  `- ${p.name} | Category: ${p.category || 'N/A'} | Stock: ${p.stock} | Price: ₹${p.price} | Low-stock threshold: ${p.lowStockAlert}`
).join('\n')}

LOW STOCK ITEMS (${lowStock.length}):
${lowStock.length > 0
  ? lowStock.map(p => `- ${p.name}: only ${p.stock} units left (threshold: ${p.lowStockAlert})`).join('\n')
  : 'None — all products are sufficiently stocked.'}

EMPLOYEES (${employees.length} total):
${employees.map(e =>
  `- ${e.name} | Role: ${e.role || 'N/A'} | Salary: ₹${e.salary || 0} | Status: ${e.status}`
).join('\n')}

RECENT INVOICES (last 30):
Total Sales: ₹${totalSales.toLocaleString()}
Paid: ${paidCount} | Pending: ${pendingCount}
${invoices.slice(0, 10).map(i =>
  `- ${i.customerName} | ₹${i.totalAmount} | ${i.status} | ${new Date(i.date).toLocaleDateString('en-IN')}`
).join('\n')}

=== USER QUESTION ===
${message}
    `.trim();

    const model  = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(context);
    const reply  = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error('AI route error:', err.message);
    res.status(500).json({ error: 'AI service error. Check your GEMINI_API_KEY.' });
  }
});

module.exports = router;

console.log("GEMINI KEY:", process.env.GEMINI_API_KEY);