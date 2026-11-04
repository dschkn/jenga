export interface DemoAdministrator {
  id: string;
  name: string;
  shortName: string;
  role: string;
  initials: string;
  accent: string;
  columnTone: string;
}

export interface DemoShift {
  adminId: string;
  date: string;
  segments: string[];
}

export type DemoTaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type DemoTaskStatus = 'new' | 'in_progress' | 'waiting' | 'completed';

export interface DemoSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface DemoTaskComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface DemoBoardTask {
  id: string;
  title: string;
  description: string;
  assigneeId: string | null;
  dueDate: string;
  priority: DemoTaskPriority;
  status: DemoTaskStatus;
  tags: string[];
  subtasks: DemoSubtask[];
  comments: DemoTaskComment[];
  createdAt: string;
  completedAt?: string;
  relatedStudentIds?: string[];
}

export const demoAdministrators: DemoAdministrator[] = [];
export const demoAdminShifts: DemoShift[] = [];

const ADMIN_SCHEDULE_OVERRIDES_KEY = 'jenga-demo-v02-admin-schedule-overrides-v1';

function hoursToSegments(hours: number[]): string[] {
  if (!hours.length) return [];
  const sorted = [...hours].sort((a, b) => a - b);
  const segments: string[] = [];
  let start = sorted[0];
  let previous = sorted[0];
  sorted.slice(1).forEach((hour) => {
    if (hour !== previous + 1) {
      segments.push(`${String(start).padStart(2, '0')}:00-${String(previous + 1).padStart(2, '0')}:00`);
      start = hour;
    }
    previous = hour;
  });
  segments.push(`${String(start).padStart(2, '0')}:00-${String(previous + 1).padStart(2, '0')}:00`);
  return segments;
}

export const demoAdminTasks: DemoBoardTask[] = [];

export function getShift(adminId: string, date: string): DemoShift | undefined {
  try {
    const overrides = JSON.parse(localStorage.getItem(ADMIN_SCHEDULE_OVERRIDES_KEY) || '{}');
    const hours = overrides[date]?.[adminId];
    if (Array.isArray(hours)) {
      const segments = hoursToSegments(hours);
      return segments.length ? { adminId, date, segments } : undefined;
    }
  } catch {
    // Fall back to the initial schedule if locally edited data is unavailable.
  }
  return demoAdminShifts.find((shift) => shift.adminId === adminId && shift.date === date);
}

export function getNextShift(adminId: string, afterDate: string): DemoShift | undefined {
  return demoAdminShifts
    .filter((shift) => shift.adminId === adminId && shift.date > afterDate)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

export function getShiftHours(shift?: DemoShift): number {
  if (!shift) return 0;
  return shift.segments.reduce((total, segment) => {
    const [start, end] = segment.split('-');
    return total + Number(end.slice(0, 2)) - Number(start.slice(0, 2));
  }, 0);
}
