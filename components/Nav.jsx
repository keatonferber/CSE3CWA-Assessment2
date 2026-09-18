import Link from 'next/link';
import { site } from '@/lib/site';

const primaryLinks = [
  ['/', 'Home'],
  ['/wordle', 'Wordle'],
  ['/word-search', 'Word Search'],
  ['/words', 'Word Lists'],
  ['/activities', 'Activity Settings']
];

export default function Nav() {
  return (
    <header className="siteHeader">
      <div className="navShell">
        <Link className="brand" href="/">
          <span className="brandMark" aria-hidden="true">/θ/</span>
          <span><strong>{site.appName}</strong><small>{site.assessmentTitle}</small></span>
        </Link>

        <nav className="desktopNav" aria-label="Primary navigation">
          {primaryLinks.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          <details className="moreMenu">
            <summary aria-label="More pages">⋮</summary>
            <div className="menuPanel">
              <Link href="/about">About</Link>
              <Link href="/settings">Settings</Link>
            </div>
          </details>
        </nav>

        <details className="mobileMenu">
          <summary aria-label="Open navigation menu">☰</summary>
          <nav className="mobilePanel" aria-label="Compact navigation">
            {primaryLinks.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
            <Link href="/about">About</Link>
            <Link href="/settings">Settings</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
