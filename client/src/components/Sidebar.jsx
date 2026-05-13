import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/',          icon: '📊', label: 'Dashboard' },
  { to: '/inventory', icon: '📦', label: 'Inventory' },
  { to: '/employees', icon: '👤', label: 'Employees' },
  { to: '/billing',   icon: '🧾', label: 'Billing'   },
  { to: '/ai',        icon: '🤖', label: 'AI Chat'   },
];

// ── Hook: detect mobile ────────────────────────────────────────────────────
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

// ── Desktop Sidebar ────────────────────────────────────────────────────────
export function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  return (
    <aside style={{
      width: 220, background: '#fff', borderRight: '1px solid #f0f0f0',
      display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>SmartERP</div>
            <div style={{ fontSize: 10, color: '#aaa', fontWeight: 500 }}>AI Business Suite</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, marginBottom: 2,
              fontSize: 13, fontWeight: isActive ? 600 : 500,
              color:      isActive ? '#6366f1' : '#666',
              background: isActive ? '#f0f0ff' : 'transparent',
              textDecoration: 'none', transition: 'all .12s',
            })}
          >
            <span style={{ fontSize: 17 }}>{icon}</span> {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
        </div>
        <button onClick={logout} style={{
          width: '100%', padding: '8px', borderRadius: 9, border: '1.5px solid #eee',
          background: '#fff', fontSize: 12, fontWeight: 600, color: '#888', cursor: 'pointer',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecaca'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff';    e.currentTarget.style.color = '#888';    e.currentTarget.style.borderColor = '#eee'; }}
        >Sign Out</button>
      </div>
    </aside>
  );
}

// ── Mobile drawer (slides in from left) ───────────────────────────────────
export function MobileDrawer({ open, onClose }) {
  if (!open) return null;
  return (
    <>
      {/* dark backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        zIndex: 100, backdropFilter: 'blur(2px)',
      }} />
      {/* sliding panel */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 240,
        zIndex: 101, boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        animation: 'slideIn .2s ease',
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(-100%) } to { transform: translateX(0) } }`}</style>
        <Sidebar onClose={onClose} />
      </div>
    </>
  );
}

// ── Mobile top bar ─────────────────────────────────────────────────────────
export function MobileTopBar({ onMenuOpen }) {
  const location = useLocation();
  const current  = NAV.find(n => n.to === location.pathname) || NAV[0];
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#fff', borderBottom: '1px solid #f0f0f0',
      padding: '12px 16px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onMenuOpen} style={{
          background: '#f5f5f5', border: 'none', borderRadius: 9,
          width: 36, height: 36, cursor: 'pointer', fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>☰</button>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>
          {current.icon} {current.label}
        </div>
      </div>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
      }}>⚡</div>
    </div>
  );
}

// ── Mobile bottom navigation bar ───────────────────────────────────────────
export function MobileBottomNav() {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: '#fff', borderTop: '1px solid #f0f0f0',
      display: 'flex', alignItems: 'center',
      paddingBottom: 'env(safe-area-inset-bottom)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {NAV.map(({ to, icon, label }) => (
        <NavLink key={to} to={to} end={to === '/'}
          style={({ isActive }) => ({
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '8px 4px', textDecoration: 'none', position: 'relative',
            color: isActive ? '#6366f1' : '#bbb',
          })}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div style={{
                  position: 'absolute', top: 0, width: 28, height: 3,
                  background: '#6366f1', borderRadius: '0 0 4px 4px',
                }} />
              )}
              <div style={{
                fontSize: 22, lineHeight: 1,
                filter: isActive ? 'none' : 'grayscale(1) opacity(0.45)',
                transform: isActive ? 'scale(1.15)' : 'scale(1)',
                transition: 'transform .15s',
              }}>{icon}</div>
              <div style={{
                fontSize: 10, marginTop: 3,
                fontWeight: isActive ? 700 : 500,
              }}>{label}</div>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}