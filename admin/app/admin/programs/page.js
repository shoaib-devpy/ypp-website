'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Sidebar';

export default function ProgramsAdmin() {
  const [programs, setPrograms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', eyebrow: '', lead: '', intro_title: '', intro_text: '', partner_label: 'Partner', partner: '', donor_label: 'Donor', donor: '', sort_order: 0 });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(data => {
      if (!data.authenticated) router.push('/admin/login');
      else fetchPrograms();
    });
  }, []);

  async function fetchPrograms() {
    const res = await fetch('/api/programs');
    if (res.ok) setPrograms(await res.json());
  }

  function updateForm(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title) return setMsg('Title required');
    setLoading(true); setMsg('');

    let heroImage = '';
    if (file) {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      heroImage = (await res.json()).path;
    }

    await fetch('/api/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, hero_image: heroImage }),
    });

    setForm({ title: '', eyebrow: '', lead: '', intro_title: '', intro_text: '', partner_label: 'Partner', partner: '', donor_label: 'Donor', donor: '', sort_order: 0 });
    setFile(null); setShowForm(false); setMsg('Program added!');
    fetchPrograms(); setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this program?')) return;
    await fetch(`/api/programs?id=${id}`, { method: 'DELETE' });
    fetchPrograms();
  }

  const s = {
    label: { display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 },
    input: { padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, outline: 'none' },
    textarea: { padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, outline: 'none', minHeight: 80, resize: 'vertical', fontFamily: 'inherit' },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar active="Programs" />
      <main style={{ flex: 1, background: '#f5f5f5', padding: 32, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Programs</h1>
            <p style={{ margin: 0, color: '#888', fontSize: 14 }}>Manage program pages and navigation menu</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '12px 24px', borderRadius: 999, border: 0, background: '#d4a200', color: '#1a1a1a', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>{showForm ? 'Cancel' : '+ Add Program'}</button>
        </div>

        {msg && <div style={{ padding: '10px 16px', borderRadius: 10, background: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{msg}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: 28, background: '#fff', borderRadius: 20, border: '1px solid #e8e8e8', marginBottom: 32 }}>
            <label style={s.label}>Program Title *<input style={s.input} value={form.title} onChange={e => updateForm('title', e.target.value)} placeholder="e.g. Active Citizens of Pakistan (2008)" required /></label>
            <label style={s.label}>Eyebrow<input style={s.input} value={form.eyebrow} onChange={e => updateForm('eyebrow', e.target.value)} placeholder="e.g. Civic participation" /></label>
            <label style={{ ...s.label, gridColumn: '1/-1' }}>Short Description<input style={s.input} value={form.lead} onChange={e => updateForm('lead', e.target.value)} placeholder="One-line program description" /></label>
            <label style={{ ...s.label, gridColumn: '1/-1' }}>Intro Title<input style={s.input} value={form.intro_title} onChange={e => updateForm('intro_title', e.target.value)} placeholder="Main heading on program page" /></label>
            <label style={{ ...s.label, gridColumn: '1/-1' }}>Intro Text<textarea style={s.textarea} value={form.intro_text} onChange={e => updateForm('intro_text', e.target.value)} placeholder="Full program description paragraphs (separate with blank lines)" /></label>
            <label style={s.label}>Partner Label<input style={s.input} value={form.partner_label} onChange={e => updateForm('partner_label', e.target.value)} /></label>
            <label style={s.label}>Partner Name<input style={s.input} value={form.partner} onChange={e => updateForm('partner', e.target.value)} placeholder="e.g. British Council" /></label>
            <label style={s.label}>Donor Label<input style={s.input} value={form.donor_label} onChange={e => updateForm('donor_label', e.target.value)} /></label>
            <label style={s.label}>Donor Name<input style={s.input} value={form.donor} onChange={e => updateForm('donor', e.target.value)} placeholder="e.g. USAID" /></label>
            <label style={s.label}>Sort Order<input style={s.input} type="number" value={form.sort_order} onChange={e => updateForm('sort_order', +e.target.value)} /></label>
            <label style={s.label}>Hero Image<input style={s.input} type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} /></label>
            <button disabled={loading} style={{ padding: '14px 28px', borderRadius: 999, border: 0, background: '#d4a200', color: '#1a1a1a', fontWeight: 800, fontSize: 15, cursor: 'pointer', gridColumn: '1/-1' }}>{loading ? 'Adding...' : 'Create Program'}</button>
          </form>
        )}

        <div style={{ display: 'grid', gap: 12 }}>
          {programs.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '18px 22px', background: '#fff', borderRadius: 16, border: '1px solid #e8e8e8' }}>
              {p.hero_image ? <img src={p.hero_image} alt="" style={{ width: 64, height: 48, borderRadius: 8, objectFit: 'cover' }} /> : <div style={{ width: 64, height: 48, borderRadius: 8, background: '#e8e8e8', display: 'grid', placeItems: 'center', fontSize: 12, color: '#aaa' }}>No img</div>}
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>#{i + 1} {p.title}</p>
                <p style={{ margin: '2px 0 0', color: '#888', fontSize: 13 }}>{p.eyebrow}{p.partner ? ` · ${p.partner}` : ''}{p.donor ? ` · ${p.donor}` : ''}</p>
                <p style={{ margin: '2px 0 0', color: '#aaa', fontSize: 12, fontFamily: 'monospace' }}>{p.slug}.html</p>
              </div>
              <a href={`/${p.slug}.html`} target="_blank" style={{ padding: '6px 14px', borderRadius: 8, background: '#f5f5f5', color: '#333', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>View</a>
              <button onClick={() => handleDelete(p.id)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e53935', background: '#fff', color: '#e53935', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          ))}
          {!programs.length && <p style={{ color: '#aaa', textAlign: 'center', padding: 40 }}>No programs yet</p>}
        </div>
      </main>
    </div>
  );
}
