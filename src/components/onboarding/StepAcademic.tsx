import React from 'react';
import { CheckIcon, GlobeIcon, InfoIcon } from 'lucide-react';
import { TextField } from '../ui/TextField';
import { SelectField } from '../ui/SelectField';
import { ProfileForm } from '../../types/profile';
import { FormErrors } from '../../utils/profileForm';

interface StepProps {
  form: ProfileForm;
  errors: FormErrors;
  onChange: (patch: Partial<ProfileForm>) => void;
}

const PRIMARY_DESTINATIONS = [
  { id: 'United States', label: 'United States', count: 36, flag: '🇺🇸' },
  { id: 'United Kingdom', label: 'United Kingdom', count: 12, flag: '🇬🇧' },
  { id: 'Australia', label: 'Australia', count: 9, flag: '🇦🇺' },
  { id: 'Canada', label: 'Canada', count: 6, flag: '🇨🇦' },
  { id: 'Germany', label: 'Germany', count: 6, flag: '🇩🇪' },
  { id: 'Singapore', label: 'Singapore', count: 3, flag: '🇸🇬' },
];

const REGIONAL_DESTINATIONS = [
  {
    id: 'All Europe',
    label: 'All Europe',
    count: 45,
    flag: '🇪🇺',
    note: 'Incl. Switzerland, Netherlands, France, Italy, Belgium, Sweden, etc.',
  },
  {
    id: 'All Asia',
    label: 'All Asia',
    count: 31,
    flag: '🌏',
    note: 'Incl. Japan, South Korea, Hong Kong, China, Taiwan, etc.',
  },
];

export function StepAcademic({ form, errors, onChange }: StepProps) {
  const selected = form.targetCountries || ['all'];
  const isAll = selected.includes('all') || selected.length === 0;

  const isSelected = (id: string) => {
    if (id === 'all') return isAll;
    return !isAll && selected.includes(id);
  };

  const toggleDestination = (id: string) => {
    if (id === 'all') {
      onChange({ targetCountries: ['all'] });
      return;
    }

    if (isAll) {
      onChange({ targetCountries: [id] });
      return;
    }

    if (selected.includes(id)) {
      const remaining = selected.filter((item) => item !== id && item !== 'all');
      onChange({ targetCountries: remaining.length > 0 ? remaining : ['all'] });
    } else {
      const updated = [...selected.filter((item) => item !== 'all'), id];
      onChange({ targetCountries: updated });
    }
  };

  return (
    <div className="space-y-10">
      <fieldset className="space-y-5">
        <legend className="font-display text-[18px] font-medium tracking-[-0.02em]">Undergraduate</legend>
        <TextField
          id="undergrad"
          label="Institution"
          value={form.undergrad}
          placeholder="e.g. University of Mumbai, IIT Delhi, BITS Pilani"
          onChange={(v) => onChange({ undergrad: v })}
          error={errors.undergrad}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="degree"
            label="Degree and major"
            value={form.degree}
            placeholder="e.g. B.Tech Computer Science or B.E. Information Technology"
            onChange={(v) => onChange({ degree: v })}
            error={errors.degree}
          />
          <SelectField
            id="tier"
            label="Institution standing"
            value={form.institutionTier}
            onChange={(v) => onChange({ institutionTier: v })}
            options={[
              { value: '1', label: 'Tier 1 — All 25 IITs & IISc' },
              { value: '2', label: 'Tier 2 — All NITs & IIITs (also BITS)' },
              { value: '3', label: 'Tier 3 — Other Colleges (Fr. CRIT, State, Autonomous, Affiliated...)' },
            ]}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="gpa"
            label="Cumulative GPA"
            value={form.gpa}
            placeholder="e.g. 8.4"
            onChange={(v) => onChange({ gpa: v })}
            inputMode="decimal"
            suffix="/ 10"
            mono
            error={errors.gpa}
            hint="Convert from 4.0 scale by multiplying by 2.5."
          />
        </div>
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="font-display text-[18px] font-medium tracking-[-0.02em]">Target Program & Intake</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            id="program"
            label="Program"
            value={form.targetProgram}
            onChange={(v) => onChange({ targetProgram: v })}
            options={['MS Computer Science', 'MS Data Science', 'MS Artificial Intelligence'].map((v) => ({
              value: v,
              label: v,
            }))}
          />

          <SelectField
            id="intake"
            label="Intake"
            value={form.intake}
            onChange={(v) => onChange({ intake: v })}
            options={['Fall 2027', 'Spring 2028', 'Fall 2028'].map((v) => ({ value: v, label: v }))}
          />
        </div>

        {/* Approach A: Target Study Destinations Multi-Select */}
        <div className="rounded-xl border border-line bg-white/70 p-5 space-y-5 shadow-2xs">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h4 className="text-[14px] font-semibold text-ink">Target Study Destinations</h4>
              <p className="mt-0.5 text-[12px] text-ink-3">
                Select your preferred countries or regions. Selecting multiple destinations or broader regions ensures a balanced 3 Target, 3 Consider, 3 Reach portfolio.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChange({ targetCountries: ['all'] })}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-all ${
                isAll
                  ? 'bg-ink text-canvas shadow-xs'
                  : 'bg-canvas text-ink-2 border border-line hover:border-ink/40 hover:text-ink'
              }`}
            >
              <GlobeIcon className="h-3.5 w-3.5" />
              Open to Anywhere (150)
            </button>
          </div>

          {/* Primary Study Destinations */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-3">
              Primary Study Hubs
            </span>
            <div className="flex flex-wrap gap-2.5">
              {PRIMARY_DESTINATIONS.map((dest) => {
                const active = isSelected(dest.id);
                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => toggleDestination(dest.id)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all ${
                      active
                        ? 'border-accent bg-accent/10 text-accent font-semibold ring-1 ring-accent/30 shadow-2xs'
                        : 'border border-line bg-white text-ink hover:border-line-strong hover:bg-canvas/60'
                    }`}
                  >
                    <span>{dest.flag}</span>
                    <span>{dest.label}</span>
                    <span
                      className={`font-mono text-[11px] rounded-full px-1.5 py-0.2 ${
                        active ? 'bg-accent/20 text-accent' : 'bg-canvas text-ink-3'
                      }`}
                    >
                      {dest.count}
                    </span>
                    {active && <CheckIcon className="h-3.5 w-3.5 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Broader Regional Hubs */}
          <div className="space-y-2 pt-2 border-t border-line/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-3">
              Broader Regions (Covers all 1-to-2 university countries)
            </span>
            <div className="flex flex-wrap gap-2.5">
              {REGIONAL_DESTINATIONS.map((dest) => {
                const active = isSelected(dest.id);
                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => toggleDestination(dest.id)}
                    title={dest.note}
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all ${
                      active
                        ? 'border-accent bg-accent/10 text-accent font-semibold ring-1 ring-accent/30 shadow-2xs'
                        : 'border border-line bg-white text-ink hover:border-line-strong hover:bg-canvas/60'
                    }`}
                  >
                    <span>{dest.flag}</span>
                    <span>{dest.label}</span>
                    <span
                      className={`font-mono text-[11px] rounded-full px-1.5 py-0.2 ${
                        active ? 'bg-accent/20 text-accent' : 'bg-canvas text-ink-3'
                      }`}
                    >
                      {dest.count}
                    </span>
                    {active && <CheckIcon className="h-3.5 w-3.5 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Selection Summary Note */}
          <div className="flex items-center gap-2 rounded-md bg-canvas/70 px-3 py-2 text-[12px] text-ink-2">
            <InfoIcon className="h-4 w-4 shrink-0 text-accent" />
            <span>
              {isAll ? (
                <>
                  <strong className="text-ink">Open to Anywhere:</strong> All 150 top universities across North America, Europe, Asia, and Oceania will be evaluated for your admissions portfolio.
                </>
              ) : (
                <>
                  <strong className="text-ink">Selected:</strong>{' '}
                  {selected.join(', ')} ({selected.length} selection{selected.length > 1 ? 's' : ''}). MsAdmit will prioritize programs within these chosen study regions.
                </>
              )}
            </span>
          </div>
        </div>
      </fieldset>
    </div>
  );
}