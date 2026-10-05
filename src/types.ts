export type Subject = 'Math' | 'English' | 'Social Studies' | 'Literature' | 'Science' | 'Bible Study' | 'Alphabet' | 'Spelling' | 'Biology' | 'Etymology';

export interface Interaction {
  role: 'teacher' | 'student';
  content: string;
  timestamp: number;
}

export interface Question {
  id: number;
  type: 'multiple-choice' | 'theory';
  question: string;
  options?: string[];
  correctAnswer: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  interactions: Interaction[];
  interactionCount: number;
  completed: boolean;
  score?: number;
  lessonNumber?: number; // 1 to 50
}

export interface Term {
  id: number;
  name: string;
  topics: Topic[];
}

export interface Curriculum {
  grade: number;
  subject: Subject;
  terms: Term[];
}

export interface User {
  id: string;
  name: string;
  role: 'student' | 'parent';
  grade?: number;
  section?: number; // Academic Section (e.g. Section 1, Section 2, Section 3)
  avatar: string;
  isBeginner?: boolean;
  loginMethod?: 'Google' | 'ClassLink' | 'Direct' | 'Email';
}

export type View = 'landing' | 'login' | 'dashboard' | 'subject' | 'lesson' | 'parent' | 'final-exam' | 'drills' | 'payment-plans' | 'waec-jamb';

export interface WorksheetProgress {
  topicId: string;
  answers: Record<number, string>;
  reflection: string;
  isCompleted: boolean;
  score?: number;
}

export interface ChristianSong {
  id: string;
  title: string;
  artist: string;
  category: 'Worship' | 'Praise' | 'Hymns & Reflection' | 'Faith & Courage' | 'African Gospel & Worship';
  description: string;
  bibleVerse: string;
  audioOrVideoUrl: string; // YouTube embed URL
  duration: string;
  lyricsExcerpt: string;
  learningObjectives: string[];
  reflectionPrompt: string;
}

export interface ChristianSongLog {
  songId: string;
  listenedAt: number;
  studentNotes?: string;
  completed: boolean;
}

export interface ChristianVideo {
  id: string;
  title: string;
  description: string;
  bibleVerse: string;
  category: 'Moral Stories' | 'Bible Heroes' | 'Christian Values' | 'Worship & Praise' | 'Faith & Science' | 'Parables';
  videoUrl: string; // YouTube embed or direct URL
  thumbnailUrl?: string;
  duration: string;
  createdAt: number;
  published: boolean;
  designer: string; // e.g., "Parent/Admin" or "School Publisher"
  reflectionPrompt?: string;
}

export interface ChristianVideoWatchLog {
  videoId: string;
  watchedAt: number;
  studentReflection?: string;
  completed: boolean;
}

export interface ProjectSession {
  id: string;
  title: string;
  subject: Subject;
  section: number; // 1, 2, or 3
  gradeRange: number[];
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  requiresSupervision: boolean;
  materials: string[];
  steps: string[];
  aiPrompt: string;
  learningObjectives: string[];
}

export interface ProjectSubmission {
  projectId: string;
  projectTitle: string;
  subject: Subject;
  grade: number;
  completedAt: number;
  reflection: string;
  parentVerified: boolean;
  parentName?: string;
  score: number;
}
