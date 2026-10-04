// A plan's call to action, drawn with the caller's class and style. `a` comes from
// SiteLogic and is one of:
//   { post: { action, fields } }  billing service configured: a form POST to
//                                 /billing/checkout; the browser follows the redirect
//   { href }                      a link (Talk to us, for a plan checkout refuses)
//   { onClick }                   billing not configured: continue on the Start page
export default function PlanButton({ a, className, style, children }) {
  if (a.post) {
    return (
      <form method="post" action={a.post.action} style={{ margin: "0", display: "flex", flexDirection: "column", flex: style.flex }}>
        {a.post.fields.map(f => <input key={f.name} type="hidden" name={f.name} value={f.value} />)}
        <button className={className} type="submit" style={style}>{children}</button>
      </form>
    );
  }
  if (a.href) {
    return <a className={className} href={a.href} style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>{children}</a>;
  }
  return <button className={className} onClick={a.onClick} style={style}>{children}</button>;
}
