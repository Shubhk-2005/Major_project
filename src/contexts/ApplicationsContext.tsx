import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { initialApplications } from '../data/applications';
import { universities } from '../data/universities';
import { Application } from '../types/application';

interface ApplicationsContextValue {
  applications: Application[];
  addApplication: (universityId: string) => void;
  updateApplication: (id: string, patch: Partial<Application>) => void;
  isTracked: (universityId: string) => boolean;
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null);

const STORAGE_KEY = 'msadmit_applications';

export function ApplicationsProvider({ children }: {children: React.ReactNode;}) {
  const [applications, setApplications] = useState<Application[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse stored applications', e);
    }
    return initialApplications;
  });

  const addApplication = useCallback((universityId: string) => {
    setApplications((prev) => {
      if (prev.some((a) => a.universityId === universityId)) return prev;
      const uni = universities.find((u) => u.id === universityId);
      if (!uni) return prev;
      const next: Application[] = [
        ...prev,
        {
          id: `app-${universityId}`,
          universityId,
          stage: 'shortlisted',
          deadline: uni.deadline,
          docs: { sop: 'missing', lor1: 'missing', lor2: 'missing', lor3: 'missing', transcript: 'final', resume: 'final' },
          fee: 0,
          note: 'Added from MsAdmit. Review program requirements.'
        }
      ];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.warn('Could not save application to localStorage:', err);
      }
      return next;
    });
  }, []);

  const updateApplication = useCallback((id: string, patch: Partial<Application>) => {
    setApplications((prev) => {
      const next = prev.map((a) => a.id === id ? { ...a, ...patch } : a);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.warn('Could not save application update to localStorage:', err);
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      applications,
      addApplication,
      updateApplication,
      isTracked: (uid: string) => applications.some((a) => a.universityId === uid)
    }),
    [applications, addApplication, updateApplication]
  );

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
}

export function useApplications(): ApplicationsContextValue {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) throw new Error('useApplications must be used within ApplicationsProvider');
  return ctx;
}