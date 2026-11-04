import type { NormalizedTeacherScheduleItem } from '../types/normalized';

export type DemoScheduleSeed = Omit<
  NormalizedTeacherScheduleItem,
  'start' | 'end' | 'commentIds' | 'createdAt' | 'updatedAt'
> & {
  date: string;
  startTime: string;
  endTime: string;
};

export const demoScheduleAugust2026: DemoScheduleSeed[] = [];
