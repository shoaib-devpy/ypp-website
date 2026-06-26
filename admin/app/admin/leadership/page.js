'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Sidebar';

export default function LeadershipAdmin() {
  const [leaders, setLeaders] = useState([]);
  const [form, setForm] = useState({ full_name: '', designation: '', quote: '', bio: '', sign_text: '', wiki_url: '', sort_order: 0 });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(data => {
      if (!data.authenticated) router.push('/admin/login');
      else fetchLeaders();
    });
  }, []);

  async function fetchLeaders() {
    const res = await fetch('/api/leadership');
    if (res.ok) setLeaders(await res.json());
  }

  function updateForm(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.full_name || !form.designation) return setMsg('Name and designation required');
    setLoading(true); setMsg('');

    let photoPath = null;
    if (file) {
      const fd = new FormData(); fd.append('file', file);
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
      photoPath = (await upRes.json()).path;
    }

    await fetch('/api/leadership', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, photo_path: photoPath }),
    });

    setForm({ full_name: '', designation: '', quote: '', bio: '', sign_text: '', wiki_url: '', sort_order: 0 });
    setFile(null); setMsg('Leader added!');
    fetchLeaders(); setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Remove this leader?')) return;
    await fetch(`/api/leadership?id=${id}`, { method: 'DELETE' });
    fetchLeaders();
  }

  const s = {
    label: { display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 },
    input: { padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, outline: 'none' },
    textarea: { padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, outline: 'none', minHeight: 100, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar active="Leadership" />
      <main style={{ flex: 1, background: '#f5f5f5', padding: 32, overflow: 'auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Leadership</h1>
        <p style={{ margin: '0 0 24px', color: '#888', fontSize: 14 }}>Manage leadership profiles displayed on the website</p>

        {msg && <div style={{ padding: '10px 16px', borderRadius: 10, background: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{msg}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: 28, background: '#fff', borderRadius: 20, border: '1px solid #e8e8e8', marginBottom: 32 }}>
          <label style={s.label}>Full Name *<input style={s.input} value={form.full_name} onChange={e => updateForm('full_name', e.target.value)} placeholder="e.g. Abrar Ul Haq" required /></label>
          <label style={s.label}>Designation *<input style={s.input} value={form.designation} onChange={e => updateForm('designation', e.target.value)} placeholder="e.g. Founder & Chairman" required /></label>
          <label style={{ ...s.label, gridColumn: '1/-1' }}>Quote<input style={s.input} value={form.quote} onChange={e => updateForm('quote', e.target.value)} placeholder="A short inspiring quote..." /></label>
          <label style={{ ...s.label, gridColumn: '1/-1' }}>Biography<textarea style={s.textarea} value={form.bio} onChange={e => updateForm('bio', e.target.value)} placeholder="Full biography text..." /></label>
          <label style={{ ...s.label, gridColumn: '1/-1' }}>Signature Text<textarea style={{ ...s.textarea, minHeight: 60 }} value={form.sign_text} onChange={e => updateForm('sign_text', e.target.value)} placeholder="e.g. With best wishes, Name, Title..." /></label>
          <label style={s.label}>Wikipedia URL<input style={s.input} value={form.wiki_url} onChange={e => updateForm('wiki_url', e.target.value)} placeholder="https://en.wikipedia.org/wiki/..." /></label>
          <label style={s.label}>Sort Order<input style={s.input} type="number" value={form.sort_order} onChange={e => updateForm('sort_order', +e.target.value)} /></label>
          <label style={{ ...s.label, gridColumn: '1/-1' }}>Photo<input style={s.input} type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} /></label>
          <button disabled={loading} style={{ padding: '14px 28px', borderRadius: 999, border: 0, background: '#d4a200', color: '#1a1a1a', fontWeight: 800, fontSize: 15, cursor: 'pointer', gridColumn: '1/-1' }}>{loading ? 'Adding...' : 'Add Leader'}</button>
        </form>

        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Current Leadership ({leaders.length})</h2>
        <div style={{ display: 'grid', gap: 16 }}>
          {leaders.map((l, i) => (
            <div key={l.id} style={{ display: 'flex', gap: 20, alignItems: 'center', padding: '20px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e8e8e8' }}>
              {l.photo_path ? <img src={l.photo_path} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid #d4a200' }} /> : <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e8e8e8', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 700, color: '#aaa' }}>{l.full_name[0]}</div>}
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>#{i + 1} {l.full_name}</p>
                <p style={{ margin: '2px 0 0', color: '#d4a200', fontSize: 14, fontWeight: 600 }}>{l.designation}</p>
                {l.quote && <p style={{ margin: '6px 0 0', color: '#888', fontSize: 13, fontStyle: 'italic' }}>"{l.quote.substring(0, 100)}..."</p>}
              </div>
              <button onClick={() => handleDelete(l.id)} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #e53935', background: '#fff', color: '#e53935', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Remove</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
