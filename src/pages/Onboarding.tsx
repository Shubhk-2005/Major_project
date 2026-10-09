import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { ProgressLine } from '../components/onboarding/ProgressLine';
import { StepAcademic } from '../components/onboarding/StepAcademic';
import { StepTests } from '../components/onboarding/StepTests';
import { StepDocuments, UploadKey } from '../components/onboarding/StepDocuments';
import { StepReview } from '../components/onboarding/StepReview';
import { useProfile } from '../contexts/ProfileContext';
import { FormErrors, fromForm, toForm, validateStep } from '../utils/profileForm';
import { ProfileForm } from '../types/profile';
import { UploadedFile } from '../types/document';

const steps = ['Academic', 'Test scores', 'Documents', 'Review'] as const;
const intros = [
{ title: 'Your academic background', body: 'The basics committees screen on first.' },
{ title: 'Test scores', body: 'Enter your best official scores.' },
{ title: 'Upload documents', body: 'Your SOP and letters are scored for specificity and program fit.' },
{ title: 'Review and submit', body: 'Check everything once. You can edit your profile anytime.' }];


export function Onboarding() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { profile, setProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProfileForm>(() => toForm(profile));
  const [errors, setErrors] = useState<FormErrors>({});
  const [files, setFiles] = useState<Record<UploadKey, UploadedFile[]>>({
    resume: [{ name: 'Resume_Sep2026.pdf', size: 190464 }],
    sop: [],
    lor: []
  });
  const [analyzing, setAnalyzing] = useState(false);

  const draft = useMemo(() => fromForm(form, profile), [form, profile]);

  const update = (patch: Partial<ProfileForm>) => {
    setForm((f) => ({ ...f, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      (Object.keys(patch) as (keyof ProfileForm)[]).forEach((k) => delete next[k]);
      return next;
    });
  };

  const next = () => {
    const errs = validateStep(step, form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (step < steps.length - 1) {
      setStep(step + 1);
      window.scrollTo(0, 0);
      return;
    }
    setAnalyzing(true);
    window.setTimeout(() => {
      setProfile(draft);
      navigate('/app');
    }, 1400);
  };

  return (
    <div className="min-h-screen w-full bg-canvas text-ink">
      <header className="flex items-center justify-between px-6 py-6 md:px-10">
        <Logo />
        <Button variant="ghost" size="sm" to="/app">
          Save and exit
        </Button>
      </header>

      <main className="mx-auto max-w-[680px] px-6 pb-24 pt-8">
        <ProgressLine steps={steps} current={step} onStepClick={setStep} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduce ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -12 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="mt-16">
            
            <h1 className="font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] md:text-[44px]">{intros[step].title}</h1>
            <p className="mt-3 text-[15px] text-ink-2">{intros[step].body}</p>
            <div className="mt-12">
              {step === 0 && <StepAcademic form={form} errors={errors} onChange={update} />}
              {step === 1 && <StepTests form={form} errors={errors} onChange={update} />}
              {step === 2 && <StepDocuments files={files} onChange={(k, f) => setFiles((prev) => ({ ...prev, [k]: f }))} />}
              {step === 3 && <StepReview draft={draft} files={files} onEdit={setStep} />}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-14 flex items-center justify-between border-t border-line pt-6">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || analyzing}>
            Back
          </Button>
          <Button onClick={next} disabled={analyzing} size="lg">
            {step === steps.length - 1 ? 'Submit and score' : 'Continue'}
          </Button>
        </div>

        {analyzing &&
        <div role="status" className="mt-8">
            <p className="text-[14px] text-ink-2">Scoring your profile against Top QS Computer Science programs…</p>
            <div className="mt-3 h-[2px] overflow-hidden bg-line-strong">
              <motion.div className="h-full bg-accent" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.3, ease: [0.65, 0, 0.35, 1] }} />
            </div>
          </div>
        }
      </main>
    </div>);

}