// A plan's call to action, drawn with the caller's class and style. `a` comes from
// SiteLogic and is one of:
//   { href }      a link (Talk to us, for Enterprise billed monthly)
//   { onClick }   continue to the Start page (sign-up) with the plan picked
// The website never takes payment: the plan is paid for inside the app.
export default function PlanButton({ a, className, style, children }) {
  if (a.href) {
    return <a className={className} href={a.href} style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>{children}</a>;
  }
  return <button className={className} onClick={a.onClick} style={style}>{children}</button>;
}
