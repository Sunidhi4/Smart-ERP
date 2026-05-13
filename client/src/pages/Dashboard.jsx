import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Dummy data shown before real API is ready ──────────────────────────────
const DUMMY_SALES = [
  { month: 'Nov', sales: 38000 },
  { month: 'Dec', sales: 52000 },
  { month: 'Jan', sales: 45000 },
  { month: 'Feb', sales: 61000 },
  { month: 'Mar', sales: 55000 },
  { month: 'Apr', sales: 73000 },
  { month: 'May', sales: 68000 },
];

const DUMMY_STATS = {
  totalProducts: 48,
  totalEmployees: 12,
  totalSales: 392000,
  lowStockAlerts: 5,
};

const DUMMY_LOW_STOCK = [
  { name: 'USB-C Cables', stock: 3 },
  { name: 'Wireless Mouse', stock: 5 },
  { name: 'HDMI Adapters', stock: 2 },
  { name: 'Laptop Stand', stock: 7 },
  { name: 'Keyboard', stock: 4 },
];

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #f0f0f0',
      borderRadius: 16,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform .18s, box-shadow .18s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 3, background: accent, borderRadius: '16px 16px 0 0'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#888', fontWeight: 500, letterSpacing: '.04em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <span style={{
          fontSize: 20, width: 36, height: 36, borderRadius: 10,
          background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {icon}
        </span>
      </div>

      <div style={{ fontSize: 30, fontWeight: 700, color: '#111', letterSpacing: '-1px' }}>
        {value}
      </div>

      <div style={{ fontSize: 12, color: '#aaa' }}>{sub}</div>
    </div>
  );
}

// ── Custom tooltip for chart ───────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#111', color: '#fff', borderRadius: 10,
      padding: '8px 14px', fontSize: 13
    }}>
      <div style={{ color: '#aaa', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700 }}>₹{payload[0].value.toLocaleString()}</div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState(DUMMY_STATS);
  const [salesData] = useState(DUMMY_SALES);
  const [lowStock] = useState(DUMMY_LOW_STOCK);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API}/api/dashboard`);
        setStats(data);
      } catch {
        // API not ready yet — dummy data already shown
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Sales',
      value: `₹${(stats.totalSales / 1000).toFixed(0)}k`,
      sub: 'All invoices combined',
      accent: '#6366f1',
      icon: '💰',
    },
    {
      label: 'Products',
      value: stats.totalProducts,
      sub: 'Items in inventory',
      accent: '#10b981',
      icon: '📦',
    },
    {
      label: 'Employees',
      value: stats.totalEmployees,
      sub: 'Active staff members',
      accent: '#f59e0b',
      icon: '👤',
    },
    {
      label: 'Low Stock',
      value: stats.lowStockAlerts,
      sub: 'Items need restocking',
      accent: '#ef4444',
      icon: '⚠️',
    },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f8f8f8', padding: '32px 28px' }}>

      {/* Google font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 12, color: '#aaa', fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4 }}>
            Overview
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111', letterSpacing: '-0.5px' }}>
            Dashboard
          </h1>
        </div>
        <div style={{
          fontSize: 12, color: '#888', background: '#fff',
          border: '1px solid #eee', borderRadius: 8, padding: '6px 14px'
        }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        {statCards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 28 }}>

        {/* Area chart */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Sales Overview</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Monthly revenue trend</div>
            </div>
            <div style={{
              fontSize: 11, background: '#f0fdf4', color: '#16a34a',
              border: '1px solid #bbf7d0', borderRadius: 6, padding: '3px 10px', fontWeight: 600
            }}>
              ↑ 12% this month
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#aaa' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2.5}
                fill="url(#salesGrad)" dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#6366f1' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0', padding: '20px 24px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>Monthly Bars</div>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 20 }}>Quick comparison</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#aaa' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low stock table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Low Stock Alerts</div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Items that need restocking soon</div>
          </div>
          <span style={{
            fontSize: 11, background: '#fef2f2', color: '#dc2626',
            border: '1px solid #fecaca', borderRadius: 6, padding: '3px 10px', fontWeight: 600
          }}>
            {lowStock.length} items
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f5f5f5' }}>
              <th style={{ textAlign: 'left', fontSize: 11, color: '#bbb', fontWeight: 600, padding: '0 0 10px', letterSpacing: '.05em', textTransform: 'uppercase' }}>Product</th>
              <th style={{ textAlign: 'right', fontSize: 11, color: '#bbb', fontWeight: 600, padding: '0 0 10px', letterSpacing: '.05em', textTransform: 'uppercase' }}>Stock Left</th>
              <th style={{ textAlign: 'right', fontSize: 11, color: '#bbb', fontWeight: 600, padding: '0 0 10px', letterSpacing: '.05em', textTransform: 'uppercase' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {lowStock.map((item, i) => (
              <tr key={i} style={{ borderBottom: i < lowStock.length - 1 ? '1px solid #f9f9f9' : 'none' }}>
                <td style={{ padding: '12px 0', fontSize: 14, color: '#222', fontWeight: 500 }}>
                  {item.name}
                </td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontSize: 14, color: '#111', fontWeight: 700 }}>
                  {item.stock}
                </td>
                <td style={{ padding: '12px 0', textAlign: 'right' }}>
                  <span style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 6, fontWeight: 600,
                    background: item.stock <= 3 ? '#fef2f2' : '#fefce8',
                    color: item.stock <= 3 ? '#dc2626' : '#ca8a04',
                    border: `1px solid ${item.stock <= 3 ? '#fecaca' : '#fef08a'}`,
                  }}>
                    {item.stock <= 3 ? 'Critical' : 'Low'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
