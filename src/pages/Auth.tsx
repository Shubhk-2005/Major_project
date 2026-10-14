import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { useProfile } from '../contexts/ProfileContext';
import { signInWithGoogle, registerWithEmail, loginWithEmail } from '../lib/firebase';
import { api } from '../services/api';

interface AuthProps {
  mode: 'login' | 'signup';
}

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

export function Auth({ mode }: AuthProps) {
  const navigate = useNavigate();
  const { updateProfile } = useProfile();
  const isSignup = mode === 'signup';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleSubmitting(true);
    setErrors({});
    try {
      const user = await signInWithGoogle();
      updateProfile({
        name: user.displayName || user.email?.split('@')[0] || 'Applicant',
        email: user.email || ''
      });
      // Sync with MongoDB backend
      await api.getProfile();
      navigate('/app');
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setErrors({
        general: err.message || 'Failed to sign in with Google. Please check popup blockers.'
      });
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (isSignup && !name.trim()) next.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.';
    if (password.length < 6) next.password = 'Use at least 6 characters.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      if (isSignup) {
        const user = await registerWithEmail(email.trim(), password);
        updateProfile({
          name: name.trim(),
          email: user.email || email.trim()
        });
        // Sync with MongoDB backend
        await api.updateProfile({ name: name.trim(), email: email.trim() });
        navigate('/onboarding');
      } else {
        const user = await loginWithEmail(email.trim(), password);
        updateProfile({
          email: user.email || email.trim()
        });
        // Sync with MongoDB backend
        await api.getProfile();
        navigate('/app');
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      let errorMsg = err.message || 'Authentication failed.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'An account with this email already exists. Try logging in.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errorMsg = 'Invalid email or password.';
      }
      setErrors({ general: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas text-ink">
      <header className="px-6 py-6 md:px-10">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-24">
        <div className="w-full max-w-[400px]">
          <h1 className="font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.04em]">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-3 text-[15px] text-ink-2">
            {isSignup ? 'Your first competitiveness report is free.' : 'Log in to see your score and roadmap.'}
          </p>

          {errors.general && (
            <div className="mt-4 rounded-md bg-red-50 p-3 text-[13px] text-red-700 border border-red-200">
              {errors.general}
            </div>
          )}

          <Button
            variant="secondary"
            size="lg"
            className="mt-8 w-full"
            onClick={handleGoogleSignIn}
            disabled={googleSubmitting || submitting}
          >
            {googleSubmitting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="my-8 flex items-center gap-4" aria-hidden>
            <span className="h-px flex-1 bg-line" />
            <span className="text-[12px] text-ink-3">or with email</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={submit} noValidate className="space-y-5">
            {isSignup && (
              <TextField
                id="name"
                label="Full name"
                value={name}
                onChange={setName}
                autoComplete="name"
                error={errors.name}
              />
            )}
            <TextField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              error={errors.email}
            />
            <TextField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              error={errors.password}
              hint={isSignup ? 'At least 6 characters.' : undefined}
            />

            <Button type="submit" size="lg" className="w-full" disabled={submitting || googleSubmitting}>
              {submitting && <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden />}
              {isSignup ? 'Create account' : 'Log in'}
            </Button>
          </form>

          <p className="mt-8 text-[14px] text-ink-2">
            {isSignup ? 'Already have an account? ' : 'New to MsAdmit? '}
            <Link to={isSignup ? '/login' : '/signup'} className="font-medium text-accent underline-offset-4 hover:underline">
              {isSignup ? 'Log in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}