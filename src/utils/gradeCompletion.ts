import { User } from '../types';
import { SUBJECTS, getLessonsCountForGrade } from '../constants';

export interface GradeCompletionStatus {
  isAllGradesFinished: boolean;
  currentGrade: number;
  completedGrades: number[];
  totalGrades: number;
  grade10Progress: number;
  hasGrade10Exam: boolean;
  totalUniqueLessonsCompleted: number;
  requiredGrade10Lessons: number;
}

/**
 * Validates whether the scholar has completed all 10 grades (Grades 1 through 10).
 * WAEC (WASSCE) and JAMB (UTME) will NOT open until all grades are finished.
 */
export function checkAllGradesFinished(user: User | null, history: any[] = []): GradeCompletionStatus {
  const currentGrade = user?.grade || 1;
  const totalGrades = 10;

  if (!user) {
    return {
      isAllGradesFinished: false,
      currentGrade: 1,
      completedGrades: [],
      totalGrades,
      grade10Progress: 0,
      hasGrade10Exam: false,
      totalUniqueLessonsCompleted: 0,
      requiredGrade10Lessons: 0,
    };
  }

  // 1. Check explicit completion flag in localStorage
  let hasExplicitUnlock = false;
  if (typeof window !== 'undefined') {
    hasExplicitUnlock = 
      localStorage.getItem(`all_grades_finished_${user.id}`) === 'true' ||
      localStorage.getItem('asc_all_grades_finished') === 'true' ||
      localStorage.getItem(`waec_jamb_unlocked_${user.id}`) === 'true';
  }

  // 2. Check history for Grade 10 final exam completion
  const hasGrade10Exam = history.some(h => 
    h.topicId === 'FINAL-EXAM-G10' || 
    h.topicId === 'FINAL-EXAM-Grade-10' ||
    h.topicId === 'FINAL-EXAM-10'
  );

  // 3. Compute Grade 10 curriculum progress
  const lessonsPerSubjectG10 = getLessonsCountForGrade(10);
  const availableSubjectsG10 = SUBJECTS.filter(s => s.name !== 'Alphabet');
  const requiredGrade10Lessons = availableSubjectsG10.length * lessonsPerSubjectG10;
  const filteredHistory = history.filter(h => !h.topicId.startsWith('DRILLS-') && !h.topicId.includes('DRILLS'));
  const totalUniqueLessonsCompleted = new Set(filteredHistory.map(h => h.topicId)).size;
  
  const grade10Progress = user.grade === 10 && requiredGrade10Lessons > 0
    ? Math.min(100, Math.round((totalUniqueLessonsCompleted / requiredGrade10Lessons) * 100))
    : 0;

  // Grade 10 is finished if explicit unlock, or Grade 10 exam completed, or user in Grade 10 with 100% progress
  const isAllGradesFinished = hasExplicitUnlock || hasGrade10Exam || (user.grade === 10 && grade10Progress >= 100);

  // Compute completed grades list for visual timeline
  const completedGrades: number[] = [];
  for (let g = 1; g <= totalGrades; g++) {
    const hasExam = history.some(h => 
      h.topicId === `FINAL-EXAM-G${g}` || 
      h.topicId === `FINAL-EXAM-Grade-${g}` ||
      h.topicId === `FINAL-EXAM-${g}`
    );
    if (isAllGradesFinished) {
      completedGrades.push(g);
    } else if (hasExam || g < currentGrade) {
      completedGrades.push(g);
    }
  }

  return {
    isAllGradesFinished,
    currentGrade,
    completedGrades,
    totalGrades,
    grade10Progress,
    hasGrade10Exam,
    totalUniqueLessonsCompleted,
    requiredGrade10Lessons,
  };
}

/**
 * Unlocks all grades for testing or administrative validation.
 */
export function unlockAllGrades(userId?: string) {
  if (typeof window !== 'undefined') {
    if (userId) {
      localStorage.setItem(`all_grades_finished_${userId}`, 'true');
      localStorage.setItem(`waec_jamb_unlocked_${userId}`, 'true');
    }
    localStorage.setItem('asc_all_grades_finished', 'true');
    window.dispatchEvent(new Event('grades_completed_updated'));
  }
}

/**
 * Resets all grades unlock state.
 */
export function lockAllGrades(userId?: string) {
  if (typeof window !== 'undefined') {
    if (userId) {
      localStorage.removeItem(`all_grades_finished_${userId}`);
      localStorage.removeItem(`waec_jamb_unlocked_${userId}`);
    }
    localStorage.removeItem('asc_all_grades_finished');
    window.dispatchEvent(new Event('grades_completed_updated'));
  }
}
