'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Sidebar';

export default function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(data => {
      if (!data.authenticated) router.push('/admin/login');
      else fetchApps();
    });
  }, []);

  async function fetchApps() {
    const res = await fetch('/api/applications');
    if (res.ok) setApps(await res.json());
  }

  async function handleAction() {
    if (!status) return;
    setLoading(true);
    await fetch('/api/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, status, admin_comment: comment, membership_id: membershipId }),
    });
    setSelected(null); setStatus(''); setComment(''); setMembershipId('');
    fetchApps(); setLoading(false);
  }

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);
  const counts = { all: apps.length, pending: apps.filter(a => a.status === 'pending').length, approved: apps.filter(a => a.status === 'approved').length, rejected: apps.filter(a => a.status === 'rejected').length };

  const statusColor = (s) => ({ pending: '#e65100', approved: '#2e7d32', rejected: '#c62828', reapply: '#f57c00' }[s] || '#888');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar active="Applications" />
      <main style={{ flex: 1, background: '#f5f5f5', padding: 32, overflow: 'auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Membership Applications</h1>
        <p style={{ margin: '0 0 24px', color: '#888', fontSize: 14 }}>Review, approve, reject, or request reapply</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 18px', borderRadius: 999, border: '1px solid #ddd', background: filter === f ? '#d4a200' : '#fff', color: filter === f ? '#1a1a1a' : '#666', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f] || 0})
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map(app => (
            <div key={app.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center', padding: '18px 22px', background: '#fff', borderRadius: 16, border: '1px solid #e8e8e8' }}>
              {app.photo_path ? <img src={app.photo_path} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e8e8e8', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 700, color: '#aaa' }}>{app.full_name[0]}</div>}
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{app.full_name}</p>
                <p style={{ margin: '2px 0 0', color: '#888', fontSize: 13 }}>{app.email} · {app.city}, {app.province} · {app.profession}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#aaa' }}>{new Date(app.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: `${statusColor(app.status)}15`, color: statusColor(app.status) }}>{app.status}</span>
                {app.status === 'pending' && (
                  <button onClick={() => { setSelected(app); setStatus(''); setComment(app.admin_comment || ''); setMembershipId(app.membership_id || ''); }} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #d4a200', background: '#fff', color: '#d4a200', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Review</button>
                )}
                {app.status === 'approved' && (
                  <a href="/admin/members" style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #2e7d32', background: '#e8f5e9', color: '#2e7d32', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>View Member</a>
                )}
                {app.status === 'reapply' && (
                  <button onClick={() => { setSelected(app); setStatus(''); setComment(app.admin_comment || ''); setMembershipId(app.membership_id || ''); }} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #d4a200', background: '#fff', color: '#d4a200', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Review Again</button>
                )}
              </div>
            </div>
          ))}
          {!filtered.length && <p style={{ color: '#aaa', textAlign: 'center', padding: 40 }}>No applications found</p>}
        </div>

        {/* Review Modal */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'grid', placeItems: 'center', zIndex: 100 }} onClick={() => setSelected(null)}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'auto', background: '#fff', borderRadius: 24, padding: 32 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                {selected.photo_path ? <img src={selected.photo_path} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #d4a200' }} /> : <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e8e8e8', display: 'grid', placeItems: 'center', fontSize: 28, fontWeight: 700, color: '#aaa' }}>{selected.full_name[0]}</div>}
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>{selected.full_name}</h2>
                  <p style={{ margin: 0, color: '#888', fontSize: 14 }}>{selected.email}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14, marginBottom: 20 }}>
                {[['Father', selected.father_name], ['CNIC', selected.cnic], ['Province', selected.province], ['City', selected.city], ['Phone', `${selected.country_code} ${selected.phone}`], ['Blood Group', selected.blood_group], ['Profession', selected.profession], ['Applied', new Date(selected.created_at).toLocaleDateString()]].map(([k, v]) => v && (
                  <div key={k}><strong style={{ color: '#888', fontSize: 12 }}>{k}</strong><br/>{v}</div>
                ))}
              </div>

              {selected.why_join && <div style={{ padding: 14, borderRadius: 10, background: '#f5f5f5', marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}><strong style={{ fontSize: 12, color: '#888' }}>Why Join</strong><br/>{selected.why_join}</div>}
              {selected.mail_address && <div style={{ padding: 14, borderRadius: 10, background: '#f5f5f5', marginBottom: 16, fontSize: 14 }}><strong style={{ fontSize: 12, color: '#888' }}>Address</strong><br/>{selected.mail_address}</div>}

              {(selected.photo_path || selected.cv_path) && (
                <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                  {selected.photo_path && <a href={selected.photo_path} target="_blank" style={{ padding: '8px 16px', borderRadius: 10, background: '#f5f5f5', color: '#333', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>📷 View Photo</a>}
                  {selected.cv_path && <a href={selected.cv_path} target="_blank" download style={{ padding: '8px 16px', borderRadius: 10, background: '#f5f5f5', color: '#333', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>📄 Download CV</a>}
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid #e8e8e8', margin: '20px 0' }} />

              <div style={{ display: 'grid', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Action
                  <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}>
                    <option value="">Select action</option>
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                    <option value="reapply">Request Reapply</option>
                  </select>
                </label>
                {status === 'approved' && (
                  <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Membership ID *<input value={membershipId} onChange={e => setMembershipId(e.target.value)} placeholder="e.g. YPP-2024-001" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} /></label>
                )}
                <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>Comment to Applicant<textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Optional message..." style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} /></label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleAction} disabled={!status || loading} style={{ padding: '14px 28px', borderRadius: 999, border: 0, background: '#d4a200', color: '#1a1a1a', fontWeight: 800, fontSize: 15, cursor: 'pointer', flex: 1 }}>{loading ? 'Processing...' : 'Submit'}</button>
                  <button onClick={() => setSelected(null)} style={{ padding: '14px 28px', borderRadius: 999, border: '1px solid #ddd', background: '#fff', color: '#666', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
