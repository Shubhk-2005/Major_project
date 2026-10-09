import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { initialProfile } from '../data/profile';
import { computeScore, computeShap, rankUniversities } from '../utils/scoring';
import { Profile, ShapFactor } from '../types/profile';
import { RankedUniversity } from '../types/university';
import { SopDecision } from '../types/document';

interface ProfileContextValue {
  profile: Profile;
  setProfile: (p: Profile) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  score: number;
  factors: ShapFactor[];
  ranked: RankedUniversity[];
  sopDecisions: Record<string, SopDecision>;
  setSopDecisions: (d: Record<string, SopDecision>) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: {children: React.ReactNode;}) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [sopDecisions, setSopDecisions] = useState<Record<string, SopDecision>>({});

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      setProfile,
      updateProfile,
      score: computeScore(profile),
      factors: computeShap(profile),
      ranked: rankUniversities(profile),
      sopDecisions,
      setSopDecisions
    }),
    [profile, updateProfile, sopDecisions]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}