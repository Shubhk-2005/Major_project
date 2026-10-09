import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, XIcon } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';

const links = [
  { href: '#matching', label: 'Matching' },
  { href: '#roadmap', label: 'Roadmap' },
  { to: '/qs-rankings', label: 'QS Top 150', badge: '2026' },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 bg-canvas transition-[border-color] duration-200 ${scrolled ? 'border-b border-line' : 'border-b border-transparent'}`}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 md:px-10">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {links.map((l) =>
            l.to ? (
              <Link
                key={l.to}
                to={l.to}
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink transition-colors duration-150 hover:text-accent"
              >
                <span>{l.label}</span>
                {l.badge && (
                  <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                    {l.badge}
                  </span>
                )}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="text-[14px] text-ink-2 transition-colors duration-150 hover:text-ink"
              >
                {l.label}
              </a>
            )
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden px-3 text-[14px] text-ink-2 transition-colors duration-150 hover:text-ink sm:inline">
            Log in
          </Link>
          <Button to="/signup" size="sm">
            Get your score
          </Button>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded border border-line text-ink-2 md:hidden"
          >
            {mobileOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-b border-line bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) =>
              l.to ? (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-1.5 text-[15px] font-medium text-ink"
                >
                  <span>{l.label}</span>
                  {l.badge && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                      {l.badge}
                    </span>
                  )}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-1.5 text-[15px] text-ink-2 hover:text-ink"
                >
                  {l.label}
                </a>
              )
            )}
            <div className="mt-2 border-t border-line pt-3">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block py-1.5 text-[15px] text-ink-2"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}