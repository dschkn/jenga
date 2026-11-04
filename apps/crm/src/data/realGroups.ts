import type { ScheduleItem } from '../types';
export interface RealGroup {
  id: string;
  name: string;
  code: string;
  language: 'German' | 'English';
  level: string;
  courseType: string;
  hours: number;
  price: number;
  teacherId: string | null;
  teacherName: string;
  textbook: string;
  startDate: Date;
  endDate: Date;
  schedule: ScheduleItem[];
  studentIds: string[];
  maxStudents: number;
  status: 'active' | 'completed' | 'planned';
}

const KEY = 'jenga-demo-v02-created-groups';
function loadGroups(): RealGroup[] {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(saved) ? saved.map(g => ({ ...g, startDate: new Date(g.startDate), endDate: new Date(g.endDate) })) : [];
  } catch { return []; }
}
export const realGroups: RealGroup[] = loadGroups();
export function saveCreatedGroups() {
  localStorage.setItem(KEY, JSON.stringify(realGroups));
}
