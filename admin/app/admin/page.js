'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(data => {
      if (!data.authenticated) { router.push('/admin/login'); return; }
      setUser(data);
      fetch('/api/stats').then(r => r.json()).then(setStats);
    }).catch(() => router.push('/admin/login'));
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  if (!user) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'Inter, sans-serif' }}><p>Loading...</p></div>;

  const statCards = stats ? [
    { label: 'Total Gallery', value: stats.gallery.total, sub: `${stats.gallery.images} images · ${stats.gallery.videos} videos`, color: '#d4a200' },
    { label: 'Total Members', value: stats.members.total, sub: `${stats.members.active} active`, color: '#15a66a' },
    { label: 'Certificates', value: stats.certificates.total, sub: 'uploaded documents', color: '#1a4fd6' },
  ] : [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar active="Dashboard" email={user.email} />
      <main style={{ flex: 1, background: '#f5f5f5', padding: 32, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 4px' }}>Dashboard</h1>
            <p style={{ margin: 0, color: '#888', fontSize: 14 }}>Welcome back, {user.name || 'Admin'}</p>
          </div>
          <button onClick={handleLogout} style={{ padding: '10px 22px', borderRadius: 999, border: '1px solid #ddd', background: '#fff', color: '#666', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Logout</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
          {statCards.map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 18, padding: '24px 28px', border: '1px solid #e8e8e8', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: s.color }}></div>
              <p style={{ margin: '0 0 8px', color: '#888', fontSize: 13, fontWeight: 600 }}>{s.label}</p>
              <p style={{ margin: '0 0 4px', fontSize: 38, fontWeight: 900, letterSpacing: '-.04em' }}>{s.value}</p>
              <p style={{ margin: 0, color: '#aaa', fontSize: 12 }}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 24, border: '1px solid #e8e8e8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Recent Members</h3>
              <a href="/admin/members" style={{ fontSize: 13, color: '#d4a200', fontWeight: 700, textDecoration: 'none' }}>View All →</a>
            </div>
            {stats?.recentMembers?.length ? stats.recentMembers.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                {m.photo_path ? <img src={m.photo_path} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e8e8e8', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700, color: '#aaa' }}>{m.full_name[0]}</div>}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{m.full_name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#aaa', fontFamily: 'monospace' }}>{m.membership_id}</p>
                </div>
                <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: m.status === 'active' ? '#e8f5e9' : '#fbe9e7', color: m.status === 'active' ? '#2e7d32' : '#c62828' }}>{m.status}</span>
              </div>
            )) : <p style={{ color: '#aaa', fontSize: 13, padding: 20, textAlign: 'center' }}>No members yet</p>}
          </div>

          <div style={{ background: '#fff', borderRadius: 18, padding: 24, border: '1px solid #e8e8e8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Recent Gallery</h3>
              <a href="/admin/gallery" style={{ fontSize: 13, color: '#d4a200', fontWeight: 700, textDecoration: 'none' }}>View All →</a>
            </div>
            {stats?.recentGallery?.length ? stats.recentGallery.map(g => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                {g.file_path ? <img src={g.file_path} alt="" style={{ width: 48, height: 36, borderRadius: 6, objectFit: 'cover' }} /> : <div style={{ width: 48, height: 36, borderRadius: 6, background: '#1a1f2e', display: 'grid', placeItems: 'center', fontSize: 10, color: '#fff', fontWeight: 700 }}>{g.type.toUpperCase()}</div>}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{g.title}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>{g.type} · {new Date(g.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            )) : <p style={{ color: '#aaa', fontSize: 13, padding: 20, textAlign: 'center' }}>No gallery items yet</p>}
          </div>
        </div>

        {stats?.countries?.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 18, padding: 24, border: '1px solid #e8e8e8', marginTop: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800 }}>Gallery by Country</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {stats.countries.map(c => (
                <div key={c.country} style={{ padding: '10px 18px', borderRadius: 12, background: '#f5f5f5', fontSize: 14 }}>
                  <strong>{c.country}</strong> <span style={{ color: '#888' }}>({c.count})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
