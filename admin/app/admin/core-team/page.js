'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Sidebar';

export default function CoreTeamAdmin() {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [order, setOrder] = useState(0);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(data => {
      if (!data.authenticated) router.push('/admin/login');
      else fetchMembers();
    });
  }, []);

  async function fetchMembers() {
    const res = await fetch('/api/core-team');
    if (res.ok) setMembers(await res.json());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !designation) return setMsg('Name and designation required');
    setLoading(true); setMsg('');

    let photoPath = null;
    if (file) {
      const fd = new FormData(); fd.append('file', file);
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
      const upData = await upRes.json();
      photoPath = upData.path;
    }

    await fetch('/api/core-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name, designation, photo_path: photoPath, sort_order: order }),
    });

    setName(''); setDesignation(''); setOrder(0); setFile(null); setMsg('Team member added!');
    fetchMembers(); setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Remove this team member?')) return;
    await fetch(`/api/core-team?id=${id}`, { method: 'DELETE' });
    fetchMembers();
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar active="Core Team" />
      <main style={{ flex: 1, background: '#f5f5f5', padding: 32, overflow: 'auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Core Team</h1>
        <p style={{ margin: '0 0 24px', color: '#888', fontSize: 14 }}>Manage core team members displayed on the website</p>

        {msg && <div style={{ padding: '10px 16px', borderRadius: 10, background: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{msg}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: 28, background: '#fff', borderRadius: 20, border: '1px solid #e8e8e8', marginBottom: 32 }}>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Full Name *<input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ahmed Khan" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} required /></label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Designation *<input value={designation} onChange={e => setDesignation(e.target.value)} placeholder="e.g. Coordinator Punjab" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} required /></label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Sort Order<input type="number" value={order} onChange={e => setOrder(+e.target.value)} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} /></label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Photo<input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} /></label>
          <button disabled={loading} style={{ padding: '14px 28px', borderRadius: 999, border: 0, background: '#d4a200', color: '#1a1a1a', fontWeight: 800, fontSize: 15, cursor: 'pointer', gridColumn: '1/-1' }}>{loading ? 'Adding...' : 'Add Team Member'}</button>
        </form>

        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Current Team ({members.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {members.map(m => (
            <div key={m.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8e8', overflow: 'hidden', textAlign: 'center' }}>
              {m.photo_path ? <img src={m.photo_path} alt={m.full_name} style={{ width: '100%', height: 200, objectFit: 'cover' }} /> : <div style={{ height: 200, background: '#e8e8e8', display: 'grid', placeItems: 'center', fontSize: 48, color: '#aaa' }}>{m.full_name[0]}</div>}
              <div style={{ padding: '14px 16px' }}>
                <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 2px' }}>{m.full_name}</p>
                <p style={{ fontSize: 13, color: '#d4a200', fontWeight: 600, margin: '0 0 8px' }}>{m.designation}</p>
                <button onClick={() => handleDelete(m.id)} style={{ padding: '5px 14px', borderRadius: 8, border: '1px solid #e53935', background: '#fff', color: '#e53935', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
