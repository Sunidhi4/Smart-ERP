import { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DUMMY_EMPLOYEES = [
  { _id: '1', name: 'Priya Sharma',   role: 'Manager',         salary: 65000, phone: '9876543210', email: 'priya@company.com',   status: 'active',   joinDate: '2023-03-15' },
  { _id: '2', name: 'Rahul Mehta',    role: 'Developer',       salary: 55000, phone: '9876543211', email: 'rahul@company.com',   status: 'active',   joinDate: '2023-06-01' },
  { _id: '3', name: 'Sneha Patil',    role: 'Sales Executive', salary: 38000, phone: '9876543212', email: 'sneha@company.com',   status: 'active',   joinDate: '2024-01-10' },
  { _id: '4', name: 'Amit Joshi',     role: 'Accountant',      salary: 42000, phone: '9876543213', email: 'amit@company.com',    status: 'inactive', joinDate: '2022-11-20' },
  { _id: '5', name: 'Kavya Nair',     role: 'HR Executive',    salary: 40000, phone: '9876543214', email: 'kavya@company.com',   status: 'active',   joinDate: '2024-03-05' },
  { _id: '6', name: 'Rohan Desai',    role: 'Developer',       salary: 58000, phone: '9876543215', email: 'rohan@company.com',   status: 'active',   joinDate: '2023-09-12' },
];

const EMPTY_FORM = { name: '', role: '', salary: '', phone: '', email: '', status: 'active' };

const ROLES = ['Manager', 'Developer', 'Sales Executive', 'Accountant', 'HR Executive', 'Designer', 'Support', 'Other'];

// ── Avatar initials ────────────────────────────────────────────────────────
const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];
function Avatar({ name, size = 36 }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color + '20', color, fontWeight: 700,
      fontSize: size * 0.36, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0, border: `1.5px solid ${color}40`,
    }}>{initials}</div>
  );
}

// ── Modal wrapper ──────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, width: '100%', maxWidth: 480,
        boxShadow: '0 24px 60px rgba(0,0,0,0.15)', overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #f0f0f0',
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{title}</span>
          <button onClick={onClose} style={{
            background: '#f5f5f5', border: 'none', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer', fontSize: 16,
            color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ── Form field ─────────────────────────────────────────────────────────────
function Field({ label, name, value, onChange, type = 'text', placeholder, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 600, color: '#666',
        marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em',
      }}>{label}</label>
      {children ?? (
        <input
          type={type} name={name} value={value}
          onChange={onChange} placeholder={placeholder}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 10,
            border: '1.5px solid #eee', fontSize: 14, color: '#111',
            outline: 'none', background: '#fafafa', boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e  => e.target.style.borderColor = '#eee'}
        />
      )}
    </div>
  );
}

// ── Main Employees Page ────────────────────────────────────────────────────
export default function Employees() {
  const [employees, setEmployees]   = useState(DUMMY_EMPLOYEES);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState('all');
  const [showModal, setShowModal]   = useState(false);
  const [editEmp, setEditEmp]       = useState(null);
  const [deleteEmp, setDeleteEmp]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [usingDummy, setUsingDummy] = useState(true);

  useEffect(() => {
    const load = async () => {
  try {
    const { data } = await axios.get(`${API}/api/employees`);
    setEmployees(data);
    setUsingDummy(false);
  } catch (err) {
    console.error('API error:', err.message);
    // keep dummy data if backend is unreachable
  }
};
    load();
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const openAdd  = () => { setForm(EMPTY_FORM); setEditEmp(null); setShowModal(true); };
  const openEdit = emp => {
    setForm({ name: emp.name, role: emp.role, salary: emp.salary, phone: emp.phone, email: emp.email, status: emp.status });
    setEditEmp(emp);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.role) return alert('Name and role are required.');
    setSaving(true);
    try {
      if (usingDummy) {
        if (editEmp) {
          setEmployees(es => es.map(e => e._id === editEmp._id
            ? { ...e, ...form, salary: +form.salary } : e));
        } else {
          setEmployees(es => [...es, { ...form, _id: Date.now().toString(), salary: +form.salary, joinDate: new Date().toISOString() }]);
        }
      } else {
        if (editEmp) {
          const { data } = await axios.put(`${API}/api/employees/${editEmp._id}`, form);
          setEmployees(es => es.map(e => e._id === editEmp._id ? data : e));
        } else {
          const { data } = await axios.post(`${API}/api/employees`, form);
          setEmployees(es => [...es, data]);
        }
      }
      setShowModal(false);
    } catch { alert('Error saving employee.'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      if (!usingDummy) await axios.delete(`${API}/api/employees/${deleteEmp._id}`);
      setEmployees(es => es.filter(e => e._id !== deleteEmp._id));
    } catch { alert('Error deleting.'); }
    setDeleteEmp(null);
  };

  const filtered = employees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
                        e.role?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const activeCount   = employees.filter(e => e.status === 'active').length;
  const inactiveCount = employees.filter(e => e.status === 'inactive').length;
  const totalSalary   = employees.filter(e => e.status === 'active')
                                 .reduce((s, e) => s + Number(e.salary), 0);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f8f8f8', padding: '32px 28px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4 }}>Team Management</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111', letterSpacing: '-0.5px' }}>Employees</h1>
        </div>
        <button onClick={openAdd} style={{
          background: '#6366f1', color: '#fff', border: 'none', borderRadius: 12,
          padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
          onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
        >
          <span style={{ fontSize: 18 }}>+</span> Add Employee
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Staff',     value: employees.length, color: '#6366f1' },
          { label: 'Active',          value: activeCount,      color: '#10b981' },
          { label: 'Inactive',        value: inactiveCount,    color: '#ef4444' },
          { label: 'Monthly Payroll', value: `₹${(totalSalary/1000).toFixed(0)}k`, color: '#f59e0b' },
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
            placeholder="Search by name or role..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Employee cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#bbb', fontSize: 14, padding: 40 }}>
            No employees found.
          </div>
        )}
        {filtered.map(emp => (
          <div key={emp._id} style={{
            background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0',
            padding: '20px', transition: 'transform .15s, box-shadow .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = 'none'; }}
          >
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Avatar name={emp.name} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{emp.role}</div>
              </div>
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 6, fontWeight: 600, flexShrink: 0,
                background: emp.status === 'active' ? '#f0fdf4' : '#fef2f2',
                color:      emp.status === 'active' ? '#16a34a' : '#dc2626',
                border:     `1px solid ${emp.status === 'active' ? '#bbf7d0' : '#fecaca'}`,
              }}>
                {emp.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Card details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Salary',   value: `₹${Number(emp.salary).toLocaleString()}` },
                { label: 'Joined',   value: new Date(emp.joinDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) },
                { label: 'Phone',    value: emp.phone || '—' },
                { label: 'Email',    value: emp.email || '—' },
              ].map(d => (
                <div key={d.label} style={{ background: '#fafafa', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ fontSize: 10, color: '#bbb', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 3 }}>{d.label}</div>
                  <div style={{ fontSize: 13, color: '#333', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.value}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => openEdit(emp)} style={{
                flex: 1, background: '#f0f0ff', color: '#6366f1', border: 'none',
                borderRadius: 10, padding: '8px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Edit</button>
              <button onClick={() => setDeleteEmp(emp)} style={{
                flex: 1, background: '#fef2f2', color: '#ef4444', border: 'none',
                borderRadius: 10, padding: '8px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal title={editEmp ? 'Edit Employee' : 'Add New Employee'} onClose={() => setShowModal(false)}>
          <Field label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Priya Sharma" />
          <Field label="Role" name="role" value={form.role} onChange={handleChange}>
            <select name="role" value={form.role} onChange={handleChange} style={{
              width: '100%', padding: '10px 36px 10px 14px', borderRadius: 10,
              border: '1.5px solid #eee', fontSize: 14, color: '#111',
              outline: 'none', background: '#fafafa', boxSizing: 'border-box', cursor: 'pointer',
            }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e  => e.target.style.borderColor = '#eee'}
            >
              <option value="">Select role...</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Salary (₹)" name="salary" value={form.salary} onChange={handleChange} type="number" placeholder="0" />
            <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" />
          </div>
          <Field label="Email" name="email" value={form.email} onChange={handleChange} type="email" placeholder="name@company.com" />
          <Field label="Status" name="status" value={form.status} onChange={handleChange}>
            <select name="status" value={form.status} onChange={handleChange} style={{
              width: '100%', padding: '10px 36px 10px 14px', borderRadius: 10,
              border: '1.5px solid #eee', fontSize: 14, color: '#111',
              outline: 'none', background: '#fafafa', boxSizing: 'border-box', cursor: 'pointer',
            }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <button onClick={() => setShowModal(false)} style={{
              padding: '10px 20px', borderRadius: 10, border: '1.5px solid #eee',
              background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#555',
            }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
            }}>{saving ? 'Saving...' : editEmp ? 'Save Changes' : 'Add Employee'}</button>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteEmp && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16,
        }}>
          <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 400, padding: '28px 24px', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: 40, marginBottom: 12, textAlign: 'center' }}>⚠️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111', textAlign: 'center', marginBottom: 8 }}>Remove Employee?</div>
            <p style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
              Are you sure you want to remove <strong>{deleteEmp.name}</strong>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteEmp(null)} style={{
                flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #eee',
                background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#555',
              }}>Cancel</button>
              <button onClick={handleDelete} style={{
                flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}