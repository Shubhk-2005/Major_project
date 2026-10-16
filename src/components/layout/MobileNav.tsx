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
      <nav aria-label="Primary" className="flex gap-1.5 overflow-x-auto px-4 pb-2">
        {appNavigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              item.isSpecial
                ? `whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                      : 'bg-violet-50 text-violet-700 border border-violet-200/80 hover:bg-violet-100'
                  }`
                : `whitespace-nowrap rounded px-3 py-1.5 text-[13px] transition-colors duration-150 ${
                    isActive ? 'bg-white text-ink shadow-[0_0_0_1px_#E8E8E3]' : 'text-ink-2 hover:text-ink'
                  }`
            }
          >
            {item.isSpecial && <item.icon className="h-3.5 w-3.5 shrink-0" />}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>);

}