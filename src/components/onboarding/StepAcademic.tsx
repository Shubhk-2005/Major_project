import React from 'react';
import { TextField } from '../ui/TextField';
import { SelectField } from '../ui/SelectField';
import { ProfileForm } from '../../types/profile';
import { FormErrors } from '../../utils/profileForm';

interface StepProps {
  form: ProfileForm;
  errors: FormErrors;
  onChange: (patch: Partial<ProfileForm>) => void;
}

export function StepAcademic({ form, errors, onChange }: StepProps) {
  return (
    <div className="space-y-10">
      <fieldset className="space-y-5">
        <legend className="font-display text-[18px] font-medium tracking-[-0.02em]">Undergraduate</legend>
        <TextField id="undergrad" label="Institution" value={form.undergrad} placeholder="e.g. University of Mumbai, IIT Delhi, BITS Pilani" onChange={(v) => onChange({ undergrad: v })} error={errors.undergrad} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id="degree" label="Degree and major" value={form.degree} placeholder="e.g. B.Tech Computer Science or B.E. Information Technology" onChange={(v) => onChange({ degree: v })} error={errors.degree} />
          <SelectField
            id="tier"
            label="Institution standing"
            value={form.institutionTier}
            onChange={(v) => onChange({ institutionTier: v })}
            options={[
              { value: '1', label: 'Tier 1 — All 25 IITs & IISc' },
              { value: '2', label: 'Tier 2 — All NITs & IIITs (also BITS)' },
              { value: '3', label: 'Tier 3 — Other Colleges (Fr. CRIT, State, Autonomous, Affiliated...)' }
            ]} />
          
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id="gpa" label="Cumulative GPA" value={form.gpa} placeholder="e.g. 8.4" onChange={(v) => onChange({ gpa: v })} inputMode="decimal" suffix="/ 10" mono error={errors.gpa} hint="Convert from 4.0 scale by multiplying by 2.5." />
        </div>
      </fieldset>


      <fieldset className="space-y-5">
        <legend className="font-display text-[18px] font-medium tracking-[-0.02em]">Target</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            id="program"
            label="Program"
            value={form.targetProgram}
            onChange={(v) => onChange({ targetProgram: v })}
            options={['MS Computer Science', 'MS Data Science', 'MS Artificial Intelligence'].map((v) => ({ value: v, label: v }))} />
          
          <SelectField
            id="intake"
            label="Intake"
            value={form.intake}
            onChange={(v) => onChange({ intake: v })}
            options={['Fall 2027', 'Spring 2028', 'Fall 2028'].map((v) => ({ value: v, label: v }))} />
          
        </div>
      </fieldset>
    </div>);

}