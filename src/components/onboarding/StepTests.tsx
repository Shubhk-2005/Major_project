import React from 'react';
import { TextField } from '../ui/TextField';
import { ProfileForm } from '../../types/profile';
import { FormErrors } from '../../utils/profileForm';

interface StepProps {
  form: ProfileForm;
  errors: FormErrors;
  onChange: (patch: Partial<ProfileForm>) => void;
}

export function StepTests({ form, errors, onChange }: StepProps) {
  return (
    <div className="space-y-10">
      <fieldset className="space-y-5">
        <legend className="font-display text-[18px] font-medium tracking-[-0.02em]">GRE General</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id="gre" label="Total score" value={form.gre} placeholder="e.g. 320" onChange={(v) => onChange({ gre: v })} inputMode="numeric" suffix="/ 340" mono error={errors.gre} hint="Your best single sitting." />
        </div>
      </fieldset>
      <fieldset className="space-y-5">
        <legend className="font-display text-[18px] font-medium tracking-[-0.02em]">English proficiency</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id="toefl" label="TOEFL iBT" value={form.toefl} placeholder="e.g. 105" onChange={(v) => onChange({ toefl: v })} inputMode="numeric" suffix="/ 120" mono error={errors.toefl} hint="For IELTS, 7.5 ≈ 104." />
        </div>
      </fieldset>
      <p className="max-w-[520px] text-[14px] leading-relaxed text-ink-3">
        Scores are compared against the admitted medians of each program. You can update them later from the Roadmap simulator without changing your saved profile.
      </p>
    </div>);

}