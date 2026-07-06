// src/types/reminders.ts
export enum ReminderType {
  MobilityExercise = "mobility",
  StrengthExercise = "strength",
  Workout = "workout",
  CheckIn = "checkin",
  BodyAwareness = "body_awareness",
  Recovery = "recovery"
}

export enum ReminderFrequency {
  Once = "once",
  Daily = "daily",
  ThreeTimesWeek = "3x_week",
  TwiceWeekly = "2x_week",
  Weekly = "weekly"
}

export interface Reminder {
  id: string;
  userId: string;
  type: ReminderType;
  message: string;
  scheduledFor: Date;
  frequency: ReminderFrequency;
  isActive: boolean;
  completed: boolean;
  completedAt?: Date;
  context?: {
    relatedTopic?: string;
    bodyRegion?: string;
    intensity?: "gentle" | "moderate" | "intense";
  };
  createdAt: Date;
  nextReminder?: Date;
}

export interface ReminderConfig {
  userId: string;
  enablePushNotifications: boolean;
  preferredTimes: {
    morning?: string;
    afternoon?: string;
    evening?: string;
  };
  frequencyByType: {
    [key in ReminderType]?: ReminderFrequency;
  };
  autoScheduleReminders: boolean;
}
