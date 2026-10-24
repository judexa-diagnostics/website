// Terms and Privacy: the same plain-text files the sign-in hub shows (line 1 "Version: ...", line 2 "Title: ...", then
// paragraphs split by blank lines). Copy changes from the hub's app/data/legal/ so both sites say the same thing.
export function parseLegal(text) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  const field = (line, key) => (line || '').startsWith(key + ':') ? line.slice(key.length + 1).trim() : '';
  const version = field(lines[0], 'Version');
  const title = field(lines[1], 'Title');
  const paragraphs = lines.slice(2).join('\n').split(/\n\s*\n/).map(p => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
  return { version, title, paragraphs };
}
