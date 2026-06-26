'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Sidebar';

export default function SliderAdmin() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [order, setOrder] = useState(0);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(data => {
      if (!data.authenticated) router.push('/admin/login');
      else fetchItems();
    });
  }, []);

  async function fetchItems() {
    const res = await fetch('/api/slider');
    if (res.ok) setItems(await res.json());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return setMsg('Image required');
    setLoading(true); setMsg('');

    const fd = new FormData(); fd.append('file', file);
    const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
    const { path } = await upRes.json();

    await fetch('/api/slider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, file_path: path, sort_order: order }),
    });

    setTitle(''); setOrder(0); setFile(null); setMsg('Slide added!');
    fetchItems(); setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this slide?')) return;
    await fetch(`/api/slider?id=${id}`, { method: 'DELETE' });
    fetchItems();
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar active="Slider" />
      <main style={{ flex: 1, background: '#f5f5f5', padding: 32, overflow: 'auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Home Slider</h1>
        <p style={{ margin: '0 0 24px', color: '#888', fontSize: 14 }}>Manage the full-width background slider on the homepage</p>

        {msg && <div style={{ padding: '10px 16px', borderRadius: 10, background: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{msg}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: 28, background: '#fff', borderRadius: 20, border: '1px solid #e8e8e8', marginBottom: 32 }}>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Title (optional)<input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. YPP UK Delegation" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} /></label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Sort Order<input type="number" value={order} onChange={e => setOrder(+e.target.value)} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} /></label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13, gridColumn: '1/-1' }}>Slide Image *<input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} required /></label>
          <button disabled={loading} style={{ padding: '14px 28px', borderRadius: 999, border: 0, background: '#d4a200', color: '#1a1a1a', fontWeight: 800, fontSize: 15, cursor: 'pointer', gridColumn: '1/-1' }}>{loading ? 'Uploading...' : 'Add Slide'}</button>
        </form>

        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Current Slides ({items.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {items.map((item, i) => (
            <div key={item.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8e8', overflow: 'hidden', position: 'relative' }}>
              <img src={item.file_path} alt={item.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 10, left: 10, padding: '4px 10px', borderRadius: 8, background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: 12, fontWeight: 700 }}>#{i + 1}</div>
              <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{item.title || 'Untitled'}</p>
                  <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>Order: {item.sort_order}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e53935', background: '#fff', color: '#e53935', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))}
          {!items.length && <p style={{ color: '#aaa', padding: 40 }}>No slides yet. Add your first slide above.</p>}
        </div>
      </main>
    </div>
  );
}
