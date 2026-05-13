import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, MobileDrawer, MobileTopBar, MobileBottomNav, useIsMobile } from './components/Sidebar';

import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Employees from './pages/Employees';
import Billing   from './pages/Billing';
import AIChat    from './pages/AIChat';

// ── Protected layout — wraps every page that needs login ──────────────────
function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  const isMobile          = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // still checking localStorage for saved token
  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'sans-serif', color: '#aaa', fontSize: 14,
    }}>
      Loading...
    </div>
  );

  // not logged in → send to login page
  if (!user) return <Navigate to="/login" replace />;

  // ── Mobile layout ──
  if (isMobile) {
    return (
      <div style={{ background: '#f8f8f8', minHeight: '100vh' }}>
        <MobileTopBar onMenuOpen={() => setDrawerOpen(true)} />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <div style={{ paddingBottom: 80 }}>{children}</div>
        <MobileBottomNav />
      </div>
    );
  }

  // ── Desktop layout ──
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', background: '#f8f8f8' }}>
        {children}
      </main>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes — each wrapped in ProtectedLayout */}
          <Route path="/"          element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/inventory" element={<ProtectedLayout><Inventory /></ProtectedLayout>} />
          <Route path="/employees" element={<ProtectedLayout><Employees /></ProtectedLayout>} />
          <Route path="/billing"   element={<ProtectedLayout><Billing   /></ProtectedLayout>} />
          <Route path="/ai"        element={<ProtectedLayout><AIChat    /></ProtectedLayout>} />

          {/* Anything else → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}