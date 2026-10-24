import { isPlainClick, openSignup } from '../hub.js';

// A plan's call to action, drawn with the caller's class and style. `a` comes from SiteLogic:
//   { href, hub: true }   the InPhox hub's sign-up with the plan's code. A real link, so it works
//                         with JavaScript off and in a new tab; a plain click first checks that the
//                         hub answers and otherwise opens "Sign-up is busy, try again in a minute".
//   { href }              any other link (Talk to sales)
export default function PlanButton({ a, className, style, children }) {
  const onClick = a.hub ? e => { if (isPlainClick(e)) { e.preventDefault(); openSignup(a.href); } } : undefined;
  return <a className={className} href={a.href} onClick={onClick} style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>{children}</a>;
}
