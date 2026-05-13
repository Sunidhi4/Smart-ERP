import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin]   = useState(true);
  const [form, setForm]         = useState({ name: '', email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login, register }     = useAuth();
  const navigate                = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.email || !form.password) return setError('Email and password are required.');
    if (!isLogin && !form.name)        return setError('Name is required.');

    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    }
    setLoading(false);
  };

  const handleKey = e => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #f0f0ff 0%, #f8f8ff 50%, #fff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", padding: 16,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          }}>⚡</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', letterSpacing: '-0.5px' }}>SmartERP</h1>
          <p style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>AI-powered business management</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 20, border: '1px solid #f0f0f0',
          padding: '32px 28px', boxShadow: '0 8px 40px rgba(99,102,241,0.08)',
        }}>
          {/* Toggle */}
          <div style={{
            display: 'flex', background: '#f5f5f5', borderRadius: 12,
            padding: 4, marginBottom: 24,
          }}>
            {['Login', 'Register'].map(tab => (
              <button key={tab} onClick={() => { setIsLogin(tab === 'Login'); setError(''); setForm({ name: '', email: '', password: '' }); }} style={{
                flex: 1, padding: '9px', borderRadius: 9, border: 'none',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                background: (tab === 'Login') === isLogin ? '#fff' : 'transparent',
                color:      (tab === 'Login') === isLogin ? '#111' : '#999',
                boxShadow:  (tab === 'Login') === isLogin ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>{tab}</button>
            ))}
          </div>

          {/* Fields */}
          {!isLogin && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} onKeyDown={handleKey}
                placeholder="e.g. Priya Sharma" type="text"
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Email</label>
            <input name="email" value={form.email} onChange={handleChange} onKeyDown={handleKey}
              placeholder="you@company.com" type="email"
              style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Password</label>
            <input name="password" value={form.password} onChange={handleChange} onKeyDown={handleKey}
              placeholder="Min 6 characters" type="password"
              style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
              padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16,
            }}>❌ {error}</div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: 12, border: 'none',
            background: loading ? '#a5b4fc' : '#6366f1',
            color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .15s',
          }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#4f46e5'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#6366f1'; }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In →' : 'Create Account →'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#ccc', marginTop: 20 }}>
          SmartERP AI • Secured with JWT
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1.5px solid #eee', fontSize: 14, color: '#111',
  outline: 'none', background: '#fafafa', boxSizing: 'border-box',
  transition: 'border-color .15s', fontFamily: 'inherit',
};
const focusStyle = e => e.target.style.borderColor = '#6366f1';
const blurStyle  = e => e.target.style.borderColor = '#eee';
