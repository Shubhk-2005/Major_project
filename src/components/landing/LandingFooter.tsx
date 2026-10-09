import React from 'react';
import { Logo } from '../ui/Logo';

const links = ['Methodology', 'Privacy', 'Terms', 'Contact'];

export function LandingFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="flex items-center gap-6">
          <Logo />
          <span className="text-[13px] text-ink-3">© 2026 MsAdmit</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-6">
          {links.map((l) =>
          <a key={l} href="#" className="text-[13px] text-ink-2 transition-colors duration-150 hover:text-ink">
              {l}
            </a>
          )}
        </nav>
      </div>
    </footer>);

}