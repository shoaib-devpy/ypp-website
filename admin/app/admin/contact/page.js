'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Sidebar';

export default function ContactAdmin() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(data => {
      if (!data.authenticated) router.push('/admin/login');
      else fetchMessages();
    });
  }, []);

  async function fetchMessages() {
    const res = await fetch('/api/contact');
    if (res.ok) setMessages(await res.json());
  }

  async function markRead(id) {
    await fetch('/api/contact', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchMessages();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this message?')) return;
    await fetch(`/api/contact?id=${id}`, { method: 'DELETE' });
    setSelected(null);
    fetchMessages();
  }

  const unread = messages.filter(m => !m.is_read).length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar active="Contact" />
      <main style={{ flex: 1, background: '#f5f5f5', padding: 32, overflow: 'auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Contact Messages</h1>
        <p style={{ margin: '0 0 24px', color: '#888', fontSize: 14 }}>{unread} unread · {messages.length} total</p>

        <div style={{ display: 'grid', gap: 8 }}>
          {messages.map(m => (
            <div key={m.id} onClick={() => { setSelected(m); if (!m.is_read) markRead(m.id); }} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, padding: '16px 20px', background: '#fff', borderRadius: 14, border: `1px solid ${m.is_read ? '#e8e8e8' : '#d4a200'}`, cursor: 'pointer', borderLeft: m.is_read ? '1px solid #e8e8e8' : '4px solid #d4a200' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{m.full_name} {!m.is_read && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#d4a200', marginLeft: 6 }}></span>}</p>
                <p style={{ margin: '2px 0 0', color: '#888', fontSize: 13 }}>{m.email}{m.subject ? ` · ${m.subject}` : ''}</p>
                <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500 }}>{m.message}</p>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, color: '#aaa', whiteSpace: 'nowrap' }}>
                {new Date(m.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          ))}
          {!messages.length && <p style={{ color: '#aaa', textAlign: 'center', padding: 40 }}>No messages yet</p>}
        </div>

        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'grid', placeItems: 'center', zIndex: 100 }} onClick={() => setSelected(null)}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, background: '#fff', borderRadius: 24, padding: 32, maxHeight: '80vh', overflow: 'auto' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>{selected.full_name}</h2>
              <p style={{ margin: '0 0 4px', color: '#888', fontSize: 14 }}>{selected.email}</p>
              {selected.subject && <p style={{ margin: '0 0 16px', color: '#d4a200', fontSize: 14, fontWeight: 600 }}>{selected.subject}</p>}
              <div style={{ padding: 20, borderRadius: 14, background: '#f5f5f5', lineHeight: 1.7, fontSize: 15, whiteSpace: 'pre-wrap' }}>{selected.message}</div>
              <p style={{ margin: '16px 0 0', color: '#aaa', fontSize: 12 }}>{new Date(selected.created_at).toLocaleString()}</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your message to YPP'}`} style={{ padding: '12px 24px', borderRadius: 999, background: '#d4a200', color: '#1a1a1a', fontWeight: 800, fontSize: 14, textDecoration: 'none', flex: 1, textAlign: 'center' }}>Reply via Email</a>
                <button onClick={() => handleDelete(selected.id)} style={{ padding: '12px 24px', borderRadius: 999, border: '1px solid #e53935', background: '#fff', color: '#e53935', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
