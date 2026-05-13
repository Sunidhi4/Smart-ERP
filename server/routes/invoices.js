const router = require('express').Router();
const Invoice = require('../models/Invoice');

// GET all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create invoice
// Body: { customerName, items: [{ productName, qty, price }], status }
router.post('/', async (req, res) => {
  try {
    const { customerName, items, status } = req.body;

    // auto-calculate total
    const totalAmount = items.reduce(
      (sum, item) => sum + item.qty * item.price, 0
    );

    const invoice = new Invoice({ customerName, items, totalAmount, status });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update invoice status
router.put('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET dashboard summary (used by Dashboard page)
router.get('/summary/stats', async (req, res) => {
  try {
    const invoices = await Invoice.find();
    const totalSales = invoices.reduce((s, i) => s + i.totalAmount, 0);
    const paid = invoices.filter(i => i.status === 'paid').length;
    const pending = invoices.filter(i => i.status === 'pending').length;
    res.json({ totalSales, totalInvoices: invoices.length, paid, pending });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
