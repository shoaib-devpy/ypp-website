'use client';

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Slider', href: '/admin/slider', icon: '🎞' },
  { label: 'Programs', href: '/admin/programs', icon: '📚' },
  { label: 'Gallery', href: '/admin/gallery', icon: '🖼' },
  { label: 'Contact', href: '/admin/contact', icon: '✉️' },
  { label: 'Engagements', href: '/admin/engagements', icon: '🌍' },
  { label: 'Applications', href: '/admin/applications', icon: '📋' },
  { label: 'Leadership', href: '/admin/leadership', icon: '👔' },
  { label: 'Core Team', href: '/admin/core-team', icon: '🏛' },
  { label: 'Members', href: '/admin/members', icon: '👥' },
  { label: 'Partners', href: '/admin/partners', icon: '🤝' },
  { label: 'Certificates', href: '/admin/certificates-manage', icon: '📜' },
  { label: 'Pages', href: '/admin/pages', icon: '📄' },
  { label: 'Settings', href: '/admin/email-settings', icon: '⚙️' },
];

export default function Sidebar({ active, email }) {
  return (
    <aside style={{ width: 240, background: '#1a2e23', color: '#fff', padding: '28px 0', flexShrink: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '0 24px 24px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#d4a200', display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 900, color: '#1a1a1a' }}>Y</div>
          <div><strong style={{ fontSize: 14 }}>YPP Admin</strong>{email && <><br/><span style={{ fontSize: 11, opacity: .6 }}>{email}</span></>}</div>
        </div>
      </div>
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {NAV.map(n => (
          <a key={n.href} href={n.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, color: n.label === active ? '#fff' : 'rgba(255,255,255,.6)', background: n.label === active ? 'rgba(212,162,0,.2)' : 'transparent', textDecoration: 'none', fontSize: 14, fontWeight: n.label === active ? 700 : 500, marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>{n.label}
          </a>
        ))}
      </nav>
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,.1)' }}>
        <a href="/" target="_blank" style={{ display: 'block', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', textDecoration: 'none', fontSize: 13, textAlign: 'center' }}>View Website →</a>
      </div>
    </aside>
  );
}
