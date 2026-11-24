import ObfuscatedEmail from '../components/ObfuscatedEmail.jsx';

// Every line here is already published elsewhere on the site (Privacy Policy, Terms, Erasure, Subprocessors).
// Nothing new is promised on this page; when one of those documents changes, change this page with it.
const mono = "'JetBrains Mono',monospace";
const SECTIONS = [
  { h: 'Protecting your account and data', p: 'We use encryption in transit, hashed credentials, access logging and least-privilege access. Every account keeps a security log. No system is perfectly secure.', more: ['/privacy', 'Privacy Policy'] },
  { h: 'Signing in', p: 'inphox signs you in with sign-in links and one-time codes. They are removed 7 days after they can no longer be used. Keep your sign-in methods safe, do not share them, and tell us at once if you think someone else used your account.', more: ['/terms', 'Terms of Service'] },
  { h: 'Your data is yours', p: 'The records you put into inphox belong to you or your business. When you delete your account we delete or de-identify the rest within 30 days, except what the law or security needs us to keep, such as billing and tax records.', more: ['/privacy', 'How long we keep data'] },
  { h: 'Certified erasure', p: 'inphox erases supported devices by cryptographic erase, a purge method under NIST SP 800-88. Each erase is recorded with the device identifier, method, standard, result and time, and kept as a signed record. If a device is locked, faulty or cannot be verified, no certificate is issued.', more: ['/erasure', 'Erasure certificates'] },
  { h: 'Who helps us run inphox', p: 'The providers that host our databases, take payments, deliver email and text messages, ship, check addresses and supply device data are listed, with what each one does.', more: ['/subprocessors', 'Subprocessors'] }
];

export default function Security() {
  return (
    <section style={{ maxWidth: '46rem', margin: '0 auto', padding: 'clamp(2rem,6vw,4rem) 1rem', minWidth: 0 }}>
      <div style={{ fontFamily: mono, fontSize: '0.6875rem', letterSpacing: '.06em', textTransform: 'uppercase', color: '#6B6257' }}>Security</div>
      <h1 style={{ margin: '0.5rem 0 1rem', fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.05, fontWeight: 600 }}>Security at inphox</h1>
      <p style={{ margin: '0 0 2rem', fontSize: '1.0625rem', lineHeight: 1.6, color: '#3A342D' }}>
        How we protect the accounts, devices and records of the businesses that run on inphox.
      </p>
      {SECTIONS.map(s => (
        <div key={s.h} style={{ padding: '1.25rem 0', borderTop: '1px solid rgba(22,19,15,.12)' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', lineHeight: 1.25, fontWeight: 650 }}>{s.h}</h2>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1rem', lineHeight: 1.65, color: '#3A342D', overflowWrap: 'anywhere' }}>{s.p}</p>
          <a href={s.more[0]} style={{ display: 'inline-block', marginTop: '0.5rem', color: '#C2470A', fontSize: '0.9375rem' }}>{s.more[1]}</a>
        </div>
      ))}
      <div style={{ padding: '1.25rem 0', borderTop: '1px solid rgba(22,19,15,.12)' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', lineHeight: 1.25, fontWeight: 650 }}>Report a security problem</h2>
        <p style={{ margin: '0.5rem 0 0', fontSize: '1rem', lineHeight: 1.65, color: '#3A342D' }}>
          Email us and include what you found and how to reproduce it: <ObfuscatedEmail style={{ color: '#C2470A' }} />
        </p>
      </div>
    </section>
  );
}
