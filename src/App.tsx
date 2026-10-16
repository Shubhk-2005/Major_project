import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProfileProvider } from './contexts/ProfileContext';
import { ApplicationsProvider } from './contexts/ApplicationsContext';
import { AppShell } from './components/layout/AppShell';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Explorer } from './pages/Explorer';
import { Recommendations } from './pages/Recommendations';
import { Tracker } from './pages/Tracker';
import { Documents } from './pages/Documents';
import { Roadmap } from './pages/Roadmap';
import { QsRankings } from './pages/QsRankings';

export function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <ApplicationsProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/qs-rankings" element={<QsRankings standalone />} />
            <Route path="/login" element={<Auth key="login" mode="login" />} />
            <Route path="/signup" element={<Auth key="signup" mode="signup" />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="explorer" element={<Navigate to="/app/recommendations" replace />} />
              <Route path="recommendations" element={<Recommendations />} />
              <Route path="qs-rankings" element={<QsRankings />} />
              <Route path="tracker" element={<Tracker />} />
              <Route path="documents" element={<Documents />} />
              <Route path="roadmap" element={<Roadmap />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ApplicationsProvider>
      </ProfileProvider>
    </BrowserRouter>);

}