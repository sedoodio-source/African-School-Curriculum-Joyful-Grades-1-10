import { Subject } from '../types';

/**
 * Checks if subject drills are available for the given subject today.
 * Biology and Etymology subject drills are available ONLY on:
 * Monday (1), Wednesday (3), Friday (5), Saturday (6), and Sunday (0).
 * They are NOT available on Tuesday (2) and Thursday (4).
 */
export function isSubjectDrillAvailable(subject?: Subject | string | null): boolean {
  if (!subject) return true;
  if (subject === 'Biology' || subject === 'Etymology') {
    const day = new Date().getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    return day !== 2 && day !== 4; // Locked on Tue (2) and Thu (4)
  }
  return true;
}

export function getSubjectDrillScheduleText(subject?: Subject | string | null): string {
  if (subject === 'Biology' || subject === 'Etymology') {
    return 'Available Mon, Wed, Fri, Sat & Sun (Locked on Tue & Thu)';
  }
  return 'Available daily';
}
