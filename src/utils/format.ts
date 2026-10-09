import { differenceInCalendarDays, format, parseISO } from 'date-fns';

export const TODAY = new Date(2026, 8, 25);

export function formatUSD(n: number): string {
  if (n === 0) return '$0';
  if (n < 1000) return `$${n}`;
  const k = n / 1000;
  return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
}

export function formatSigned(n: number, digits = 1): string {
  const abs = Math.abs(n).toFixed(digits);
  if (Number(abs) === 0) return abs;
  return n > 0 ? `+${abs}` : `−${abs}`;
}

export function formatDate(iso: string, pattern = 'MMM d'): string {
  return format(parseISO(iso), pattern);
}

export function daysUntil(iso: string): number {
  return differenceInCalendarDays(parseISO(iso), TODAY);
}

export function formatFileSize(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
}