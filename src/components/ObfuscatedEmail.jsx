import { useEffect, useState } from 'react';

/**
 * Obfuscated email component to prevent static web scrapers and email harvesters
 * from harvesting plain "mailto:" addresses from source markup.
 * Renders user@domain dynamically in the DOM.
 */
export default function ObfuscatedEmail({
  user = 'christopher',
  domain = 'inphox.net',
  subject,
  style,
  className,
  children,
}) {
  const [addr, setAddr] = useState('');

  useEffect(() => {
    setAddr(`${user}@${domain}`);
  }, [user, domain]);

  const target = addr || `${user}@${domain}`;
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  const mailtoHref = addr ? `mailto:${target}${query}` : '#';

  const handleClick = (e) => {
    if (!addr) {
      e.preventDefault();
      window.location.href = `mailto:${user}@${domain}${query}`;
    }
  };

  return (
    <a
      href={mailtoHref}
      style={style}
      className={className}
      onClick={handleClick}
      rel="nofollow"
    >
      {children || addr || <span>{user} [at] {domain}</span>}
    </a>
  );
}
