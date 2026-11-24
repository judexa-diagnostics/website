// Shown for any path the site does not have. The server answers it with a real 404 (dist/404.html).
export default function NotFound() {
  return (
    <section style={{ maxWidth: '40rem', margin: '0 auto', padding: 'clamp(3rem,8vw,6rem) 1rem', minWidth: 0 }}>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6875rem', letterSpacing: '.06em', textTransform: 'uppercase', color: '#6B6257' }}>404</div>
      <h1 style={{ margin: '0.5rem 0 1rem', fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.05, fontWeight: 600 }}>This page does not exist</h1>
      <p style={{ margin: '0 0 1.5rem', fontSize: '1.0625rem', lineHeight: 1.6, color: '#3A342D' }}>The link may be old or mistyped.</p>
      <p style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.25rem', margin: 0 }}>
        <a href="/" style={{ color: '#C2470A', fontWeight: 600 }}>Home</a>
        <a href="/features" style={{ color: '#C2470A' }}>Features</a>
        <a href="/pricing" style={{ color: '#C2470A' }}>Pricing</a>
        <a href="/about" style={{ color: '#C2470A' }}>About</a>
        <a href="/contact" style={{ color: '#C2470A' }}>Contact</a>
      </p>
    </section>
  );
}
