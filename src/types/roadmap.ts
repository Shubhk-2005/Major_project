import { FactorKey, Profile } from './profile';

export type Priority = 'high' | 'medium' | 'low';

export interface RoadmapItem {
  id: string;
  title: string;
  detail: string;
  start: number;
  span: number;
  priority: Priority;
  factor: FactorKey | 'strategy';
  lever?: Partial<Profile>;
}