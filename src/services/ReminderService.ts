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
        !r.delivered &&
        new Date(r.scheduledFor) <= now
    );
  }

markDelivered(reminderId: string): void {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(reminderId)) {
      const data = localStorage.getItem(key);
      if (data) {
        const reminder = JSON.parse(data);
        reminder.delivered = true;
        reminder.deliveredAt = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(reminder));
        return;
      }
    }
  }
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

    skipReminder(reminderId: string): void {
          for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && key.includes(reminderId)) {
                            const data = localStorage.getItem(key);
                            if (data) {
                                        const reminder = JSON.parse(data);
                                        reminder.skipped = true;
                                        reminder.skippedAt = new Date().toISOString();
                                        localStorage.setItem(key, JSON.stringify(reminder));
                                        return;
                            }
                  }
          }
    }

    recordOutcome(userId: string, outcome: "completed" | "skipped"): void {
          const today = new Date().toISOString().split("T")[0];
          const key = "otis_adherence_" + userId + "_" + today;
          const existing = localStorage.getItem(key);
          const log = existing ? JSON.parse(existing) : { completed: 0, skipped: 0 };
          log[outcome] = (log[outcome] || 0) + 1;
          localStorage.setItem(key, JSON.stringify(log));
    }

    getStreak(userId: string): { currentStreak: number; totalCompleted: number; totalSkipped: number } {
          let currentStreak = 0;
          let totalCompleted = 0;
          let totalSkipped = 0;

          for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && key.startsWith("otis_adherence_" + userId + "_")) {
                            const data = JSON.parse(localStorage.getItem(key) || "{}");
                            totalCompleted += data.completed || 0;
                            totalSkipped += data.skipped || 0;
                  }
          }

          const day = new Date();
          let checking = true;
          while (checking) {
                  const dateStr = day.toISOString().split("T")[0];
                  const key = "otis_adherence_" + userId + "_" + dateStr;
                  const data = localStorage.getItem(key);
                  if (data && JSON.parse(data).completed > 0) {
                            currentStreak++;
                            day.setDate(day.getDate() - 1);
                  } else {
                            checking = false;
                  }
          }

          return { currentStreak, totalCompleted, totalSkipped };
    }

    clearScheduledReminders(userId: string): void {
          const toRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && key.startsWith(this.storageKey + userId)) {
                            const data = localStorage.getItem(key);
                            if (data) {
                                        const reminder = JSON.parse(data);
                                        if (!reminder.completed && !reminder.skipped) {
                                                      toRemove.push(key);
                                        }
                            }
                  }
          }
          toRemove.forEach((key) => localStorage.removeItem(key));
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

autoScheduleReminders(userId: string, config?: ReminderConfig | null): void {
      const now = new Date();

      const parseTime = (value: string | undefined, fallbackHour: number): Date => {
              const time = new Date(now);
              if (value) {
                        const parts = value.split(":").map(Number);
                        time.setHours(parts[0], parts[1] || 0, 0, 0);
              } else {
                        time.setHours(fallbackHour, 0, 0, 0);
              }
              if (time < now) time.setDate(time.getDate() + 1);
              return time;
      };

      const morningTime = parseTime(config?.preferredTimes?.morning, 7);
      this.createReminder(
              userId,
              ReminderType.MobilityExercise,
              "Good morning. Ready to wake up your body?",
              morningTime,
              config?.frequencyByType?.[ReminderType.MobilityExercise] || ReminderFrequency.Daily
            );

      const afternoonTime = parseTime(config?.preferredTimes?.afternoon, 14);
      this.createReminder(
              userId,
              ReminderType.CheckIn,
              "How is your body feeling halfway through the day?",
              afternoonTime,
              config?.frequencyByType?.[ReminderType.CheckIn] || ReminderFrequency.Daily
            );

      const eveningTime = parseTime(config?.preferredTimes?.evening, 18);
      this.createReminder(
              userId,
              ReminderType.Recovery,
              "Wind down time. Want to spend a few minutes releasing tension?",
              eveningTime,
              config?.frequencyByType?.[ReminderType.Recovery] || ReminderFrequency.Daily
            );
}
}
