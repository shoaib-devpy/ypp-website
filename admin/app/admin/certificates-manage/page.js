'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Sidebar';

export default function CertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(data => {
      if (!data.authenticated) router.push('/admin/login');
      else fetchCerts();
    });
  }, []);

  async function fetchCerts() {
    const res = await fetch('/api/certificates');
    if (res.ok) setCerts(await res.json());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file || !title) return setMsg('Title and file required');
    setLoading(true); setMsg('');

    const fd = new FormData();
    fd.append('file', file);
    const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
    const { path } = await upRes.json();

    await fetch('/api/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, file_path: path }),
    });

    setTitle(''); setDescription(''); setFile(null); setMsg('Certificate uploaded!');
    fetchCerts(); setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this certificate?')) return;
    await fetch(`/api/certificates?id=${id}`, { method: 'DELETE' });
    fetchCerts();
  }

  const s = {
    page: { maxWidth: 960, margin: '0 auto', padding: '24px' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid #e0e0e0' },
    backBtn: { padding: '8px 20px', borderRadius: 999, border: '1px solid #ddd', background: '#fff', color: '#666', fontWeight: 700, fontSize: 13, cursor: 'pointer', textDecoration: 'none' },
    form: { display: 'grid', gap: 14, padding: 28, background: '#fff', borderRadius: 20, border: '1px solid #e8e8e8', marginBottom: 32 },
    label: { display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 },
    input: { padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, outline: 'none' },
    textarea: { padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, outline: 'none', minHeight: 80, resize: 'vertical', fontFamily: 'inherit' },
    btn: { padding: '14px 28px', borderRadius: 999, border: 0, background: '#d4a200', color: '#1a1a1a', fontWeight: 800, fontSize: 15, cursor: 'pointer' },
    msg: { padding: '10px 16px', borderRadius: 10, background: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 14, marginBottom: 16 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 },
    card: { background: '#fff', borderRadius: 16, border: '1px solid #e8e8e8', overflow: 'hidden' },
    cardImg: { width: '100%', height: 200, objectFit: 'contain', background: '#f9f6f0', padding: 16, boxSizing: 'border-box' },
    cardBody: { padding: '14px 18px' },
    cardTitle: { fontWeight: 700, fontSize: 15, margin: '0 0 4px' },
    cardDesc: { fontSize: 13, color: '#888', margin: '0 0 10px', lineHeight: 1.5 },
    row: { display: 'flex', gap: 8 },
    dlBtn: { padding: '6px 14px', borderRadius: 8, border: '1px solid #d4a200', background: '#fff', color: '#d4a200', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'none' },
    delBtn: { padding: '6px 14px', borderRadius: 8, border: '1px solid #e53935', background: '#fff', color: '#e53935', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar active="Certificates" />
      <main style={{ flex: 1, background: '#f5f5f5', padding: 32, overflow: 'auto' }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Certificates Management</h1>
        <p style={{ margin: '0 0 24px', color: '#888', fontSize: 14 }}>Upload and manage official YPP certificates and documents</p>
      </div>

      {msg && <div style={s.msg}>{msg}</div>}

      <form style={s.form} onSubmit={handleSubmit}>
        <label style={s.label}>Certificate Title *<input style={s.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Certificate of Registration" required /></label>
        <label style={s.label}>Description<textarea style={s.textarea} value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Registered under the Societies Registration Act, 2008" /></label>
        <label style={s.label}>Certificate File (Image/PDF) *<input style={s.input} type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files[0])} required /></label>
        <button style={s.btn} disabled={loading}>{loading ? 'Uploading...' : 'Upload Certificate'}</button>
      </form>

      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Uploaded Certificates ({certs.length})</h2>
      <div style={s.grid}>
        {certs.map(cert => (
          <div key={cert.id} style={s.card}>
            <img src={cert.file_path} alt={cert.title} style={s.cardImg} />
            <div style={s.cardBody}>
              <p style={s.cardTitle}>{cert.title}</p>
              {cert.description && <p style={s.cardDesc}>{cert.description}</p>}
              <div style={s.row}>
                <a href={cert.file_path} download style={s.dlBtn}>Download</a>
                <button style={s.delBtn} onClick={() => handleDelete(cert.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {!certs.length && <p style={{ color: '#aaa', padding: 40 }}>No certificates uploaded yet</p>}
      </div>
      </main>
    </div>
  );
}
