const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  items: [{
    productName: String,
    qty:         Number,
    price:       Number,
  }],
  totalAmount: { type: Number, default: 0 },
  status:      { type: String, default: 'pending' },
  date:        { type: Date,   default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);