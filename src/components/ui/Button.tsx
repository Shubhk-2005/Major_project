import React from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  to?: string;
}

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'bg-white text-ink border border-line hover:border-line-strong hover:bg-[#FCFCFB]',
  ghost: 'text-ink-2 hover:text-ink hover:bg-black/[0.04]'
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-[14px]',
  lg: 'h-12 px-6 text-[15px]'
};

export function Button({ variant = 'primary', size = 'md', to, className = '', children, ...rest }: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-medium transition-[background-color,color,border-color,transform] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`;
  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>);

  }
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>);

}