import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { appNavigation } from '../../data/navigation';
import { useProfile } from '../../contexts/ProfileContext';

export function Sidebar() {
  const { profile, score } = useProfile();
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[232px] flex-col border-r border-line bg-canvas px-4 py-6 lg:flex">
      <div className="px-2">
        <Logo to="/app" />
      </div>
      <nav aria-label="Primary" className="mt-10 flex flex-col gap-0.5">
        {appNavigation.map((item) =>
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
          `flex items-center gap-3 rounded px-2 py-2 text-[14px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${isActive ? 'bg-white text-ink shadow-[0_0_0_1px_#E8E8E3]' : 'text-ink-2 hover:bg-black/[0.03] hover:text-ink'}`
          }>
          
            {({ isActive }) =>
          <>
                <item.icon className={`h-4 w-4 ${isActive ? 'text-accent' : 'text-ink-3'}`} strokeWidth={1.75} aria-hidden />
                {item.label}
              </>
          }
          </NavLink>
        )}
      </nav>
      <div className="mt-auto border-t border-line px-2 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-ink">{profile.name}</p>
            <p className="truncate text-[12px] text-ink-3">
              {profile.targetProgram} · {profile.intake}
            </p>
          </div>
          <span className="font-mono text-[13px] tabular-nums text-accent" aria-label={`Score ${score}`}>
            {score}
          </span>
        </div>
        <div className="mt-4 flex gap-4 text-[12px] text-ink-3">
          <Link to="/onboarding" className="transition-colors duration-150 hover:text-ink">
            Edit profile
          </Link>
          <Link to="/" className="transition-colors duration-150 hover:text-ink">
            Log out
          </Link>
        </div>
      </div>
    </aside>);

}