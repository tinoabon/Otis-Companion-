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
  if (Notification.permission !== "granted") {
    return;
  }

  const payload: NotificationOptions = {
    icon: "/otis-icon.png",
    badge: "/otis-badge.png",
    ...options
  };

  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, payload);
    });
  } else {
    new Notification(title, payload);
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
