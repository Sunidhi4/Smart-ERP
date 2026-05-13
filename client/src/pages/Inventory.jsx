import { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DUMMY_PRODUCTS = [
  { _id: '1', name: 'Laptop', category: 'Electronics', stock: 14, price: 55000, lowStockAlert: 10 },
  { _id: '2', name: 'Wireless Mouse', category: 'Accessories', stock: 5, price: 1200, lowStockAlert: 10 },
  { _id: '3', name: 'USB-C Cable', category: 'Accessories', stock: 3, price: 499, lowStockAlert: 10 },
  { _id: '4', name: 'Monitor 24"', category: 'Electronics', stock: 8, price: 18000, lowStockAlert: 5 },
  { _id: '5', name: 'Keyboard', category: 'Accessories', stock: 4, price: 2500, lowStockAlert: 10 },
  { _id: '6', name: 'Webcam HD', category: 'Electronics', stock: 20, price: 3200, lowStockAlert: 5 },
];

const EMPTY_FORM = { name: '', category: '', stock: '', price: '', lowStockAlert: 10 };

// ── Modal ──────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, width: '100%', maxWidth: 460,
        boxShadow: '0 24px 60px rgba(0,0,0,0.15)', overflow: 'hidden',
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
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ── Form field ─────────────────────────────────────────────────────────────
function Field({ label, name, value, onChange, type = 'text', placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 10,
          border: '1.5px solid #eee', fontSize: 14, color: '#111',
          outline: 'none', background: '#fafafa', boxSizing: 'border-box',
          transition: 'border-color .15s',
        }}
        onFocus={e => e.target.style.borderColor = '#6366f1'}
        onBlur={e => e.target.style.borderColor = '#eee'}
      />
    </div>
  );
}

// ── Delete confirm modal ───────────────────────────────────────────────────
function DeleteModal({ product, onConfirm, onClose }) {
  return (
    <Modal title="Delete Product" onClose={onClose}>
      <p style={{ fontSize: 14, color: '#555', marginBottom: 20, lineHeight: 1.6 }}>
        Are you sure you want to delete <strong style={{ color: '#111' }}>{product.name}</strong>? This cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{
          padding: '9px 20px', borderRadius: 10, border: '1.5px solid #eee',
          background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#555',
        }}>Cancel</button>
        <button onClick={onConfirm} style={{
          padding: '9px 20px', borderRadius: 10, border: 'none',
          background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Yes, Delete</button>
      </div>
    </Modal>
  );
}

// ── Main Inventory Page ────────────────────────────────────────────────────
export default function Inventory() {
  const [products, setProducts] = useState(DUMMY_PRODUCTS);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [usingDummy, setUsingDummy] = useState(true);

  // fetch from backend
  useEffect(() => {
    const load = async () => {
  try {
    const { data } = await axios.get(`${API}/api/products`);
    setProducts(data);
    setUsingDummy(false);
  } catch (err) {
    console.error('API error:', err.message);
  }
};
    load();
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const openAdd = () => { setForm(EMPTY_FORM); setEditProduct(null); setShowModal(true); };
  const openEdit = p => { setForm({ name: p.name, category: p.category, stock: p.stock, price: p.price, lowStockAlert: p.lowStockAlert }); setEditProduct(p); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.price) return alert('Name and price are required.');
    setSaving(true);
    try {
      if (usingDummy) {
        // work locally without backend
        if (editProduct) {
          setProducts(ps => ps.map(p => p._id === editProduct._id ? { ...p, ...form, stock: +form.stock, price: +form.price, lowStockAlert: +form.lowStockAlert } : p));
        } else {
          setProducts(ps => [...ps, { ...form, _id: Date.now().toString(), stock: +form.stock, price: +form.price, lowStockAlert: +form.lowStockAlert }]);
        }
      } else {
        if (editProduct) {
          const { data } = await axios.put(`${API}/api/products/${editProduct._id}`, form);
          setProducts(ps => ps.map(p => p._id === editProduct._id ? data : p));
        } else {
          const { data } = await axios.post(`${API}/api/products`, form);
          setProducts(ps => [...ps, data]);
        }
      }
      setShowModal(false);
    } catch (err) { alert('Error saving product.'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      if (!usingDummy) await axios.delete(`${API}/api/products/${deleteProduct._id}`);
      setProducts(ps => ps.filter(p => p._id !== deleteProduct._id));
    } catch { alert('Error deleting.'); }
    setDeleteProduct(null);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowCount = products.filter(p => p.stock < p.lowStockAlert).length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f8f8f8', padding: '32px 28px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4 }}>Stock Management</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111', letterSpacing: '-0.5px' }}>Inventory</h1>
        </div>
        <button onClick={openAdd} style={{
          background: '#6366f1', color: '#fff', border: 'none', borderRadius: 12,
          padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          transition: 'background .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
          onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
        >
          <span style={{ fontSize: 18 }}>+</span> Add Product
        </button>
      </div>

      {/* Mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Items', value: products.length, color: '#6366f1' },
          { label: 'Low Stock', value: lowCount, color: '#ef4444' },
          { label: 'Inventory Value', value: `₹${(totalValue / 1000).toFixed(0)}k`, color: '#10b981' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#bbb' }}>🔍</span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or category..."
          style={{
            width: '100%', padding: '11px 14px 11px 40px', borderRadius: 12,
            border: '1.5px solid #eee', fontSize: 14, background: '#fff',
            outline: 'none', boxSizing: 'border-box', color: '#111',
          }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = '#eee'}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              {['Product', 'Category', 'Stock', 'Price', 'Status', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: h === 'Actions' || h === 'Price' || h === 'Stock' ? 'right' : 'left',
                  fontSize: 11, color: '#bbb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#bbb', fontSize: 14 }}>No products found.</td></tr>
            )}
            {filtered.map((p, i) => {
              const isLow = p.stock < p.lowStockAlert;
              return (
                <tr key={p._id} style={{
                  borderBottom: i < filtered.length - 1 ? '1px solid #f9f9f9' : 'none',
                  transition: 'background .1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{p.name}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 12, padding: '3px 10px', borderRadius: 6,
                      background: '#f0f0ff', color: '#6366f1', fontWeight: 600,
                    }}>{p.category || '—'}</span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, fontSize: 15, color: isLow ? '#ef4444' : '#111' }}>
                    {p.stock}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 14, color: '#444', fontWeight: 500 }}>
                    ₹{Number(p.price).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <span style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 6, fontWeight: 600,
                      background: isLow ? '#fef2f2' : '#f0fdf4',
                      color: isLow ? '#dc2626' : '#16a34a',
                      border: `1px solid ${isLow ? '#fecaca' : '#bbf7d0'}`,
                    }}>
                      {isLow ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button onClick={() => openEdit(p)} style={{
                      background: '#f0f0ff', color: '#6366f1', border: 'none',
                      borderRadius: 8, padding: '6px 14px', fontSize: 12,
                      fontWeight: 600, cursor: 'pointer', marginRight: 6,
                    }}>Edit</button>
                    <button onClick={() => setDeleteProduct(p)} style={{
                      background: '#fef2f2', color: '#ef4444', border: 'none',
                      borderRadius: 8, padding: '6px 14px', fontSize: 12,
                      fontWeight: 600, cursor: 'pointer',
                    }}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal title={editProduct ? 'Edit Product' : 'Add New Product'} onClose={() => setShowModal(false)}>
          <Field label="Product Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Wireless Keyboard" />
          <Field label="Category" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Electronics" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Stock Qty" name="stock" value={form.stock} onChange={handleChange} type="number" placeholder="0" />
            <Field label="Price (₹)" name="price" value={form.price} onChange={handleChange} type="number" placeholder="0" />
          </div>
          <Field label="Low Stock Alert" name="lowStockAlert" value={form.lowStockAlert} onChange={handleChange} type="number" placeholder="10" />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <button onClick={() => setShowModal(false)} style={{
              padding: '10px 20px', borderRadius: 10, border: '1.5px solid #eee',
              background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#555',
            }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
            }}>{saving ? 'Saving...' : editProduct ? 'Save Changes' : 'Add Product'}</button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteProduct && (
        <DeleteModal product={deleteProduct} onConfirm={handleDelete} onClose={() => setDeleteProduct(null)} />
      )}
    </div>
  );
}
