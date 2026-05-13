const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  role:     { type: String, default: '' },
  salary:   { type: Number, default: 0 },
  phone:    { type: String, default: '' },
  email:    { type: String, default: '' },
  joinDate: { type: Date,   default: Date.now },
  status:   { type: String, default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);