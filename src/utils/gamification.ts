import { Subject, User, WorksheetProgress } from '../types';

export type BadgeTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
export type BadgeCategory = 'subject' | 'high-score' | 'activity' | 'milestone';

export interface VirtualBadge {
  id: string;
  title: string;
  description: string;
  category: BadgeCategory;
  subject?: Subject;
  icon: string;
  tier: BadgeTier;
  pointsReward: number;
  requirement: string;
  isUnlocked: boolean;
  unlockedAt?: number;
  currentCount: number;
  targetCount: number;
  progressPercent: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  topicId: string;
  subject: Subject;
  grade: number;
  activityType: 'matching' | 'video' | 'quiz' | 'creative';
  score: number;
  pointsEarned: number;
  timestamp: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  grade: number;
  location: string;
  countryFlag: string;
  points: number;
  badgesCount: number;
  streakDays: number;
  favoriteSubject: Subject;
  isCurrentUser?: boolean;
  rank?: number;
}

export interface ScholarLevel {
  level: number;
  title: string;
  icon: string;
  currentXP: number;
  nextLevelXP: number;
  progressPercent: number;
}

// Storage helpers
export function getActivityLogs(userId: string): ActivityLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`asc_activity_logs_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveActivityLog(log: ActivityLog): void {
  if (typeof window === 'undefined') return;
  try {
    const logs = getActivityLogs(log.userId);
    // Replace if same topic and activityType already done, or append
    const existingIdx = logs.findIndex(l => l.topicId === log.topicId && l.activityType === log.activityType);
    if (existingIdx >= 0) {
      if (log.score >= logs[existingIdx].score) {
        logs[existingIdx] = log;
      }
    } else {
      logs.push(log);
    }
    localStorage.setItem(`asc_activity_logs_${log.userId}`, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving activity log', e);
  }
}

// Points Calculation
export function calculateUserPoints(
  user: User | null,
  history: { topicId: string; score: number; date: number }[],
  worksheetHistory: WorksheetProgress[] = [],
  activityLogs: ActivityLog[] = []
): {
  totalPoints: number;
  lessonsPoints: number;
  worksheetsPoints: number;
  activitiesPoints: number;
  drillsPoints: number;
  bonusPoints: number;
} {
  if (!user) {
    return {
      totalPoints: 0,
      lessonsPoints: 0,
      worksheetsPoints: 0,
      activitiesPoints: 0,
      drillsPoints: 0,
      bonusPoints: 0
    };
  }

  // 1. Lessons points (Standard lesson topics)
  const regularLessons = history.filter(h => !h.topicId.startsWith('DRILLS-'));
  let lessonsPoints = 0;
  regularLessons.forEach(h => {
    if (h.score >= 60) {
      lessonsPoints += 100; // Base completion XP
      if (h.score === 100) lessonsPoints += 50; // Perfect score bonus
      else if (h.score >= 90) lessonsPoints += 30; // High honors bonus
      else if (h.score >= 80) lessonsPoints += 15; // Merit bonus
    }
  });

  // 2. Worksheets points (75 points per completed worksheet)
  const completedWorksheets = worksheetHistory.filter(w => w.isCompleted);
  const worksheetsPoints = completedWorksheets.length * 75;

  // 3. Activities points (Matching, Videos, Rapid quizzes)
  let activitiesPoints = 0;
  activityLogs.forEach(log => {
    activitiesPoints += log.pointsEarned || 50;
  });

  // 4. Rapid Drills points
  const drillItems = history.filter(h => h.topicId.startsWith('DRILLS-'));
  let drillsPoints = 0;
  drillItems.forEach(d => {
    drillsPoints += Math.max(30, Math.round(d.score * 1.2));
  });

  // 5. Daily Streak & Beginner Bonus
  const bonusPoints = user.isBeginner ? 100 : 250;

  const totalPoints = lessonsPoints + worksheetsPoints + activitiesPoints + drillsPoints + bonusPoints;

  return {
    totalPoints,
    lessonsPoints,
    worksheetsPoints,
    activitiesPoints,
    drillsPoints,
    bonusPoints
  };
}

// Scholar Levels
const LEVEL_THRESHOLDS = [
  { level: 1, minXP: 0, maxXP: 300, title: 'Novice Explorer', icon: 'hiking' },
  { level: 2, minXP: 300, maxXP: 750, title: 'Curious Scholar', icon: 'psychology' },
  { level: 3, minXP: 750, maxXP: 1400, title: 'Diligent Student', icon: 'auto_stories' },
  { level: 4, minXP: 1400, maxXP: 2300, title: 'Honors Achiever', icon: 'military_tech' },
  { level: 5, minXP: 2300, maxXP: 3500, title: 'Academic Champion', icon: 'workspace_premium' },
  { level: 6, minXP: 3500, maxXP: 5000, title: 'Grandmaster of Knowledge', icon: 'stars' },
  { level: 7, minXP: 5000, maxXP: 7500, title: 'Pan-African Laureate', icon: 'crown' },
  { level: 8, minXP: 7500, maxXP: 999999, title: 'Legend of Excellence', icon: 'diamond' },
];

export function getScholarLevel(totalXP: number): ScholarLevel {
  const current = LEVEL_THRESHOLDS.find(t => totalXP >= t.minXP && totalXP < t.maxXP) || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const range = current.maxXP - current.minXP;
  const progressInLevel = Math.max(0, totalXP - current.minXP);
  const progressPercent = Math.min(100, Math.round((progressInLevel / range) * 100));

  return {
    level: current.level,
    title: current.title,
    icon: current.icon,
    currentXP: totalXP,
    nextLevelXP: current.maxXP,
    progressPercent
  };
}

// All Virtual Badges Catalog & Evaluation
export function getUserBadges(
  user: User | null,
  history: { topicId: string; score: number; date: number }[],
  worksheetHistory: WorksheetProgress[] = [],
  activityLogs: ActivityLog[] = []
): VirtualBadge[] {
  const regularHistory = history.filter(h => !h.topicId.startsWith('DRILLS-'));
  const perfectScores = regularHistory.filter(h => h.score === 100).length;
  const highScores = regularHistory.filter(h => h.score >= 85).length;
  const totalCompletedLessons = regularHistory.filter(h => h.score >= 60).length;

  const countBySubject = (subject: Subject): number => {
    return regularHistory.filter(h => h.topicId.startsWith(`${subject}-`) && h.score >= 60).length;
  };

  const mathCompleted = countBySubject('Math');
  const englishCompleted = countBySubject('English');
  const scienceCompleted = countBySubject('Science');
  const socialCompleted = countBySubject('Social Studies');
  const literatureCompleted = countBySubject('Literature');
  const bibleCompleted = countBySubject('Bible Study');
  const alphabetCompleted = countBySubject('Alphabet');

  const matchingActivities = activityLogs.filter(a => a.activityType === 'matching').length;
  const videoActivities = activityLogs.filter(a => a.activityType === 'video').length;
  const quizActivities = activityLogs.filter(a => a.activityType === 'quiz').length;
  const drillsCompleted = history.filter(h => h.topicId.startsWith('DRILLS-')).length;
  const worksheetsCompleted = worksheetHistory.filter(w => w.isCompleted).length;

  const badgesList: VirtualBadge[] = [
    // --- 1. SUBJECT MASTERY BADGES ---
    {
      id: 'math-master',
      title: 'Euclid’s Crown: Math Master',
      description: 'Master core mathematical logic, arithmetic, and problem solving.',
      category: 'subject',
      subject: 'Math',
      icon: 'calculate',
      tier: 'Gold',
      pointsReward: 200,
      requirement: 'Complete 5 Math Lessons with score >= 60%',
      isUnlocked: mathCompleted >= 5,
      currentCount: mathCompleted,
      targetCount: 5,
      progressPercent: Math.min(100, Math.round((mathCompleted / 5) * 100)),
      unlockedAt: mathCompleted >= 5 ? Date.now() - 86400000 : undefined
    },
    {
      id: 'math-grandmaster',
      title: 'Pythagorean Genius',
      description: 'Demonstrate deep mathematical excellence across advanced topics.',
      category: 'subject',
      subject: 'Math',
      icon: 'functions',
      tier: 'Diamond',
      pointsReward: 400,
      requirement: 'Complete 15 Math Lessons with high honors',
      isUnlocked: mathCompleted >= 15,
      currentCount: mathCompleted,
      targetCount: 15,
      progressPercent: Math.min(100, Math.round((mathCompleted / 15) * 100))
    },
    {
      id: 'english-wordsmith',
      title: 'Golden Quill: Wordsmith',
      description: 'Expand your vocabulary, grammar mastery, and reading eloquence.',
      category: 'subject',
      subject: 'English',
      icon: 'auto_stories',
      tier: 'Gold',
      pointsReward: 200,
      requirement: 'Complete 5 English Lessons with score >= 60%',
      isUnlocked: englishCompleted >= 5,
      currentCount: englishCompleted,
      targetCount: 5,
      progressPercent: Math.min(100, Math.round((englishCompleted / 5) * 100)),
      unlockedAt: englishCompleted >= 5 ? Date.now() - 172800000 : undefined
    },
    {
      id: 'science-explorer',
      title: 'Curie & Newton Pioneer',
      description: 'Unravel the wonders of God’s physical world, biology, and the stars.',
      category: 'subject',
      subject: 'Science',
      icon: 'science',
      tier: 'Gold',
      pointsReward: 200,
      requirement: 'Complete 5 Science Lessons with score >= 60%',
      isUnlocked: scienceCompleted >= 5,
      currentCount: scienceCompleted,
      targetCount: 5,
      progressPercent: Math.min(100, Math.round((scienceCompleted / 5) * 100))
    },
    {
      id: 'social-historian',
      title: 'Heritage Shield: African Historian',
      description: 'Discover the great ancient empires, Nigerian history, and African leaders.',
      category: 'subject',
      subject: 'Social Studies',
      icon: 'public',
      tier: 'Gold',
      pointsReward: 200,
      requirement: 'Complete 5 Social Studies Lessons with score >= 60%',
      isUnlocked: socialCompleted >= 5,
      currentCount: socialCompleted,
      targetCount: 5,
      progressPercent: Math.min(100, Math.round((socialCompleted / 5) * 100))
    },
    {
      id: 'literature-bard',
      title: 'Laureate of African Literature',
      description: 'Appreciate moral short stories, inspiring essays, and African poetry.',
      category: 'subject',
      subject: 'Literature',
      icon: 'menu_book',
      tier: 'Gold',
      pointsReward: 200,
      requirement: 'Complete 5 Literature Lessons with score >= 60%',
      isUnlocked: literatureCompleted >= 5,
      currentCount: literatureCompleted,
      targetCount: 5,
      progressPercent: Math.min(100, Math.round((literatureCompleted / 5) * 100))
    },
    {
      id: 'bible-scholar',
      title: 'Beacon of Faith & Wisdom',
      description: 'Live out godly character, biblical virtues, and Christ-like integrity.',
      category: 'subject',
      subject: 'Bible Study',
      icon: 'volunteer_activism',
      tier: 'Diamond',
      pointsReward: 250,
      requirement: 'Complete 5 Bible Study Lessons with score >= 60%',
      isUnlocked: bibleCompleted >= 5,
      currentCount: bibleCompleted,
      targetCount: 5,
      progressPercent: Math.min(100, Math.round((bibleCompleted / 5) * 100))
    },
    {
      id: 'alphabet-ace',
      title: 'Alphabet & Phonics Ace',
      description: 'Master foundational letters, vowel sounds, and early literacy blends.',
      category: 'subject',
      subject: 'Alphabet',
      icon: 'abc',
      tier: 'Silver',
      pointsReward: 150,
      requirement: 'Complete 3 Alphabet Lessons (Grade 1)',
      isUnlocked: alphabetCompleted >= 3 || (user?.grade && user.grade > 1),
      currentCount: alphabetCompleted >= 3 ? 3 : alphabetCompleted,
      targetCount: 3,
      progressPercent: (alphabetCompleted >= 3 || (user?.grade && user.grade > 1)) ? 100 : Math.round((alphabetCompleted / 3) * 100)
    },

    // --- 2. HIGH SCORE & EXCELLENCE BADGES ---
    {
      id: 'centurion-100',
      title: 'The Centurion (Perfect 100%)',
      description: 'Score an absolute flawless 100% on any lesson quiz or CBT exam.',
      category: 'high-score',
      icon: 'workspace_premium',
      tier: 'Gold',
      pointsReward: 250,
      requirement: 'Achieve 100% on at least 1 quiz',
      isUnlocked: perfectScores >= 1,
      currentCount: perfectScores,
      targetCount: 1,
      progressPercent: perfectScores >= 1 ? 100 : 0,
      unlockedAt: perfectScores >= 1 ? Date.now() - 3600000 : undefined
    },
    {
      id: 'triple-crown-100',
      title: 'Triple Crown of Perfection',
      description: 'Earn 100% perfect scores on 3 different curriculum quizzes.',
      category: 'high-score',
      icon: 'military_tech',
      tier: 'Diamond',
      pointsReward: 500,
      requirement: 'Achieve 100% on 3 different quizzes',
      isUnlocked: perfectScores >= 3,
      currentCount: perfectScores,
      targetCount: 3,
      progressPercent: Math.min(100, Math.round((perfectScores / 3) * 100))
    },
    {
      id: 'high-honors-streak',
      title: 'Dean’s Honor Roll (85%+ Streak)',
      description: 'Maintain consistent excellence with 5 lessons scored 85% or higher.',
      category: 'high-score',
      icon: 'stars',
      tier: 'Silver',
      pointsReward: 200,
      requirement: 'Score 85%+ on 5 lessons',
      isUnlocked: highScores >= 5,
      currentCount: highScores,
      targetCount: 5,
      progressPercent: Math.min(100, Math.round((highScores / 5) * 100))
    },
    {
      id: 'speed-drill-master',
      title: 'Rapid Mastery Lightning Bolt',
      description: 'Test your reflexes and rapid recall in timed Subject Drills.',
      category: 'high-score',
      icon: 'bolt',
      tier: 'Silver',
      pointsReward: 150,
      requirement: 'Complete 3 Rapid Mastery Drill sessions',
      isUnlocked: drillsCompleted >= 3,
      currentCount: drillsCompleted,
      targetCount: 3,
      progressPercent: Math.min(100, Math.round((drillsCompleted / 3) * 100))
    },

    // --- 3. INTERACTIVE LAB & ACTIVITY BADGES ---
    {
      id: 'puzzle-prodigy',
      title: 'Puzzle & Concept Prodigy',
      description: 'Complete interactive drag-and-drop matching challenges across lessons.',
      category: 'activity',
      icon: 'extension',
      tier: 'Silver',
      pointsReward: 150,
      requirement: 'Complete 5 Drag & Drop Matching activities',
      isUnlocked: matchingActivities >= 5,
      currentCount: matchingActivities,
      targetCount: 5,
      progressPercent: Math.min(100, Math.round((matchingActivities / 5) * 100))
    },
    {
      id: 'video-scholar',
      title: 'Curious Visual Learner',
      description: 'Engage with embedded educational video documentaries and summaries.',
      category: 'activity',
      icon: 'smart_display',
      tier: 'Bronze',
      pointsReward: 120,
      requirement: 'Watch 3 Educational Video activities with takeaways',
      isUnlocked: videoActivities >= 3,
      currentCount: videoActivities,
      targetCount: 3,
      progressPercent: Math.min(100, Math.round((videoActivities / 3) * 100))
    },
    {
      id: 'rapid-quiz-ace',
      title: 'Lightning Quiz Ace',
      description: 'Conquer rapid-fire knowledge checks in the Interactive Lab.',
      category: 'activity',
      icon: 'flash_on',
      tier: 'Silver',
      pointsReward: 150,
      requirement: 'Complete 5 Rapid Short Quizzes with full marks',
      isUnlocked: quizActivities >= 5,
      currentCount: quizActivities,
      targetCount: 5,
      progressPercent: Math.min(100, Math.round((quizActivities / 5) * 100))
    },
    {
      id: 'worksheet-scribe',
      title: 'Master Calligrapher & Scribe',
      description: 'Fill out comprehensive digital worksheets with thoughtful written answers.',
      category: 'activity',
      icon: 'edit_note',
      tier: 'Bronze',
      pointsReward: 120,
      requirement: 'Complete 5 Digital Worksheets',
      isUnlocked: worksheetsCompleted >= 5,
      currentCount: worksheetsCompleted,
      targetCount: 5,
      progressPercent: Math.min(100, Math.round((worksheetsCompleted / 5) * 100))
    },

    // --- 4. ACADEMIC MILESTONE BADGES ---
    {
      id: 'first-step',
      title: 'The Journey Begins (First Step)',
      description: 'Awarded for completing your very first lesson with Miss Kelechi.',
      category: 'milestone',
      icon: 'flag',
      tier: 'Bronze',
      pointsReward: 100,
      requirement: 'Complete 1 curriculum lesson',
      isUnlocked: totalCompletedLessons >= 1,
      currentCount: Math.min(1, totalCompletedLessons),
      targetCount: 1,
      progressPercent: totalCompletedLessons >= 1 ? 100 : 0,
      unlockedAt: totalCompletedLessons >= 1 ? Date.now() - 432000000 : undefined
    },
    {
      id: 'rising-scholar',
      title: 'Rising Star of the Classroom',
      description: 'Show consistent dedication by finishing 10 curriculum lessons.',
      category: 'milestone',
      icon: 'school',
      tier: 'Silver',
      pointsReward: 250,
      requirement: 'Complete 10 curriculum lessons',
      isUnlocked: totalCompletedLessons >= 10,
      currentCount: totalCompletedLessons,
      targetCount: 10,
      progressPercent: Math.min(100, Math.round((totalCompletedLessons / 10) * 100))
    },
    {
      id: 'curriculum-champion',
      title: 'Academic Torchbearer',
      description: 'Complete 25 lessons across subjects and inspire your peers.',
      category: 'milestone',
      icon: 'emoji_events',
      tier: 'Gold',
      pointsReward: 500,
      requirement: 'Complete 25 curriculum lessons',
      isUnlocked: totalCompletedLessons >= 25,
      currentCount: totalCompletedLessons,
      targetCount: 25,
      progressPercent: Math.min(100, Math.round((totalCompletedLessons / 25) * 100))
    },
    {
      id: 'super-badge',
      title: 'Super Badge of Pan-African Academic Excellence',
      description: 'The highest honor in Anne and Sam Curriculum. Awarded upon finishing all requirements.',
      category: 'milestone',
      icon: 'verified',
      tier: 'Diamond',
      pointsReward: 1000,
      requirement: 'Complete entire grade curriculum & Final Exam',
      isUnlocked: totalCompletedLessons >= 50 && (user?.grade === 10 || totalCompletedLessons >= 50),
      currentCount: totalCompletedLessons,
      targetCount: 50,
      progressPercent: Math.min(100, Math.round((totalCompletedLessons / 50) * 100))
    }
  ];

  return badgesList;
}

// Friendly Pan-African Peer Scholars Data for Leaderboard
const PEER_SCHOLARS: Omit<LeaderboardEntry, 'rank' | 'isCurrentUser'>[] = [
  {
    id: 'scholar-chidinma',
    name: 'Chidinma Adeyemi',
    avatar: 'scholar',
    grade: 5,
    location: 'Lagos, Nigeria',
    countryFlag: '🇳🇬',
    points: 3820,
    badgesCount: 14,
    streakDays: 12,
    favoriteSubject: 'Math'
  },
  {
    id: 'scholar-kwame',
    name: 'Kwame Mensah',
    avatar: 'student',
    grade: 5,
    location: 'Accra, Ghana',
    countryFlag: '🇬🇭',
    points: 3450,
    badgesCount: 12,
    streakDays: 9,
    favoriteSubject: 'Science'
  },
  {
    id: 'scholar-amini',
    name: 'Amina Kimani',
    avatar: 'girl',
    grade: 4,
    location: 'Nairobi, Kenya',
    countryFlag: '🇰🇪',
    points: 3120,
    badgesCount: 11,
    streakDays: 14,
    favoriteSubject: 'English'
  },
  {
    id: 'scholar-tariq',
    name: 'Tariq Al-Mansoor',
    avatar: 'boy',
    grade: 5,
    location: 'Cairo, Egypt',
    countryFlag: '🇪🇬',
    points: 2980,
    badgesCount: 10,
    streakDays: 7,
    favoriteSubject: 'Social Studies'
  },
  {
    id: 'scholar-thabo',
    name: 'Thabo Mokoena',
    avatar: 'student',
    grade: 3,
    location: 'Johannesburg, South Africa',
    countryFlag: '🇿🇦',
    points: 2650,
    badgesCount: 9,
    streakDays: 8,
    favoriteSubject: 'Literature'
  },
  {
    id: 'scholar-uwase',
    name: 'Uwase Gasana',
    avatar: 'girl',
    grade: 4,
    location: 'Kigali, Rwanda',
    countryFlag: '🇷🇼',
    points: 2420,
    badgesCount: 8,
    streakDays: 11,
    favoriteSubject: 'Bible Study'
  },
  {
    id: 'scholar-fatou',
    name: 'Fatou Diallo',
    avatar: 'scholar',
    grade: 2,
    location: 'Dakar, Senegal',
    countryFlag: '🇸🇳',
    points: 2180,
    badgesCount: 7,
    streakDays: 6,
    favoriteSubject: 'Math'
  },
  {
    id: 'scholar-abebe',
    name: 'Abebe Bekele',
    avatar: 'boy',
    grade: 3,
    location: 'Addis Ababa, Ethiopia',
    countryFlag: '🇪🇹',
    points: 1940,
    badgesCount: 6,
    streakDays: 5,
    favoriteSubject: 'Science'
  },
  {
    id: 'scholar-nneka',
    name: 'Nneka Eze',
    avatar: 'girl',
    grade: 1,
    location: 'Enugu, Nigeria',
    countryFlag: '🇳🇬',
    points: 1650,
    badgesCount: 5,
    streakDays: 10,
    favoriteSubject: 'Alphabet'
  },
  {
    id: 'scholar-brian',
    name: 'Brian Omondi',
    avatar: 'student',
    grade: 2,
    location: 'Mombasa, Kenya',
    countryFlag: '🇰🇪',
    points: 1420,
    badgesCount: 4,
    streakDays: 4,
    favoriteSubject: 'English'
  }
];

export function getLeaderboard(
  currentUser: User | null,
  userPoints: number,
  userBadgesCount: number,
  gradeFilter?: number | 'all',
  timeFilter: 'all-time' | 'weekly' = 'all-time'
): { leaderboard: LeaderboardEntry[]; userRank: number } {
  let peers = [...PEER_SCHOLARS];

  // Adjust peer points slightly if weekly filter
  if (timeFilter === 'weekly') {
    peers = peers.map(p => ({
      ...p,
      points: Math.round(p.points * 0.35 + (p.streakDays * 25))
    }));
  }

  // Filter by grade if requested
  if (gradeFilter && gradeFilter !== 'all') {
    peers = peers.filter(p => p.grade === gradeFilter);
  }

  // Build current user entry
  const currentUserId = currentUser?.id || 'current-student';
  const effectivePoints = timeFilter === 'weekly' ? Math.round(userPoints * 0.4) : userPoints;

  const userEntry: LeaderboardEntry = {
    id: currentUserId,
    name: currentUser?.name || 'You (Active Scholar)',
    avatar: currentUser?.avatar || 'scholar',
    grade: currentUser?.grade || 5,
    location: 'Lagos & Pan-Africa',
    countryFlag: '🌟',
    points: effectivePoints,
    badgesCount: userBadgesCount,
    streakDays: 6,
    favoriteSubject: 'Math',
    isCurrentUser: true
  };

  // Combine and sort
  const combined = [...peers.filter(p => p.id !== currentUserId), userEntry];
  combined.sort((a, b) => b.points - a.points);

  // Assign ranks
  const ranked: LeaderboardEntry[] = combined.map((entry, idx) => ({
    ...entry,
    rank: idx + 1
  }));

  const userRank = ranked.findIndex(r => r.isCurrentUser) + 1;

  return {
    leaderboard: ranked,
    userRank: userRank > 0 ? userRank : 1
  };
}
