'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Sidebar';

export default function GalleryAdmin() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('image');
  const [title, setTitle] = useState('');
  const [country, setCountry] = useState('pakistan');
  const [videoUrl, setVideoUrl] = useState('');
  const [platform, setPlatform] = useState('youtube');
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
    const res = await fetch('/api/gallery');
    if (res.ok) setItems(await res.json());
  }

  async function handleImageUpload(e) {
    e.preventDefault();
    if (!file || !title) return setMsg('Title and image required');
    setLoading(true); setMsg('');
    const fd = new FormData(); fd.append('file', file);
    const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
    const { path } = await upRes.json();
    await fetch('/api/gallery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'image', title, country, file_path: path }) });
    setTitle(''); setCountry('pakistan'); setFile(null); setMsg('Image uploaded!');
    fetchItems(); setLoading(false);
  }

  async function handleVideoAdd(e) {
    e.preventDefault();
    if (!videoUrl || !title) return setMsg('Title and video URL required');
    setLoading(true); setMsg('');
    await fetch('/api/gallery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'video', title, country, video_url: videoUrl, video_platform: platform }) });
    setTitle(''); setVideoUrl(''); setMsg('Video added!');
    fetchItems(); setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
    fetchItems();
  }

  const countries = [
    ['pakistan','Pakistan'],['uk','United Kingdom'],['usa','United States'],['switzerland','Switzerland'],
    ['uae','UAE'],['saudi-arabia','Saudi Arabia'],['turkey','Turkey'],['china','China'],['malaysia','Malaysia'],
    ['germany','Germany'],['france','France'],['canada','Canada'],['australia','Australia'],['japan','Japan'],
    ['south-korea','South Korea'],['india','India'],['iran','Iran'],['qatar','Qatar'],['oman','Oman'],
    ['bahrain','Bahrain'],['kuwait','Kuwait'],['egypt','Egypt'],['jordan','Jordan'],['indonesia','Indonesia'],
    ['nigeria','Nigeria'],['south-africa','South Africa'],['other','Other']
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar active="Gallery" />
      <main style={{ flex: 1, background: '#f5f5f5', padding: 32, overflow: 'auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 24px' }}>Gallery Management</h1>

        {msg && <div style={{ padding: '10px 16px', borderRadius: 10, background: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{msg}</div>}

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button onClick={() => setTab('image')} style={{ padding: '10px 24px', borderRadius: 999, border: '1px solid #ddd', background: tab === 'image' ? '#d4a200' : '#fff', color: tab === 'image' ? '#1a1a1a' : '#666', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Upload Image</button>
          <button onClick={() => setTab('video')} style={{ padding: '10px 24px', borderRadius: 999, border: '1px solid #ddd', background: tab === 'video' ? '#d4a200' : '#fff', color: tab === 'video' ? '#1a1a1a' : '#666', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Add Video</button>
        </div>

        {tab === 'image' && (
          <form onSubmit={handleImageUpload} style={{ display: 'grid', gap: 14, padding: 28, background: '#fff', borderRadius: 20, border: '1px solid #e8e8e8', marginBottom: 32 }}>
            <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Title<input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. YPP UK Delegation 2024" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} required /></label>
            <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Country<select value={country} onChange={e => setCountry(e.target.value)} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}>{countries.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Image<input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} required /></label>
            <button disabled={loading} style={{ padding: '14px 28px', borderRadius: 999, border: 0, background: '#d4a200', color: '#1a1a1a', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>{loading ? 'Uploading...' : 'Upload Image'}</button>
          </form>
        )}

        {tab === 'video' && (
          <form onSubmit={handleVideoAdd} style={{ display: 'grid', gap: 14, padding: 28, background: '#fff', borderRadius: 20, border: '1px solid #e8e8e8', marginBottom: 32 }}>
            <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Title<input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. YPP Highlights 2024" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} required /></label>
            <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Video URL<input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} required /></label>
            <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Platform<select value={platform} onChange={e => setPlatform(e.target.value)} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}><option value="youtube">YouTube</option><option value="facebook">Facebook</option><option value="instagram">Instagram</option><option value="linkedin">LinkedIn</option></select></label>
            <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Country<select value={country} onChange={e => setCountry(e.target.value)} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}>{countries.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <button disabled={loading} style={{ padding: '14px 28px', borderRadius: 999, border: 0, background: '#d4a200', color: '#1a1a1a', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>{loading ? 'Adding...' : 'Add Video'}</button>
          </form>
        )}

        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Gallery Items ({items.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
              {item.type === 'image' && item.file_path && <img src={item.file_path} alt={item.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
              {item.type === 'video' && <div style={{ height: 160, background: '#1a1f2e', display: 'grid', placeItems: 'center' }}><span style={{ padding: '4px 10px', borderRadius: 6, background: '#fff3e0', color: '#e65100', fontSize: 11, fontWeight: 700 }}>{item.video_platform?.toUpperCase() || 'VIDEO'}</span></div>}
              <div style={{ padding: '12px 16px' }}>
                <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>{item.title}</p>
                <p style={{ fontSize: 12, color: '#888', margin: '0 0 8px' }}>{item.type} · {item.country}</p>
                <button onClick={() => handleDelete(item.id)} style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid #e53935', background: '#fff', color: '#e53935', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
