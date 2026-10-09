import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { useProfile } from '../contexts/ProfileContext';

interface AuthProps {
  mode: 'login' | 'signup';
}

interface Errors {
  name?: string;
  email?: string;
  password?: string;
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (isSignup && !name.trim()) next.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.';
    if (password.length < 8) next.password = 'Use at least 8 characters.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    window.setTimeout(() => {
      if (isSignup) updateProfile({ name: name.trim(), email: email.trim() });
      navigate(isSignup ? '/onboarding' : '/app');
    }, 600);
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

          <Button variant="secondary" size="lg" className="mt-8 w-full" onClick={() => navigate(isSignup ? '/onboarding' : '/app')}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path fill="#141414" d="M21.35 11.1H12v3.2h5.35c-.23 1.4-1.63 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.95S8.78 6.5 12 6.5c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.7 3.95 14.55 3 12 3 7.03 3 3 7.03 3 12s4.03 9 9 9c5.2 0 8.64-3.65 8.64-8.8 0-.6-.07-1.05-.29-1.1z" />
            </svg>
            Continue with Google
          </Button>

          <div className="my-8 flex items-center gap-4" aria-hidden>
            <span className="h-px flex-1 bg-line" />
            <span className="text-[12px] text-ink-3">or with email</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={submit} noValidate className="space-y-5">
            {isSignup && <TextField id="name" label="Full name" value={name} onChange={setName} autoComplete="name" error={errors.name} />}
            <TextField id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} />
            <TextField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              error={errors.password}
              hint={isSignup ? 'At least 8 characters.' : undefined} />
            
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
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
    </div>);

}