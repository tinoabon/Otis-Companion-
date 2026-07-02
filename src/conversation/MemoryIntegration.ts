// src/conversation/MemoryIntegration.ts

import { Storage } from "../services/Storage";
import { UserProfile } from "../types/memory";

export class MemoryIntegration {
    buildReturningGreeting(userName: string): string {
          const yesterday = Storage.getYesterday();
          const yesterdayMemory = Storage.loadDailyMemory(yesterday);
          const hour = new Date().getHours();
          const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Hey" : "Good evening";
          if (yesterdayMemory?.movedToday) return `${timeGreeting}, ${userName}. You moved yesterday - how's the body feeling today?`;
          if (yesterdayMemory?.notes?.length) return `${timeGreeting}, ${userName}. How are you doing today?`;
          return `${timeGreeting}, ${userName}. Good to have you back.`;
    }

  extractNotableTopics(messages: { role: string; content: string }[]): string[] {
        const bodyKeywords = ["neck", "back", "hips", "shoulders", "knee", "wrist"];
        const topics: string[] = [];
        messages.forEach((m) => {
                if (m.role === "user") bodyKeywords.forEach((kw) => {
                          if (m.content.toLowerCase().includes(kw) && !topics.includes(kw)) topics.push(kw);
                });
        });
        return topics;
  }

  updateProfileFromConversation(profile: UserProfile, messages: { role: string; content: string }[]): UserProfile {
        const updated = { ...profile };
        messages.forEach((m) => {
                if (m.role !== "user") return;
                const lower = m.content.toLowerCase();
                if (lower.includes("clinic") || lower.includes("patients")) updated.attributes.workType = "clinic";
                else if (lower.includes("desk") || lower.includes("office")) updated.attributes.workType = "desk";
        });
        return updated;
  }

  saveDaySummary(date: string): void {
        const memory = Storage.loadDailyMemory(date);
        if (!memory) return;
        memory.notes = this.extractNotableTopics(memory.messages);
        Storage.saveDailyMemory(memory);
  }
}
