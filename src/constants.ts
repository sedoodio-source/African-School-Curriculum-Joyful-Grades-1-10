import { Subject } from './types';

export const SUBJECTS: { name: Subject; label?: string; icon: string; color: string }[] = [
  { name: 'Alphabet', label: 'Learning the Alphabet', icon: 'abc', color: 'secondary' },
  { name: 'Math', icon: 'calculate', color: 'primary' },
  { name: 'English', icon: 'auto_stories', color: 'tertiary' },
  { name: 'Social Studies', icon: 'public', color: 'primary' },
  { name: 'Literature', icon: 'menu_book', color: 'primary' },
  { name: 'Science', icon: 'science', color: 'secondary' },
  { name: 'Bible Study', icon: 'menu_book', color: 'tertiary' },
  { name: 'Spelling', icon: 'spellcheck', color: 'primary' },
  { name: 'Biology', label: 'Advanced Biology', icon: 'biotech', color: 'secondary' },
  { name: 'Etymology', label: 'Advanced Etymology', icon: 'translate', color: 'tertiary' },
];

export const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const CORE_MODULE_SUBJECTS: Subject[] = [
  'Math',
  'English',
  'Social Studies',
  'Literature',
  'Science',
  'Bible Study'
];

export const getLessonsCountForGrade = (grade: number): number => {
  if (grade >= 1 && grade <= 6) return 50; // Organized by Grade Level (1-5) with 50 lessons each
  if (grade >= 7 && grade <= 10) return 60;
  return 50;
};
