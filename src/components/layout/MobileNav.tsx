import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { appNavigation } from '../../data/navigation';
import { useProfile } from '../../contexts/ProfileContext';

export function MobileNav() {
  const { score } = useProfile();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas lg:hidden">
      <div className="flex h-14 items-center justify-between px-6">
        <Logo to="/app" />
        <span className="font-mono text-[13px] tabular-nums text-accent">Score {score}</span>
      </div>
      <nav aria-label="Primary" className="flex gap-1 overflow-x-auto px-4 pb-2">
        {appNavigation.map((item) =>
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
          `whitespace-nowrap rounded px-3 py-1.5 text-[13px] transition-colors duration-150 ${isActive ? 'bg-white text-ink shadow-[0_0_0_1px_#E8E8E3]' : 'text-ink-2 hover:text-ink'}`
          }>
          
            {item.label}
          </NavLink>
        )}
      </nav>
    </header>);

}