'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Sidebar';

export default function EngagementsAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', country: 'uk', sort_order: 0 });
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
    const res = await fetch('/api/engagements');
    if (res.ok) setItems(await res.json());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !file) return setMsg('Title and file required');
    setLoading(true); setMsg('');

    const fd = new FormData(); fd.append('file', file);
    const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
    const { path } = await upRes.json();

    await fetch('/api/engagements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, file_path: path }),
    });

    setForm({ title: '', description: '', country: 'uk', sort_order: 0 }); setFile(null); setMsg('Report uploaded!');
    fetchItems(); setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this report?')) return;
    await fetch(`/api/engagements?id=${id}`, { method: 'DELETE' });
    fetchItems();
  }

  const countries = [['uk','United Kingdom'],['usa','United States'],['switzerland','Switzerland'],['uae','UAE'],['saudi-arabia','Saudi Arabia'],['turkey','Turkey'],['china','China'],['malaysia','Malaysia'],['germany','Germany'],['france','France'],['canada','Canada'],['australia','Australia'],['japan','Japan'],['south-korea','South Korea'],['india','India'],['iran','Iran'],['qatar','Qatar'],['oman','Oman'],['bahrain','Bahrain'],['kuwait','Kuwait'],['egypt','Egypt'],['jordan','Jordan'],['indonesia','Indonesia'],['nigeria','Nigeria'],['south-africa','South Africa'],['general','General/Pakistan']];
  const countryLabel = (c) => countries.find(([k]) => k === c)?.[1] || c;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar active="Engagements" />
      <main style={{ flex: 1, background: '#f5f5f5', padding: 32, overflow: 'auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Global Engagements</h1>
        <p style={{ margin: '0 0 24px', color: '#888', fontSize: 14 }}>Manage delegation reports and visit documentation</p>

        {msg && <div style={{ padding: '10px 16px', borderRadius: 10, background: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{msg}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: 28, background: '#fff', borderRadius: 20, border: '1px solid #e8e8e8', marginBottom: 32 }}>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Report Title *<input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. UK Report 2025" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} required /></label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Country *
            <select value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}>
              {countries.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13, gridColumn: '1/-1' }}>Description<input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of the report" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} /></label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Report File (PDF) *<input type="file" accept=".pdf,image/*" onChange={e => setFile(e.target.files[0])} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} required /></label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Sort Order<input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: +e.target.value }))} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} /></label>
          <button disabled={loading} style={{ padding: '14px 28px', borderRadius: 999, border: 0, background: '#d4a200', color: '#1a1a1a', fontWeight: 800, fontSize: 15, cursor: 'pointer', gridColumn: '1/-1' }}>{loading ? 'Uploading...' : 'Add Report'}</button>
        </form>

        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Reports ({items.length})</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,162,0,.1)', display: 'grid', placeItems: 'center', color: '#d4a200', flexShrink: 0 }}>📄</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{item.title}</p>
                <p style={{ margin: '2px 0 0', color: '#888', fontSize: 13 }}>{countryLabel(item.country)}{item.description ? ` · ${item.description}` : ''}</p>
              </div>
              <a href={item.file_path} target="_blank" style={{ padding: '6px 16px', borderRadius: 8, background: '#f5f5f5', color: '#333', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>View</a>
              <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #e53935', background: '#fff', color: '#e53935', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
