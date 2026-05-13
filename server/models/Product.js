const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  category:      { type: String, default: '' },
  stock:         { type: Number, default: 0 },
  price:         { type: Number, required: true },
  lowStockAlert: { type: Number, default: 10 },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);