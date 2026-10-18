import React from 'react';
import { SparklesIcon, CheckCircle2Icon } from 'lucide-react';
import { TextField } from '../ui/TextField';
import { ProfileForm } from '../../types/profile';
import { FormErrors } from '../../utils/profileForm';
import { ieltsToToefl, toeflToIelts } from '../../utils/englishConcordance';

interface StepProps {
  form: ProfileForm;
  errors: FormErrors;
  onChange: (patch: Partial<ProfileForm>) => void;
}

export function StepTests({ form, errors, onChange }: StepProps) {
  const isIelts = form.englishTestType === 'ielts';
  const ieltsVal = Number(form.ieltsScore) || 0;
  const toeflVal = Number(form.toefl) || 0;

  const handleTestTypeChange = (type: 'toefl' | 'ielts') => {
    if (type === 'ielts') {
      const derivedIelts = toeflVal > 0 ? String(toeflToIelts(toeflVal)) : form.ieltsScore;
      onChange({ englishTestType: 'ielts', ieltsScore: derivedIelts });
    } else {
      const derivedToefl = ieltsVal > 0 ? String(ieltsToToefl(ieltsVal)) : form.toefl;
      onChange({ englishTestType: 'toefl', toefl: derivedToefl });
    }
  };

  const equivToefl = isIelts && ieltsVal > 0 ? ieltsToToefl(ieltsVal) : 0;
  const equivIelts = !isIelts && toeflVal > 0 ? toeflToIelts(toeflVal) : 0;

  return (
    <div className="space-y-10">
      <fieldset className="space-y-5">
        <legend className="font-display text-[18px] font-medium tracking-[-0.02em]">GRE General</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="gre"
            label="Total score"
            value={form.gre}
            placeholder="e.g. 320"
            onChange={(v) => onChange({ gre: v })}
            inputMode="numeric"
            suffix="/ 340"
            mono
            error={errors.gre}
            hint="Your best single sitting."
          />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <legend className="font-display text-[18px] font-medium tracking-[-0.02em]">
            English proficiency
          </legend>

          {/* Test Type Switcher */}
          <div className="inline-flex rounded-lg border border-line bg-canvas p-1 text-[13px] font-medium">
            <button
              type="button"
              onClick={() => handleTestTypeChange('toefl')}
              className={`rounded-md px-3.5 py-1.5 transition-all ${
                !isIelts
                  ? 'bg-white text-ink shadow-2xs font-semibold'
                  : 'text-ink-2 hover:text-ink'
              }`}
            >
              TOEFL iBT
            </button>
            <button
              type="button"
              onClick={() => handleTestTypeChange('ielts')}
              className={`rounded-md px-3.5 py-1.5 transition-all ${
                isIelts
                  ? 'bg-white text-accent shadow-2xs font-semibold'
                  : 'text-ink-2 hover:text-ink'
              }`}
            >
              IELTS Academic
            </button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {isIelts ? (
            <div>
              <TextField
                id="ieltsScore"
                label="IELTS Overall Band"
                value={form.ieltsScore}
                placeholder="e.g. 7.5"
                onChange={(v) => {
                  const numVal = Number(v);
                  const converted = numVal > 0 ? String(ieltsToToefl(numVal)) : '';
                  onChange({ ieltsScore: v, toefl: converted });
                }}
                inputMode="decimal"
                suffix="/ 9.0"
                mono
                error={errors.ieltsScore}
                hint="Band score in 0.5 increments (e.g. 6.5, 7.0, 7.5, 8.0)."
              />

              {/* Quick IELTS band selector chips */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-ink-3">Quick pick:</span>
                {[6.5, 7.0, 7.5, 8.0, 8.5].map((band) => (
                  <button
                    key={band}
                    type="button"
                    onClick={() => {
                      onChange({
                        ieltsScore: String(band),
                        toefl: String(ieltsToToefl(band))
                      });
                    }}
                    className={`rounded px-2 py-0.5 font-mono text-[11px] transition-colors ${
                      form.ieltsScore === String(band)
                        ? 'bg-accent text-white font-medium'
                        : 'bg-black/[0.04] text-ink-2 hover:bg-black/[0.08]'
                    }`}
                  >
                    {band.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <TextField
                id="toefl"
                label="TOEFL iBT Total"
                value={form.toefl}
                placeholder="e.g. 105"
                onChange={(v) => onChange({ toefl: v })}
                inputMode="numeric"
                suffix="/ 120"
                mono
                error={errors.toefl}
                hint="Official score report total (0 – 120)."
              />
              {toeflVal > 0 && equivIelts > 0 && (
                <p className="mt-2 text-[12px] text-ink-3">
                  Equivalent IELTS Band: <span className="font-semibold text-ink">{equivIelts.toFixed(1)}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Live ETS Concordance Banner for IELTS */}
        {isIelts && ieltsVal > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-accent/25 bg-accent/[0.04] p-4 text-[13px] text-ink">
            <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <div>
              <p className="font-medium text-ink">
                Official ETS Concordance: IELTS Band {ieltsVal.toFixed(1)} ≈{' '}
                <span className="font-bold text-accent">{equivToefl} TOEFL iBT</span>
              </p>
              <p className="mt-0.5 text-[12px] text-ink-2 leading-relaxed">
                Your IELTS score is automatically converted to its TOEFL equivalent ({equivToefl}/120) and passed into the ML prediction models and university cutoffs.
              </p>
            </div>
          </div>
        )}
      </fieldset>

      <p className="max-w-[520px] text-[14px] leading-relaxed text-ink-3">
        Scores are compared against the admitted medians of each program. You can update them later from the Roadmap simulator without changing your saved profile.
      </p>
    </div>
  );
}