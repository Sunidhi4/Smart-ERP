import { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DUMMY_INVOICES = [
  { _id: '1', customerName: 'Rajesh Enterprises', items: [{ productName: 'Laptop', qty: 2, price: 55000 }, { productName: 'Mouse', qty: 2, price: 1200 }], totalAmount: 112400, status: 'paid',    date: '2026-05-01' },
  { _id: '2', customerName: 'Sunita Traders',     items: [{ productName: 'Monitor 24"', qty: 1, price: 18000 }],                                           totalAmount: 18000,  status: 'pending', date: '2026-05-03' },
  { _id: '3', customerName: 'Mehta & Sons',       items: [{ productName: 'Keyboard', qty: 3, price: 2500 }, { productName: 'USB-C Cable', qty: 5, price: 499 }], totalAmount: 10000, status: 'paid', date: '2026-05-05' },
  { _id: '4', customerName: 'Patel Retail',       items: [{ productName: 'Webcam HD', qty: 4, price: 3200 }],                                              totalAmount: 12800,  status: 'overdue', date: '2026-04-20' },
  { _id: '5', customerName: 'Kapoor Stores',      items: [{ productName: 'Laptop', qty: 1, price: 55000 }],                                                totalAmount: 55000,  status: 'pending', date: '2026-05-08' },
];

const EMPTY_ITEM = { productName: '', qty: 1, price: '' };
const EMPTY_FORM = { customerName: '', status: 'pending', items: [{ ...EMPTY_ITEM }] };

const STATUS_STYLES = {
  paid:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Paid' },
  pending: { bg: '#fefce8', color: '#ca8a04', border: '#fef08a', label: 'Pending' },
  overdue: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Overdue' },
};

// ── Modal ──────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16, overflowY: 'auto',
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, width: '100%',
        maxWidth: wide ? 620 : 460, boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
        overflow: 'hidden', margin: 'auto',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #f0f0f0',
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{title}</span>
          <button onClick={onClose} style={{
            background: '#f5f5f5', border: 'none', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#666',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        <div style={{ padding: '20px 24px', maxHeight: '80vh', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}

// ── Input ──────────────────────────────────────────────────────────────────
function Input({ value, onChange, placeholder, type = 'text', style: s = {} }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{
        width: '100%', padding: '9px 12px', borderRadius: 9,
        border: '1.5px solid #eee', fontSize: 13, color: '#111',
        outline: 'none', background: '#fafafa', boxSizing: 'border-box', ...s,
      }}
      onFocus={e => e.target.style.borderColor = '#6366f1'}
      onBlur={e  => e.target.style.borderColor = '#eee'}
    />
  );
}

// ── Invoice detail view ────────────────────────────────────────────────────
function InvoiceDetail({ inv, onClose }) {
  const st = STATUS_STYLES[inv.status] || STATUS_STYLES.pending;
  return (
    <Modal title={`Invoice #${inv._id.slice(-5).toUpperCase()}`} onClose={onClose} wide>
      {/* Customer + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Bill To</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>{inv.customerName}</div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
            {new Date(inv.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <span style={{
          fontSize: 12, padding: '5px 14px', borderRadius: 8, fontWeight: 700,
          background: st.bg, color: st.color, border: `1px solid ${st.border}`,
        }}>{st.label}</span>
      </div>

      {/* Items table */}
      <div style={{ border: '1px solid #f0f0f0', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              {['Item', 'Qty', 'Unit Price', 'Amount'].map(h => (
                <th key={h} style={{
                  padding: '10px 14px', fontSize: 11, color: '#bbb', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '.05em',
                  textAlign: h === 'Item' ? 'left' : 'right',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inv.items.map((item, i) => (
              <tr key={i} style={{ borderTop: '1px solid #f5f5f5' }}>
                <td style={{ padding: '12px 14px', fontSize: 14, color: '#222', fontWeight: 500 }}>{item.productName}</td>
                <td style={{ padding: '12px 14px', fontSize: 14, color: '#555', textAlign: 'right' }}>{item.qty}</td>
                <td style={{ padding: '12px 14px', fontSize: 14, color: '#555', textAlign: 'right' }}>₹{Number(item.price).toLocaleString()}</td>
                <td style={{ padding: '12px 14px', fontSize: 14, color: '#111', fontWeight: 600, textAlign: 'right' }}>₹{(item.qty * item.price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ background: '#f8f8ff', border: '1px solid #e0e0ff', borderRadius: 12, padding: '14px 20px', minWidth: 200 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 32, marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: '#888' }}>Subtotal</span>
            <span style={{ fontSize: 13, color: '#333' }}>₹{Number(inv.totalAmount).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 32, paddingTop: 8, borderTop: '1px solid #e0e0ff' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Total</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#6366f1' }}>₹{Number(inv.totalAmount).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Billing Page ──────────────────────────────────────────────────────
export default function Billing() {
  const [invoices, setInvoices]     = useState(DUMMY_INVOICES);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [viewInv, setViewInv]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [usingDummy, setUsingDummy] = useState(true);

  useEffect(() => {
    const load = async () => {
  try {
    const { data } = await axios.get(`${API}/api/invoices`);
    setInvoices(data);
    setUsingDummy(false);
  } catch (err) {
    console.error('API error:', err.message);
  }
};
    load();
  }, []);

  // form helpers
  const updateItem = (i, field, val) => {
    setForm(f => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: val };
      return { ...f, items };
    });
  };
  const addItem    = () => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = i  => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const formTotal = form.items.reduce((s, it) => s + (Number(it.qty) * Number(it.price) || 0), 0);

  const handleCreate = async () => {
    if (!form.customerName) return alert('Customer name is required.');
    if (form.items.some(it => !it.productName || !it.price)) return alert('Fill in all item details.');
    setSaving(true);
    try {
      const payload = { ...form, totalAmount: formTotal };
      if (usingDummy) {
        setInvoices(inv => [{ ...payload, _id: Date.now().toString(), date: new Date().toISOString() }, ...inv]);
      } else {
        const { data } = await axios.post(`${API}/api/invoices`, payload);
        setInvoices(inv => [data, ...inv]);
      }
      setForm(EMPTY_FORM);
      setShowCreate(false);
    } catch { alert('Error creating invoice.'); }
    setSaving(false);
  };

  const updateStatus = async (id, status) => {
    try {
      if (!usingDummy) await axios.put(`${API}/api/invoices/${id}`, { status });
      setInvoices(inv => inv.map(i => i._id === id ? { ...i, status } : i));
      if (viewInv?._id === id) setViewInv(v => ({ ...v, status }));
    } catch { alert('Error updating status.'); }
  };

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalSales   = invoices.reduce((s, i) => s + Number(i.totalAmount), 0);
  const paidCount    = invoices.filter(i => i.status === 'paid').length;
  const pendingCount = invoices.filter(i => i.status === 'pending').length;
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f8f8f8', padding: '32px 28px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4 }}>Finance</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111', letterSpacing: '-0.5px' }}>Billing & Invoices</h1>
        </div>
        <button onClick={() => setShowCreate(true)} style={{
          background: '#6366f1', color: '#fff', border: 'none', borderRadius: 12,
          padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
          onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
        >
          <span style={{ fontSize: 18 }}>+</span> New Invoice
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Revenue', value: `₹${(totalSales/1000).toFixed(0)}k`, color: '#6366f1' },
          { label: 'Paid',          value: paidCount,                            color: '#10b981' },
          { label: 'Pending',       value: pendingCount,                         color: '#f59e0b' },
          { label: 'Overdue',       value: overdueCount,                         color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#bbb' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by customer name..."
            style={{
              width: '100%', padding: '11px 14px 11px 40px', borderRadius: 12,
              border: '1.5px solid #eee', fontSize: 14, background: '#fff',
              outline: 'none', boxSizing: 'border-box', color: '#111',
            }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e  => e.target.style.borderColor = '#eee'}
          />
        </div>
        <select value={filterStatus} onChange={e => setFilter(e.target.value)} style={{
          padding: '11px 36px 11px 14px', borderRadius: 12, border: '1.5px solid #eee',
          fontSize: 14, background: '#fff', color: '#111', outline: 'none', cursor: 'pointer',
        }}>
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Invoices table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              {['Invoice', 'Customer', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', fontSize: 11, color: '#bbb', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '.05em',
                  textAlign: ['Amount'].includes(h) ? 'right' : 'left',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#bbb', fontSize: 14 }}>No invoices found.</td></tr>
            )}
            {filtered.map((inv, i) => {
              const st = STATUS_STYLES[inv.status] || STATUS_STYLES.pending;
              return (
                <tr key={inv._id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f9f9f9' : 'none', transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#888', fontFamily: 'monospace' }}>
                    #{inv._id.slice(-5).toUpperCase()}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#111' }}>
                    {inv.customerName}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#888' }}>
                    {new Date(inv.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: '#111', textAlign: 'right' }}>
                    ₹{Number(inv.totalAmount).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 6, fontWeight: 600,
                      background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                    }}>{st.label}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button onClick={() => setViewInv(inv)} style={{
                        background: '#f0f0ff', color: '#6366f1', border: 'none',
                        borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}>View</button>
                      {inv.status !== 'paid' && (
                        <button onClick={() => updateStatus(inv._id, 'paid')} style={{
                          background: '#f0fdf4', color: '#16a34a', border: 'none',
                          borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}>Mark Paid</button>
                      )}
                      {inv.status === 'pending' && (
                        <button onClick={() => updateStatus(inv._id, 'overdue')} style={{
                          background: '#fef2f2', color: '#dc2626', border: 'none',
                          borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}>Overdue</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      {showCreate && (
        <Modal title="Create New Invoice" onClose={() => setShowCreate(false)} wide>
          {/* Customer */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Customer Name</label>
            <Input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="e.g. Rajesh Enterprises" />
          </div>

          {/* Items */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '.04em' }}>Items</label>
              <button onClick={addItem} style={{
                background: '#f0f0ff', color: '#6366f1', border: 'none', borderRadius: 8,
                padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>+ Add Item</button>
            </div>

            {/* Item header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 100px 32px', gap: 8, marginBottom: 6 }}>
              {['Product Name', 'Qty', 'Price (₹)', ''].map(h => (
                <div key={h} style={{ fontSize: 11, color: '#bbb', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</div>
              ))}
            </div>

            {form.items.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 100px 32px', gap: 8, marginBottom: 8 }}>
                <Input value={item.productName} onChange={e => updateItem(i, 'productName', e.target.value)} placeholder="Product name" />
                <Input value={item.qty}         onChange={e => updateItem(i, 'qty', e.target.value)}         placeholder="1"    type="number" />
                <Input value={item.price}       onChange={e => updateItem(i, 'price', e.target.value)}       placeholder="0"    type="number" />
                <button onClick={() => removeItem(i)} disabled={form.items.length === 1} style={{
                  background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 9,
                  cursor: form.items.length === 1 ? 'not-allowed' : 'pointer',
                  opacity: form.items.length === 1 ? 0.4 : 1, fontSize: 16, fontWeight: 700,
                }}>✕</button>
              </div>
            ))}
          </div>

          {/* Status */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{
              width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #eee',
              fontSize: 13, color: '#111', outline: 'none', background: '#fafafa',
            }}>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Total preview */}
          <div style={{ background: '#f8f8ff', border: '1px solid #e0e0ff', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>Invoice Total</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#6366f1' }}>₹{formTotal.toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowCreate(false)} style={{
              padding: '10px 20px', borderRadius: 10, border: '1.5px solid #eee',
              background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#555',
            }}>Cancel</button>
            <button onClick={handleCreate} disabled={saving} style={{
              padding: '10px 24px', borderRadius: 10, border: 'none',
              background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
            }}>{saving ? 'Creating...' : 'Create Invoice'}</button>
          </div>
        </Modal>
      )}

      {/* View Invoice Modal */}
      {viewInv && <InvoiceDetail inv={viewInv} onClose={() => setViewInv(null)} />}
    </div>
  );
}