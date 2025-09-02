export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 Test Page</h1>
      <p>If you can see this, Next.js is working!</p>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>Environment Check:</h2>
        <p>NEXT_PUBLIC_SITE_URL: {process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET'}</p>
        <p>NODE_ENV: {process.env.NODE_ENV || 'NOT SET'}</p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
          ← Back to Homepage
        </a>
      </div>
    </div>
  );
}