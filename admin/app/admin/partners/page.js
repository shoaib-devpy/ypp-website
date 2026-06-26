'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Sidebar';

export default function PartnersAdmin() {
  const [partners, setPartners] = useState([]);
  const [name, setName] = useState('');
  const [order, setOrder] = useState(0);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(data => {
      if (!data.authenticated) router.push('/admin/login');
      else fetchPartners();
    });
  }, []);

  async function fetchPartners() {
    const res = await fetch('/api/partners');
    if (res.ok) setPartners(await res.json());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !file) return setMsg('Name and logo required');
    setLoading(true); setMsg('');

    const fd = new FormData(); fd.append('file', file);
    const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
    const { path } = await upRes.json();

    await fetch('/api/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, logo_path: path, sort_order: order }),
    });

    setName(''); setOrder(0); setFile(null); setMsg('Partner added!');
    fetchPartners(); setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Remove this partner?')) return;
    await fetch(`/api/partners?id=${id}`, { method: 'DELETE' });
    fetchPartners();
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar active="Partners" />
      <main style={{ flex: 1, background: '#f5f5f5', padding: 32, overflow: 'auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Partners & Accreditations</h1>
        <p style={{ margin: '0 0 24px', color: '#888', fontSize: 14 }}>Manage partner logos displayed on the homepage</p>

        {msg && <div style={{ padding: '10px 16px', borderRadius: 10, background: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{msg}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: 28, background: '#fff', borderRadius: 20, border: '1px solid #e8e8e8', marginBottom: 32 }}>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Partner Name *<input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. USAID" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} required /></label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Sort Order<input type="number" value={order} onChange={e => setOrder(+e.target.value)} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} /></label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13, gridColumn: '1/-1' }}>Logo Image *<input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} required /></label>
          <button disabled={loading} style={{ padding: '14px 28px', borderRadius: 999, border: 0, background: '#d4a200', color: '#1a1a1a', fontWeight: 800, fontSize: 15, cursor: 'pointer', gridColumn: '1/-1' }}>{loading ? 'Adding...' : 'Add Partner'}</button>
        </form>

        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Current Partners ({partners.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          {partners.map(p => (
            <div key={p.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8e8', padding: 20, textAlign: 'center' }}>
              <img src={p.logo_path} alt={p.name} style={{ maxWidth: '100%', maxHeight: 80, objectFit: 'contain', marginBottom: 12 }} />
              <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 8px' }}>{p.name}</p>
              <button onClick={() => handleDelete(p.id)} style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid #e53935', background: '#fff', color: '#e53935', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Remove</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
