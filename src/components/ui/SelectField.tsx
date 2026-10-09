import React from 'react';
import { ChevronDownIcon } from 'lucide-react';

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: {value: string;label: string;}[];
  onChange: (v: string) => void;
  hideLabel?: boolean;
  compact?: boolean;
  className?: string;
}

export function SelectField({ id, label, value, options, onChange, hideLabel, compact, className = '' }: SelectFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'block text-[13px] font-medium text-ink'}>
        {label}
      </label>
      <div className={`relative ${hideLabel ? '' : 'mt-2'}`}>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded border border-line bg-white pl-3 pr-9 text-ink transition-[border-color,box-shadow] duration-150 hover:border-line-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 ${compact ? 'h-10 text-[14px]' : 'h-11 text-[15px]'}`}>
          
          {options.map((o) =>
          <option key={o.value} value={o.value}>
              {o.label}
            </option>
          )}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
      </div>
    </div>);

}