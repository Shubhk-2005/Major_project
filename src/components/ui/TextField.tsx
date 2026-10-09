import React from 'react';

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  suffix?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  mono?: boolean;
}

export function TextField({ id, label, value, onChange, type = 'text', placeholder, error, hint, suffix, autoComplete, inputMode, mono }: TextFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-ink">
        {label}
      </label>
      <div
        className={`mt-2 flex h-11 items-center rounded border bg-white transition-[border-color,box-shadow] duration-150 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15 ${error ? 'border-reach' : 'border-line'}`}>
        
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`h-full w-full min-w-0 bg-transparent px-3 text-[15px] text-ink placeholder:text-ink-3 focus:outline-none ${mono ? 'font-mono tabular-nums' : ''}`} />
        
        {suffix && <span className="pr-3 font-mono text-[13px] text-ink-3">{suffix}</span>}
      </div>
      {error ?
      <p id={`${id}-error`} className="mt-1.5 text-[13px] text-reach">
          {error}
        </p> :
      hint ?
      <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-ink-3">
          {hint}
        </p> :
      null}
    </div>);

}