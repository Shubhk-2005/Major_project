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

export function ApplicationsProvider({ children }: {children: React.ReactNode;}) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);

  const addApplication = useCallback((universityId: string) => {
    setApplications((prev) => {
      if (prev.some((a) => a.universityId === universityId)) return prev;
      const uni = universities.find((u) => u.id === universityId);
      if (!uni) return prev;
      return [
      ...prev,
      {
        id: `app-${universityId}`,
        universityId,
        stage: 'shortlisted',
        deadline: uni.deadline,
        docs: { sop: 'missing', lor1: 'missing', lor2: 'missing', lor3: 'missing', transcript: 'final', resume: 'final' },
        fee: 0,
        note: 'Added from MsAdmit. Review program requirements.'
      }];

    });
  }, []);

  const updateApplication = useCallback((id: string, patch: Partial<Application>) => {
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));
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