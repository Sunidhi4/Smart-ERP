const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://smart-erp-hazel.vercel.app/login', // replace with your real URL
  ],
}));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));       // public
app.use('/api/products',  require('./routes/products'));   // protected
app.use('/api/employees', require('./routes/employees')); // protected
app.use('/api/invoices',  require('./routes/invoices'));   // protected
app.use('/api/ai',        require('./routes/ai'));         // protected

// ── MongoDB ────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
  tls: true,
  tlsAllowInvalidCertificates: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
