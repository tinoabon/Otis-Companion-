// src/services/NotificationService.ts
export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  static sendNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === "granted") {
      new Notification(title, {
        icon: "/otis-icon.png",
        badge: "/otis-badge.png",
        ...options
      });
    }
  }

  static sendReminderNotification(reminderMessage: string): void {
    this.sendNotification("Otis", {
      body: reminderMessage,
      tag: "otis-reminder",
      requireInteraction: false
    });
  }
}
