import { Models } from 'react-native-appwrite';

export type Habit = Models.DefaultRow & {
  user_id: string;
  title: string;
  description: string;
  frequency: string;
  streak_count: number;
  last_completed: string;
};

export type HabitCompletion = Models.DefaultRow & {
  habit_id: string;
  user_id: string;
  completed_at: string;
};
