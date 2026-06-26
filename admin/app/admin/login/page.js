'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push('/admin');
    } else {
      setError(data.error || 'Invalid credentials');
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #f5f7f6, #eef2f0)' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: 40, background: '#fff', borderRadius: 28, boxShadow: '0 20px 60px rgba(0,0,0,.08)', border: '1px solid rgba(0,0,0,.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #d4a200, #e6b800)', display: 'grid', placeItems: 'center', margin: '0 auto 16px', fontSize: 28, fontWeight: 900, color: '#1a1a1a' }}>Y</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-.02em' }}>Admin Login</h1>
          <p style={{ margin: 0, color: '#888', fontSize: 14 }}>Youth Parliament Pakistan Dashboard</p>
        </div>

        {error && <div style={{ padding: '10px 16px', borderRadius: 10, background: '#fbe9e7', color: '#c62828', fontWeight: 600, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 14 }}>
            Email
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@ypp.org.pk"
              style={{ padding: '14px 18px', borderRadius: 14, border: '1px solid #ddd', fontSize: 15, outline: 'none' }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 700, fontSize: 14 }}>
            Password
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{ padding: '14px 18px', borderRadius: 14, border: '1px solid #ddd', fontSize: 15, outline: 'none' }}
            />
          </label>
          <button
            type="submit" disabled={loading}
            style={{ padding: '16px 28px', borderRadius: 999, border: 0, background: 'linear-gradient(135deg, #d4a200, #e6b800)', color: '#1a1a1a', fontWeight: 800, fontSize: 16, cursor: 'pointer', marginTop: 8 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
