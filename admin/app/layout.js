export const metadata = {
  title: 'YPP Admin Dashboard',
  description: 'Manage gallery, videos, and content for Youth Parliament Pakistan',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, sans-serif', background: '#f5f5f5', color: '#1a2e23' }}>
        {children}
      </body>
    </html>
  );
}
