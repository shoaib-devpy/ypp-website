'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Sidebar';

export default function PagesAdmin() {
  const [data, setData] = useState(null);
  const [impact, setImpact] = useState(null);
  const [tab, setTab] = useState('about');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [newArea, setNewArea] = useState({ title: '', text: '' });
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(d => {
      if (!d.authenticated) router.push('/admin/login');
      else { fetchPage(); fetchImpact(); }
    });
  }, []);

  async function fetchPage() {
    const res = await fetch('/api/pages?key=about');
    if (res.ok) setData(await res.json());
  }

  async function fetchImpact() {
    const res = await fetch('/api/pages?key=home_impact');
    if (res.ok) setImpact(await res.json());
  }

  function updateImpact(key, val) {
    setImpact(prev => ({ ...prev, content: { ...prev.content, [key]: val } }));
  }

  function updateCounter(i, key, val) {
    const counters = [...impact.content.counters];
    counters[i] = { ...counters[i], [key]: key === 'value' ? +val : val };
    updateImpact('counters', counters);
  }

  async function saveImpact() {
    setLoading(true); setMsg('');
    const res = await fetch('/api/pages', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_key: 'home_impact', title: impact.title, subtitle: '', content: impact.content }),
    });
    setMsg(res.ok ? 'Impact section saved!' : 'Error'); setLoading(false);
  }

  async function handleSave() {
    setLoading(true); setMsg('');
    const res = await fetch('/api/pages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_key: 'about', title: data.title, subtitle: data.subtitle, content: data.content }),
    });
    setMsg(res.ok ? 'Page saved!' : 'Error saving');
    setLoading(false);
  }

  function updateContent(key, val) {
    setData(prev => ({ ...prev, content: { ...prev.content, [key]: val } }));
  }

  function updateParagraph(i, val) {
    const paras = [...data.content.paragraphs];
    paras[i] = val;
    updateContent('paragraphs', paras);
  }

  function removeParagraph(i) {
    updateContent('paragraphs', data.content.paragraphs.filter((_, idx) => idx !== i));
  }

  function addParagraph() {
    updateContent('paragraphs', [...data.content.paragraphs, '']);
  }

  function updateArea(i, key, val) {
    const areas = [...data.content.thematicAreas];
    areas[i] = { ...areas[i], [key]: val };
    updateContent('thematicAreas', areas);
  }

  function removeArea(i) {
    updateContent('thematicAreas', data.content.thematicAreas.filter((_, idx) => idx !== i));
  }

  function addArea() {
    if (!newArea.title) return;
    updateContent('thematicAreas', [...data.content.thematicAreas, { ...newArea }]);
    setNewArea({ title: '', text: '' });
  }

  if (!data) return <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}><Sidebar active="Pages" /><main style={{ flex: 1, display: 'grid', placeItems: 'center' }}>Loading...</main></div>;

  const s = {
    label: { display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 },
    input: { padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, outline: 'none', width: '100%' },
    textarea: { padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, outline: 'none', width: '100%', minHeight: 80, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 },
    section: { padding: 24, background: '#fff', borderRadius: 20, border: '1px solid #e8e8e8', marginBottom: 24 },
    removeBtn: { padding: '4px 12px', borderRadius: 8, border: '1px solid #e53935', background: '#fff', color: '#e53935', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 6 },
    addBtn: { padding: '10px 20px', borderRadius: 999, border: '1px solid #ddd', background: '#f5f5f5', color: '#333', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar active="Pages" />
      <main style={{ flex: 1, background: '#f5f5f5', padding: 32, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>About / History Page</h1>
            <p style={{ margin: 0, color: '#888', fontSize: 14 }}>Edit all content on the About page</p>
          </div>
          <button onClick={handleSave} disabled={loading} style={{ padding: '12px 32px', borderRadius: 999, border: 0, background: '#d4a200', color: '#1a1a1a', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save All Changes'}</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button onClick={() => setTab('about')} style={{ padding: '10px 24px', borderRadius: 999, border: '1px solid #ddd', background: tab === 'about' ? '#d4a200' : '#fff', color: tab === 'about' ? '#1a1a1a' : '#666', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>About / History</button>
          <button onClick={() => setTab('impact')} style={{ padding: '10px 24px', borderRadius: 999, border: '1px solid #ddd', background: tab === 'impact' ? '#d4a200' : '#fff', color: tab === 'impact' ? '#1a1a1a' : '#666', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Home Impact Section</button>
        </div>

        {msg && <div style={{ padding: '10px 16px', borderRadius: 10, background: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{msg}</div>}

        {tab === 'impact' && impact && (<>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Guiding Philosophy / Impact Section</h2>
            <button onClick={saveImpact} disabled={loading} style={{ padding: '10px 28px', borderRadius: 999, border: 0, background: '#d4a200', color: '#1a1a1a', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </div>
          <div style={s.section}>
            <div style={{ display: 'grid', gap: 14 }}>
              <label style={s.label}>Eyebrow<input style={s.input} value={impact.content.eyebrow} onChange={e => updateImpact('eyebrow', e.target.value)} /></label>
              <label style={s.label}>Title<input style={s.input} value={impact.title} onChange={e => setImpact(p => ({ ...p, title: e.target.value }))} /></label>
              <label style={s.label}>Description<textarea style={s.textarea} value={impact.content.description} onChange={e => updateImpact('description', e.target.value)} /></label>
              <label style={s.label}>Image 1 (Back)
                {impact.content.image1 && <img src={impact.content.image1} alt="" style={{ width: 150, height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 6 }} />}
                <input style={s.input} type="file" accept="image/*" onChange={async (e) => { if (!e.target.files[0]) return; const fd = new FormData(); fd.append('file', e.target.files[0]); const r = await fetch('/api/upload', { method: 'POST', body: fd }); updateImpact('image1', (await r.json()).path); }} />
                <input style={{ ...s.input, marginTop: 4, fontSize: 12, color: '#888' }} value={impact.content.image1} onChange={e => updateImpact('image1', e.target.value)} />
              </label>
              <label style={s.label}>Image 2 (Front)
                {impact.content.image2 && <img src={impact.content.image2} alt="" style={{ width: 150, height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 6 }} />}
                <input style={s.input} type="file" accept="image/*" onChange={async (e) => { if (!e.target.files[0]) return; const fd = new FormData(); fd.append('file', e.target.files[0]); const r = await fetch('/api/upload', { method: 'POST', body: fd }); updateImpact('image2', (await r.json()).path); }} />
                <input style={{ ...s.input, marginTop: 4, fontSize: 12, color: '#888' }} value={impact.content.image2} onChange={e => updateImpact('image2', e.target.value)} />
              </label>
            </div>
            <h4 style={{ margin: '20px 0 12px', fontSize: 14, fontWeight: 700 }}>Counter Stats</h4>
            {impact.content.counters?.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: 8, marginBottom: 8 }}>
                <input style={s.input} type="number" value={c.value} onChange={e => updateCounter(i, 'value', e.target.value)} placeholder="Value" />
                <input style={s.input} value={c.suffix} onChange={e => updateCounter(i, 'suffix', e.target.value)} placeholder="+" />
                <input style={s.input} value={c.label} onChange={e => updateCounter(i, 'label', e.target.value)} placeholder="Label" />
              </div>
            ))}
          </div>
        </>)}

        {tab === 'about' && (<>
        <div style={s.section}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800 }}>Page Hero</h3>
          <div style={{ display: 'grid', gap: 14 }}>
            <label style={s.label}>Eyebrow Text<input style={s.input} value={data.content.eyebrow} onChange={e => updateContent('eyebrow', e.target.value)} /></label>
            <label style={s.label}>Page Title<input style={s.input} value={data.title} onChange={e => setData(p => ({ ...p, title: e.target.value }))} /></label>
            <label style={s.label}>Page Subtitle<input style={s.input} value={data.subtitle} onChange={e => setData(p => ({ ...p, subtitle: e.target.value }))} /></label>
          </div>
        </div>

        <div style={s.section}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800 }}>History Section</h3>
          <div style={{ display: 'grid', gap: 14 }}>
            <label style={s.label}>Section Eyebrow<input style={s.input} value={data.content.sectionEyebrow} onChange={e => updateContent('sectionEyebrow', e.target.value)} /></label>
            <label style={s.label}>Section Title<input style={s.input} value={data.content.sectionTitle} onChange={e => updateContent('sectionTitle', e.target.value)} /></label>
            <label style={s.label}>Hero Image
              {data.content.heroImage && <img src={data.content.heroImage} alt="" style={{ width: 200, height: 120, objectFit: 'cover', borderRadius: 10, marginBottom: 8, border: '1px solid #ddd' }} />}
              <input style={s.input} type="file" accept="image/*" onChange={async (e) => {
                if (!e.target.files[0]) return;
                const fd = new FormData(); fd.append('file', e.target.files[0]);
                const res = await fetch('/api/upload', { method: 'POST', body: fd });
                const { path } = await res.json();
                updateContent('heroImage', path);
              }} />
              <input style={{ ...s.input, marginTop: 6, fontSize: 12, color: '#888' }} value={data.content.heroImage} onChange={e => updateContent('heroImage', e.target.value)} placeholder="or enter path manually" />
            </label>
          </div>

          <h4 style={{ margin: '20px 0 12px', fontSize: 14, fontWeight: 700 }}>Paragraphs</h4>
          {data.content.paragraphs.map((p, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <textarea style={s.textarea} value={p} onChange={e => updateParagraph(i, e.target.value)} />
              <button style={s.removeBtn} onClick={() => removeParagraph(i)}>Remove</button>
            </div>
          ))}
          <button style={s.addBtn} onClick={addParagraph}>+ Add Paragraph</button>
        </div>

        <div style={s.section}>
          <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800 }}>Thematic Areas</h3>
          <label style={s.label}><span>Section Title</span><input style={s.input} value={data.content.thematicTitle} onChange={e => updateContent('thematicTitle', e.target.value)} /></label>

          <div style={{ marginTop: 16 }}>
            {data.content.thematicAreas.map((area, i) => (
              <div key={i} style={{ padding: 16, borderRadius: 14, background: '#f9f9f9', border: '1px solid #eee', marginBottom: 10 }}>
                <input style={{ ...s.input, fontWeight: 700, marginBottom: 8 }} value={area.title} onChange={e => updateArea(i, 'title', e.target.value)} />
                <textarea style={s.textarea} value={area.text} onChange={e => updateArea(i, 'text', e.target.value)} />
                <button style={s.removeBtn} onClick={() => removeArea(i)}>Remove</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gap: 8, marginTop: 12, padding: 16, borderRadius: 14, background: '#f0f7f0', border: '1px dashed #ccc' }}>
            <input style={s.input} placeholder="New area title" value={newArea.title} onChange={e => setNewArea(p => ({ ...p, title: e.target.value }))} />
            <textarea style={s.textarea} placeholder="Description" value={newArea.text} onChange={e => setNewArea(p => ({ ...p, text: e.target.value }))} />
            <button style={s.addBtn} onClick={addArea}>+ Add Thematic Area</button>
          </div>
        </div>
        </>)}
      </main>
    </div>
  );
}
