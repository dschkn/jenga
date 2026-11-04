import type { User } from '../types';

export interface DemoTeacherOption {
  id: string;
  name: string;
  isOnlineOnly?: boolean;
}

const anonymizedTeacherNames: string[] = [];

export const demoTeacherOptions: DemoTeacherOption[] = anonymizedTeacherNames.map((name, index) => ({
  id: `t${index + 1}`,
  name,
  isOnlineOnly: [1, 4, 7, 10, 13, 16].includes(index),
}));

export const demoTeacherUserMap = Object.fromEntries(
  demoTeacherOptions.map((teacher, index) => [
    teacher.id,
    {
      id: teacher.id,
      name: teacher.name,
      email: `teacher${String(index + 1).padStart(2, '0')}@example.com`,
      phone: '',
      role: 'teacher',
    } satisfies User,
  ]),
) as Record<string, User>;
