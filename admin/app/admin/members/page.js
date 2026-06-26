'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Sidebar';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ membership_id: '', full_name: '', father_name: '', cnic: '', province: '', city: '', phone: '', email: '', blood_group: '', profession: '', status: 'active' });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(data => {
      if (!data.authenticated) router.push('/admin/login');
      else fetchMembers();
    });
  }, []);

  async function fetchMembers() {
    const res = await fetch('/api/members');
    if (res.ok) setMembers(await res.json());
  }

  function updateForm(key, val) { setForm(prev => ({ ...prev, [key]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.membership_id || !form.full_name) return setMsg('Membership ID and Name required');
    setLoading(true); setMsg('');

    let photoPath = null;
    if (photo) {
      const fd = new FormData();
      fd.append('file', photo);
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
      const upData = await upRes.json();
      photoPath = upData.path;
    }

    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, photo_path: photoPath }),
    });

    if (res.ok) {
      setMsg('Member added!');
      setForm({ membership_id: '', full_name: '', father_name: '', cnic: '', province: '', city: '', phone: '', email: '', blood_group: '', profession: '', status: 'active' });
      setPhoto(null);
      fetchMembers();
    } else {
      const err = await res.json();
      setMsg(err.detail?.includes('duplicate') ? 'Membership ID already exists' : 'Error adding member');
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this member?')) return;
    await fetch(`/api/members?id=${id}`, { method: 'DELETE' });
    fetchMembers();
  }

  const filtered = members.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.membership_id.toLowerCase().includes(search.toLowerCase())
  );

  const s = {
    page: { maxWidth: 1100, margin: '0 auto', padding: '24px' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid #e0e0e0' },
    backBtn: { padding: '8px 20px', borderRadius: 999, border: '1px solid #ddd', background: '#fff', color: '#666', fontWeight: 700, fontSize: 13, cursor: 'pointer', textDecoration: 'none' },
    form: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: 28, background: '#fff', borderRadius: 20, border: '1px solid #e8e8e8', marginBottom: 32 },
    fullSpan: { gridColumn: '1 / -1' },
    label: { display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 },
    input: { padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, outline: 'none' },
    select: { padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 },
    btn: { padding: '14px 28px', borderRadius: 999, border: 0, background: '#d4a200', color: '#1a1a1a', fontWeight: 800, fontSize: 15, cursor: 'pointer', gridColumn: '1 / -1' },
    msg: { padding: '10px 16px', borderRadius: 10, background: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 14, marginBottom: 16 },
    search: { padding: '12px 18px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, width: '100%', maxWidth: 400, outline: 'none', marginBottom: 20 },
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e8e8e8' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', borderBottom: '1px solid #e8e8e8', background: '#fafafa' },
    td: { padding: '12px 16px', fontSize: 14, borderBottom: '1px solid #f0f0f0' },
    photo: { width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #d4a200' },
    status: (s) => ({ padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: s === 'active' ? '#e8f5e9' : '#fbe9e7', color: s === 'active' ? '#2e7d32' : '#c62828' }),
    delBtn: { padding: '4px 12px', borderRadius: 8, border: '1px solid #e53935', background: '#fff', color: '#e53935', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar active="Members" />
      <main style={{ flex: 1, background: '#f5f5f5', padding: 32, overflow: 'auto' }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Members Management</h1>
        <p style={{ margin: '0 0 24px', color: '#888', fontSize: 14 }}>Add, search, and manage YPP members for verification</p>
      </div>

      {msg && <div style={s.msg}>{msg}</div>}

      <form style={s.form} onSubmit={handleSubmit}>
        <label style={s.label}>Membership ID *<input style={s.input} value={form.membership_id} onChange={e => updateForm('membership_id', e.target.value)} placeholder="e.g. YPP-2024-001" required /></label>
        <label style={s.label}>Full Name *<input style={s.input} value={form.full_name} onChange={e => updateForm('full_name', e.target.value)} placeholder="e.g. Ahmed Khan" required /></label>
        <label style={s.label}>Father Name<input style={s.input} value={form.father_name} onChange={e => updateForm('father_name', e.target.value)} placeholder="e.g. Muhammad Khan" /></label>
        <label style={s.label}>CNIC / Passport<input style={s.input} value={form.cnic} onChange={e => updateForm('cnic', e.target.value)} placeholder="e.g. 35201-1234567-8" /></label>
        <label style={s.label}>Province
          <select style={s.select} value={form.province} onChange={e => updateForm('province', e.target.value)}>
            <option value="">Select</option>
            <option>Punjab</option><option>Sindh</option><option>Khyber Pakhtunkhwa</option><option>Balochistan</option><option>Gilgit-Baltistan</option><option>Azad Jammu & Kashmir</option><option>Islamabad</option>
          </select>
        </label>
        <label style={s.label}>City<input style={s.input} value={form.city} onChange={e => updateForm('city', e.target.value)} placeholder="e.g. Lahore" /></label>
        <label style={s.label}>Phone<input style={s.input} value={form.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="e.g. +923001234567" /></label>
        <label style={s.label}>Email<input style={s.input} type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="e.g. ahmed@gmail.com" /></label>
        <label style={s.label}>Blood Group
          <select style={s.select} value={form.blood_group} onChange={e => updateForm('blood_group', e.target.value)}>
            <option value="">Select</option>
            <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
          </select>
        </label>
        <label style={s.label}>Profession<input style={s.input} value={form.profession} onChange={e => updateForm('profession', e.target.value)} placeholder="e.g. Software Engineer" /></label>
        <label style={s.label}>Status
          <select style={s.select} value={form.status} onChange={e => updateForm('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>
        <label style={s.label}>Photo<input style={s.input} type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} /></label>
        <button style={s.btn} disabled={loading}>{loading ? 'Adding...' : 'Add Member'}</button>
      </form>

      <input style={s.search} placeholder="Search by name or membership ID..." value={search} onChange={e => setSearch(e.target.value)} />

      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Photo</th>
            <th style={s.th}>ID</th>
            <th style={s.th}>Name</th>
            <th style={s.th}>City</th>
            <th style={s.th}>Status</th>
            <th style={s.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(m => (
            <tr key={m.id}>
              <td style={s.td}>{m.photo_path ? <img src={m.photo_path} alt="" style={s.photo} /> : <div style={{ ...s.photo, background: '#eee', display: 'grid', placeItems: 'center', fontSize: 14 }}>{m.full_name[0]}</div>}</td>
              <td style={{ ...s.td, fontWeight: 700, fontFamily: 'monospace' }}>{m.membership_id}</td>
              <td style={s.td}><strong>{m.full_name}</strong><br/><span style={{ color: '#888', fontSize: 12 }}>{m.profession}</span></td>
              <td style={s.td}>{m.city}, {m.province}</td>
              <td style={s.td}><span style={s.status(m.status)}>{m.status}</span></td>
              <td style={s.td}><button style={s.delBtn} onClick={() => handleDelete(m.id)}>Delete</button></td>
            </tr>
          ))}
          {!filtered.length && <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#aaa', padding: 40 }}>No members found</td></tr>}
        </tbody>
      </table>
      </main>
    </div>
  );
}
