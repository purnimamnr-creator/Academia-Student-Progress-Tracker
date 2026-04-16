export interface TestScore {
  id: string;
  subject: string;
  date: string;
  score: number;
  maxScore: number;
  type: 'test' | 'assignment' | 'exam';
  notes?: string;
}

export interface Merit {
  id: string;
  title: string;
  date: string;
  description: string;
  category: 'academic' | 'behavior' | 'extracurricular';
}

export interface AcademicGoal {
  id: string;
  title: string;
  targetDate: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  status: 'in-progress' | 'completed' | 'failed';
}

export interface StudySession {
  id: string;
  title: string;
  start: string;
  end: string;
  subject: string;
  reminderSet: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  dailyGoalMinutes: number;
  streak: number;
  lastActiveDate: string;
  role: 'teacher' | 'student';
  studentIds?: string[]; // For teachers: list of student UIDs they manage
  standard?: string; // e.g., "1st Standard", "3rd Standard"
}
