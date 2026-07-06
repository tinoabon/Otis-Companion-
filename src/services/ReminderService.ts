// src/services/ReminderService.ts
import { Reminder, ReminderType, ReminderFrequency, ReminderConfig } from "../types/reminders";

export class ReminderService {
  private storageKey = "otis_reminders_";
  private configKey = "otis_reminder_config_";

  createReminder(
    userId: string,
    type: ReminderType,
    message: string,
    scheduledFor: Date,
    frequency: ReminderFrequency = ReminderFrequency.Once,
    context?: any
  ): Reminder {
    const reminder: Reminder = {
      id: Math.random().toString(36).substring(7),
      userId,
      type,
      message,
      scheduledFor,
      frequency,
      isActive: true,
      completed: false,
      context,
      createdAt: new Date(),
      nextReminder: this.calculateNextReminder(scheduledFor, frequency)
    };

    this.saveReminder(reminder);

    return reminder;
  }

  getReminders(userId: string): Reminder[] {
    const reminders: Reminder[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.storageKey + userId)) {
        const data = localStorage.getItem(key);
        if (data) {
          const reminder = JSON.parse(data);
          reminder.scheduledFor = new Date(reminder.scheduledFor);
          if (reminder.nextReminder) {
            reminder.nextReminder = new Date(reminder.nextReminder);
          }
          reminders.push(reminder);
        }
      }
    }

    return reminders;
  }

  getDueReminders(userId: string): Reminder[] {
    const now = new Date();
    return this.getReminders(userId).filter(
      (r) =>
        r.isActive &&
        !r.completed &&
        new Date(r.scheduledFor) <= now
    );
  }

  completeReminder(reminderId: string): void {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(reminderId)) {
        const data = localStorage.getItem(key);
        if (data) {
          const reminder = JSON.parse(data);
          reminder.completed = true;
          reminder.completedAt = new Date().toISOString();
          localStorage.setItem(key, JSON.stringify(reminder));
          return;
        }
      }
    }
  }

  private saveReminder(reminder: Reminder): void {
    const key = this.storageKey + reminder.userId + "_" + reminder.id;
    localStorage.setItem(key, JSON.stringify(reminder));
  }

  private calculateNextReminder(scheduledFor: Date, frequency: ReminderFrequency): Date {
    const next = new Date(scheduledFor);

    switch (frequency) {
      case ReminderFrequency.Daily:
        next.setDate(next.getDate() + 1);
        break;
      case ReminderFrequency.ThreeTimesWeek:
        next.setDate(next.getDate() + 2);
        break;
      case ReminderFrequency.TwiceWeekly:
        next.setDate(next.getDate() + 3);
        break;
      case ReminderFrequency.Weekly:
        next.setDate(next.getDate() + 7);
        break;
      default:
        return next;
    }

    return next;
  }

  saveReminderConfig(userId: string, config: ReminderConfig): void {
    const key = this.configKey + userId;
    localStorage.setItem(key, JSON.stringify(config));
  }

  getReminderConfig(userId: string): ReminderConfig | null {
    const key = this.configKey + userId;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  autoScheduleReminders(userId: string, _userProfile: any): void {
    const now = new Date();

    const morningTime = new Date(now);
    morningTime.setHours(7, 0, 0, 0);
    if (morningTime < now) morningTime.setDate(morningTime.getDate() + 1);

    this.createReminder(
      userId,
      ReminderType.MobilityExercise,
      "Good morning. Ready to wake up your body?",
      morningTime,
      ReminderFrequency.Daily
    );

    const afternoonTime = new Date(now);
    afternoonTime.setHours(14, 0, 0, 0);
    if (afternoonTime < now) afternoonTime.setDate(afternoonTime.getDate() + 1);

    this.createReminder(
      userId,
      ReminderType.CheckIn,
      "How is your body feeling halfway through the day?",
      afternoonTime,
      ReminderFrequency.Daily
    );

    const eveningTime = new Date(now);
    eveningTime.setHours(18, 0, 0, 0);
    if (eveningTime < now) eveningTime.setDate(eveningTime.getDate() + 1);

    this.createReminder(
      userId,
      ReminderType.Recovery,
      "Wind down time. Want to spend a few minutes releasing tension?",
      eveningTime,
      ReminderFrequency.Daily
    );
  }
}
