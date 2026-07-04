// src/services/Storage.ts

import { DailyMemory, UserProfile } from "../types/memory";

const STORAGE_PREFIX = "otis_";

export class Storage {
    static saveDailyMemory(memory: DailyMemory): void {
          localStorage.setItem(`${STORAGE_PREFIX}daily_${memory.date}`, JSON.stringify(memory));
    }

  static loadDailyMemory(date: string): DailyMemory | null {
        const data = localStorage.getItem(`${STORAGE_PREFIX}daily_${date}`);
        return data ? JSON.parse(data) : null;
  }

  static getToday(): string {
        return new Date().toISOString().split("T")[0];
  }

  static getYesterday(): string {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split("T")[0];
  }

  static saveUserProfile(profile: UserProfile): void {
        localStorage.setItem(`${STORAGE_PREFIX}profile`, JSON.stringify(profile));
  }

  static loadUserProfile(): UserProfile | null {
        const data = localStorage.getItem(`${STORAGE_PREFIX}profile`);
        return data ? JSON.parse(data) : null;
  }

  static recordMovement(date: string, movementId: string): void {
        const memory = this.loadDailyMemory(date);
        if (memory) {
                memory.movedToday = true;
                memory.lastExerciseType = movementId;
                this.saveDailyMemory(memory);
        }
  }

  static getAllDailyMemories(): DailyMemory[] {
        const memories: DailyMemory[] = [];
        for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(`${STORAGE_PREFIX}daily_`)) {
                          const data = localStorage.getItem(key);
                          if (data) memories.push(JSON.parse(data));
                }
        }
        return memories;
  }

  static clearAllData(): void {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(STORAGE_PREFIX)) keysToRemove.push(key);
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
}
