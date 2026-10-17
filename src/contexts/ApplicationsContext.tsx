import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { initialApplications } from '../data/applications';
import { universities } from '../data/universities';
import { Application } from '../types/application';
import { Tier, University, FitReason } from '../types/university';

interface ApplicationsContextValue {
  applications: Application[];
  addApplication: (
    universityId: string,
    universityData?: Partial<University>,
    fitTier?: Tier,
    fitScore?: number,
    reasons?: FitReason[]
  ) => void;
  removeApplication: (idOrUid: string) => void;
  updateApplication: (id: string, patch: Partial<Application>) => void;
  isTracked: (universityId: string) => boolean;
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null);

const STORAGE_KEY = 'msadmit_applications';

export function ApplicationsProvider({ children }: { children: React.ReactNode }) {
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

  const addApplication = useCallback(
    (
      universityId: string,
      universityData?: Partial<University>,
      fitTier?: Tier,
      fitScore?: number,
      reasons?: FitReason[]
    ) => {
      setApplications((prev) => {
        const normUid = universityId.toLowerCase().trim();

        // Check if already tracked
        if (
          prev.some(
            (a) =>
              a.universityId.toLowerCase() === normUid ||
              a.id === `app-${universityId}` ||
              (universityData?.name && a.universityName && a.universityName.toLowerCase() === universityData.name.toLowerCase())
          )
        ) {
          return prev;
        }

        // Try finding in static universities list as fallback
        const staticUni = universities.find(
          (u) =>
            u.id.toLowerCase() === normUid ||
            u.name.toLowerCase() === normUid ||
            u.name.toLowerCase().replace(/\s+/g, '-') === normUid
        );

        const uniName =
          universityData?.name ||
          staticUni?.name ||
          universityId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        const uniProgram = universityData?.program || staticUni?.program || 'MS in Computer Science';
        const uniCountry = universityData?.country || staticUni?.country || 'United States';
        const uniDeadline = universityData?.deadline || staticUni?.deadline || '2027-01-15';
        const tierVal: Tier = fitTier || (staticUni ? 'target' : 'consider');

        const next: Application[] = [
          ...prev,
          {
            id: `app-${universityId}`,
            universityId,
            universityName: uniName,
            program: uniProgram,
            country: uniCountry,
            tier: tierVal,
            fitScore: fitScore,
            reasons: reasons,
            stage: 'shortlisted',
            deadline: uniDeadline,
            docs: {
              sop: 'missing',
              lor1: 'missing',
              lor2: 'missing',
              lor3: 'missing',
              transcript: 'final',
              resume: 'final'
            },
            fee: universityData?.tuition ? Math.round(universityData.tuition * 0.002) || 85 : 85,
            note: `Added from MsAdmit Recommendations. Review ${uniProgram} requirements.`
          }
        ];

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (err) {
          console.warn('Could not save application to localStorage:', err);
        }
        return next;
      });
    },
    []
  );

  const removeApplication = useCallback((idOrUid: string) => {
    setApplications((prev) => {
      const target = idOrUid.toLowerCase().trim();
      const next = prev.filter(
        (a) =>
          a.id.toLowerCase() !== target &&
          a.universityId.toLowerCase() !== target &&
          (a.universityName || '').toLowerCase().replace(/\s+/g, '-') !== target
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.warn('Could not save application removal to localStorage:', err);
      }
      return next;
    });
  }, []);

  const updateApplication = useCallback((id: string, patch: Partial<Application>) => {
    setApplications((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...patch } : a));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.warn('Could not save application update to localStorage:', err);
      }
      return next;
    });
  }, []);

  const isTracked = useCallback(
    (uid: string) => {
      const target = uid.toLowerCase().trim();
      return applications.some(
        (a) =>
          a.universityId.toLowerCase() === target ||
          a.id === `app-${uid}` ||
          (a.universityName && a.universityName.toLowerCase().replace(/\s+/g, '-') === target)
      );
    },
    [applications]
  );

  const value = useMemo(
    () => ({
      applications,
      addApplication,
      removeApplication,
      updateApplication,
      isTracked
    }),
    [applications, addApplication, removeApplication, updateApplication, isTracked]
  );

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
}

export function useApplications(): ApplicationsContextValue {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) throw new Error('useApplications must be used within ApplicationsProvider');
  return ctx;
}