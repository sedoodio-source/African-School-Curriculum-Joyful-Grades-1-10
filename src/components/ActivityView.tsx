import React from 'react';
import { Topic, Subject, User } from '../types';
import InteractiveLessonLab from './InteractiveLessonLab';

interface ActivityViewProps {
  topic: Topic;
  subject?: Subject;
  grade?: number;
  user?: User;
  resetKey?: number;
  initialMode?: 'matching' | 'video' | 'quiz' | 'creative';
  onComplete?: (score: number, activityType: string) => void;
}

export default function ActivityView({ 
  topic, 
  subject = 'Math', 
  grade = 5, 
  user,
  resetKey,
  initialMode = 'matching',
  onComplete
}: ActivityViewProps) {
  const safeUser: User = user || {
    id: 'student-default',
    name: 'Scholar',
    role: 'student',
    grade: grade,
    avatar: 'scholar'
  };

  return (
    <InteractiveLessonLab
      topic={topic}
      subject={subject}
      grade={grade}
      user={safeUser}
      resetKey={resetKey}
      initialMode={initialMode}
      onActivityComplete={onComplete}
    />
  );
}
