'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Sidebar';

export default function EmailSettingsPage() {
  const [form, setForm] = useState({ smtp_host: '', smtp_port: 587, smtp_user: '', smtp_pass: '', from_email: '', from_name: 'Youth Parliament Pakistan' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(data => {
      if (!data.authenticated) router.push('/admin/login');
      else fetch('/api/email-settings').then(r => r.json()).then(cfg => {
        if (cfg.smtp_host !== undefined) setForm(prev => ({ ...prev, ...cfg, smtp_pass: '' }));
      });
    });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true); setMsg('');
    const res = await fetch('/api/email-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setMsg(res.ok ? 'Email settings saved!' : 'Error saving');
    setLoading(false);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar active="Settings" />
      <main style={{ flex: 1, background: '#f5f5f5', padding: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Email Configuration</h1>
        <p style={{ margin: '0 0 24px', color: '#888', fontSize: 14 }}>Configure SMTP settings for sending emails to applicants</p>

        {msg && <div style={{ padding: '10px 16px', borderRadius: 10, background: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{msg}</div>}

        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: 28, background: '#fff', borderRadius: 20, border: '1px solid #e8e8e8', maxWidth: 700 }}>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>SMTP Host<input value={form.smtp_host} onChange={e => setForm(p => ({ ...p, smtp_host: e.target.value }))} placeholder="e.g. smtp.gmail.com" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} /></label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>SMTP Port<input type="number" value={form.smtp_port} onChange={e => setForm(p => ({ ...p, smtp_port: +e.target.value }))} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} /></label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>SMTP Username<input value={form.smtp_user} onChange={e => setForm(p => ({ ...p, smtp_user: e.target.value }))} placeholder="e.g. admin@ypp.org.pk" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} /></label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>SMTP Password<input type="password" value={form.smtp_pass} onChange={e => setForm(p => ({ ...p, smtp_pass: e.target.value }))} placeholder="Enter password" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} /></label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>From Email<input value={form.from_email} onChange={e => setForm(p => ({ ...p, from_email: e.target.value }))} placeholder="e.g. noreply@ypp.org.pk" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} /></label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 13 }}>From Name<input value={form.from_name} onChange={e => setForm(p => ({ ...p, from_name: e.target.value }))} placeholder="Youth Parliament Pakistan" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} /></label>
          <button disabled={loading} style={{ padding: '14px 28px', borderRadius: 999, border: 0, background: '#d4a200', color: '#1a1a1a', fontWeight: 800, fontSize: 15, cursor: 'pointer', gridColumn: '1/-1' }}>{loading ? 'Saving...' : 'Save Settings'}</button>
        </form>

        <div style={{ marginTop: 24, padding: 20, background: '#fff', borderRadius: 16, border: '1px solid #e8e8e8', maxWidth: 700 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>Gmail Setup Guide</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: '#666', fontSize: 13, lineHeight: 2 }}>
            <li>Host: <code>smtp.gmail.com</code></li>
            <li>Port: <code>587</code></li>
            <li>Username: Your Gmail address</li>
            <li>Password: Use an <strong>App Password</strong> (not your regular password)</li>
            <li>Go to Google Account → Security → 2-Step Verification → App Passwords</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
