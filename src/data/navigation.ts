import {
  FileTextIcon,
  LayersIcon,
  LayoutGridIcon,
  ListChecksIcon,
  SparklesIcon,
  TrophyIcon,
  SearchIcon,
  LucideIcon
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  isSpecial?: boolean;
  badge?: string;
}

export const appNavigation: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutGridIcon, end: true },
  { to: '/app/recommendations', label: 'Recommendations', icon: LayersIcon },
  {
    to: '/app/roadmap',
    label: 'What If ??',
    icon: SparklesIcon,
    isSpecial: true,
    badge: 'AI'
  },
  {
    to: '/app/explorer',
    label: 'AI Explorer',
    icon: SearchIcon,
    isSpecial: true,
    badge: 'Chroma'
  },
  { to: '/app/qs-rankings', label: 'QS Top 150', icon: TrophyIcon },
  { to: '/app/tracker', label: 'Tracker', icon: ListChecksIcon },
  { to: '/app/documents', label: 'Documents', icon: FileTextIcon }
];