import {
  CompassIcon,
  FileTextIcon,
  LayersIcon,
  LayoutGridIcon,
  ListChecksIcon,
  RouteIcon,
  TrophyIcon,
  LucideIcon } from
'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const appNavigation: NavItem[] = [
{ to: '/app', label: 'Dashboard', icon: LayoutGridIcon, end: true },
{ to: '/app/explorer', label: 'Explorer', icon: CompassIcon },
{ to: '/app/qs-rankings', label: 'QS Top 150', icon: TrophyIcon },
{ to: '/app/recommendations', label: 'Recommendations', icon: LayersIcon },
{ to: '/app/tracker', label: 'Tracker', icon: ListChecksIcon },
{ to: '/app/documents', label: 'Documents', icon: FileTextIcon },
{ to: '/app/roadmap', label: 'Roadmap', icon: RouteIcon }];