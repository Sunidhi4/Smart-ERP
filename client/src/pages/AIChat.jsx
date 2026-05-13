import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SUGGESTED = [
  'Which products are low in stock?',
  'Summarize total sales this month',
  'How many active employees do we have?',
  'Which invoices are still pending?',
  'What is our total monthly payroll?',
  'List all overdue invoices',
];

// ── Format AI reply — convert markdown-ish to readable text ───────────────
function FormattedReply({ text }) {
  const lines = text.split('\n').filter(l => l.trim());
  return (
    <div style={{ fontSize: 14, color: '#222', lineHeight: 1.7 }}>
      {lines.map((line, i) => {
        // bold **text**
        const parts = line.split(/\*\*(.*?)\*\*/g);
        const formatted = parts.map((p, j) =>
          j % 2 === 1
            ? <strong key={j} style={{ color: '#111', fontWeight: 700 }}>{p}</strong>
            : p
        );

        // bullet points
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <span style={{ color: '#6366f1', fontWeight: 700, marginTop: 1 }}>•</span>
              <span>{formatted}</span>
            </div>
          );
        }
        // numbered list
        if (/^\d+\./.test(line.trim())) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <span style={{ color: '#6366f1', fontWeight: 700, flexShrink: 0 }}>{line.match(/^\d+/)[0]}.</span>
              <span>{formatted}</span>
            </div>
          );
        }
        return <p key={i} style={{ marginBottom: 6 }}>{formatted}</p>;
      })}
    </div>
  );
}

// ── Single message bubble ──────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex', gap: 10, marginBottom: 20,
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
    }}>
      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16,
        background: isUser ? '#6366f1' : '#f0f0ff',
        border: isUser ? 'none' : '1.5px solid #e0e0ff',
      }}>
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '75%',
        background: isUser ? '#6366f1' : '#fff',
        color: isUser ? '#fff' : '#222',
        borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
        padding: '12px 16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: isUser ? 'none' : '1px solid #f0f0f0',
      }}>
        {isUser
          ? <span style={{ fontSize: 14 }}>{msg.text}</span>
          : <FormattedReply text={msg.text} />
        }
        <div style={{
          fontSize: 10, marginTop: 6, opacity: 0.55, textAlign: 'right',
          color: isUser ? '#fff' : '#999',
        }}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}

// ── Typing indicator ───────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'flex-start' }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, background: '#f0f0ff', border: '1.5px solid #e0e0ff',
      }}>🤖</div>
      <div style={{
        background: '#fff', border: '1px solid #f0f0f0', borderRadius: '4px 18px 18px 18px',
        padding: '14px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%', background: '#6366f1',
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: .4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Main AIChat Page ───────────────────────────────────────────────────────
export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hi! I'm your SmartERP AI assistant 👋\n\nI have access to your live business data — inventory, employees, invoices, and sales.\n\nAsk me anything about your business!",
      time: now(),
    },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  function now() {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setMessages(m => [...m, { role: 'user', text: msg, time: now() }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/api/ai/chat`, { message: msg });
      setMessages(m => [...m, { role: 'ai', text: data.reply, time: now() }]);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Something went wrong. Make sure your GEMINI_API_KEY is set in server/.env';
      setMessages(m => [...m, { role: 'ai', text: `❌ ${errMsg}`, time: now() }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => {
    setMessages([{
      role: 'ai',
      text: "Chat cleared! Ask me anything about your business 👋",
      time: now(),
    }]);
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: '#f8f8f8',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #f0f0f0',
        padding: '16px 28px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>🤖</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>SmartERP AI</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 12, color: '#10b981', fontWeight: 500 }}>
                {loading ? 'Thinking...' : 'Online • Powered by Gemini'}
              </span>
            </div>
          </div>
        </div>
        <button onClick={clearChat} style={{
          background: '#f5f5f5', border: 'none', borderRadius: 10,
          padding: '7px 16px', fontSize: 12, fontWeight: 600,
          color: '#888', cursor: 'pointer',
        }}>Clear Chat</button>
      </div>

      {/* Suggested prompts — show only at start */}
      {messages.length === 1 && (
        <div style={{ padding: '16px 28px 0', flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 10 }}>
            Suggested Questions
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SUGGESTED.map(s => (
              <button key={s} onClick={() => send(s)} style={{
                background: '#fff', border: '1.5px solid #e8e8ff', borderRadius: 20,
                padding: '7px 14px', fontSize: 12, fontWeight: 500, color: '#6366f1',
                cursor: 'pointer', transition: 'all .15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff';    e.currentTarget.style.color = '#6366f1'; }}
              >{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        background: '#fff', borderTop: '1px solid #f0f0f0',
        padding: '16px 28px', flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end',
          background: '#f8f8f8', borderRadius: 16,
          border: '1.5px solid #eee', padding: '8px 8px 8px 16px',
          transition: 'border-color .15s',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = '#6366f1'}
          onBlurCapture={e  => e.currentTarget.style.borderColor = '#eee'}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about inventory, sales, employees..."
            rows={1}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 14, color: '#111', resize: 'none', fontFamily: 'inherit',
              lineHeight: 1.5, maxHeight: 120, overflowY: 'auto', paddingTop: 4,
            }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading} style={{
            width: 38, height: 38, borderRadius: 10, border: 'none', flexShrink: 0,
            background: input.trim() && !loading ? '#6366f1' : '#e8e8e8',
            color: input.trim() && !loading ? '#fff' : '#bbb',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            fontSize: 16, transition: 'all .15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>➤</button>
        </div>
        <div style={{ fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 8 }}>
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}