import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { AppFooter } from './AppFooter';

export function AppShell() {
  const location = useLocation();
  const reduce = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full bg-canvas text-ink flex flex-col">
      <Sidebar />
      <MobileNav />
      <main className="lg:pl-[232px] flex-1 flex flex-col">
        <motion.div
          key={location.pathname}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="mx-auto max-w-[1200px] px-6 py-10 md:px-10 md:py-12 flex-1 w-full">
          <ErrorBoundary fallbackTitle="Something went wrong loading this page">
            <Outlet />
          </ErrorBoundary>
        </motion.div>
        <AppFooter />
      </main>
    </div>
  );
}