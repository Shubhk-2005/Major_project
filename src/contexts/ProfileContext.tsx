import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { initialProfile } from '../data/profile';
import { computeScore, computeShap, rankUniversities } from '../utils/scoring';
import { Profile, ShapFactor } from '../types/profile';
import { RankedUniversity } from '../types/university';
import { SopDecision } from '../types/document';
import { auth, onAuthStateChanged, FirebaseUser, logoutUser } from '../lib/firebase';
import { api } from '../services/api';

interface ProfileContextValue {
  profile: Profile;
  setProfile: (p: Profile) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  score: number;
  factors: ShapFactor[];
  ranked: RankedUniversity[];
  sopDecisions: Record<string, SopDecision>;
  setSopDecisions: (d: Record<string, SopDecision>) => void;
  currentUser: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [sopDecisions, setSopDecisions] = useState<Record<string, SopDecision>>({});
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Live ML predictions from backend
  const [liveScore, setLiveScore] = useState<number | null>(null);
  const [liveFactors, setLiveFactors] = useState<ShapFactor[] | null>(null);
  const [liveRanked, setLiveRanked] = useState<RankedUniversity[] | null>(null);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch saved profile from MongoDB Atlas via FastAPI backend
        const remote = await api.getProfile();
        if (remote) {
          setProfile((prev) => ({
            ...prev,
            ...remote,
            name: user.displayName || remote.name || prev.name,
            email: user.email || remote.email || prev.email
          }));
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync profile changes to backend and fetch ML predictions
  useEffect(() => {
    let isCancelled = false;

    async function syncBackendML() {
      // 1. Predict competitiveness & SHAP factors
      const pred = await api.predictCompetitiveness(profile);
      if (!isCancelled && pred) {
        setLiveScore(pred.score);
        if (pred.factors && pred.factors.length > 0) {
          setLiveFactors(pred.factors);
        }
      }

      // 2. Recommend 3-3-3 university portfolio
      const rec = await api.recommendPortfolio(profile);
      if (!isCancelled && rec && rec.length > 0) {
        setLiveRanked(rec);
      }
    }

    syncBackendML();

    return () => {
      isCancelled = true;
    };
  }, [profile]);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      // Async sync to MongoDB Atlas
      api.updateProfile(patch);
      return next;
    });
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setCurrentUser(null);
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      setProfile,
      updateProfile,
      // Fallback to local heuristic if backend is initializing
      score: liveScore ?? computeScore(profile),
      factors: liveFactors ?? computeShap(profile),
      ranked: liveRanked ?? rankUniversities(profile),
      sopDecisions,
      setSopDecisions,
      currentUser,
      loading,
      logout
    }),
    [profile, updateProfile, sopDecisions, currentUser, loading, logout, liveScore, liveFactors, liveRanked]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}