// src/memory/MemoryStore.ts

import { DailyMemory, UserProfile, LongTermMemory } from "../types/memory";
import { Storage } from "../services/Storage";

export class MemoryStore {
    private static instance: MemoryStore;
    private profile: UserProfile | null = null;
    private longTermMemory: LongTermMemory | null = null;

  static getInstance(): MemoryStore {
        if (!MemoryStore.instance) MemoryStore.instance = new MemoryStore();
        return MemoryStore.instance;
  }

  loadAll(): void {
        this.profile = Storage.loadUserProfile();
        const allMemories = Storage.getAllDailyMemories();
        if (this.profile) {
                this.longTermMemory = {
                          profile: this.profile,
                          conversationHistory: allMemories.map((m) => ({ date: m.date, summary: m.notes?.join(", ") || "" })),
                          patterns: this.analyzePatterns(allMemories)
                };
        }
  }

  private analyzePatterns(memories: DailyMemory[]): LongTermMemory["patterns"] {
        const complaints: Record<string, number> = {};
        const bodyKeywords = ["neck", "back", "hips", "shoulders", "knee", "wrist"];
        memories.forEach((memory) => {
                memory.messages?.forEach((msg: any) => {
                          if (msg.role === "user") bodyKeywords.forEach((kw) => {
                                      if (msg.content?.toLowerCase().includes(kw)) complaints[kw] = (complaints[kw] || 0) + 1;
                          });
                });
        });
        const frequentComplaints = Object.entries(complaints).sort(([, a], [, b]) => b - a).slice(0, 3).map(([kw]) => kw);
        return { frequentComplaints };
  }

  getProfile(): UserProfile | null { return this.profile; }
    getLongTermMemory(): LongTermMemory | null { return this.longTermMemory; }
    getTodayMemory(): DailyMemory | null { return Storage.loadDailyMemory(Storage.getToday()); }
    getYesterdayMemory(): DailyMemory | null { return Storage.loadDailyMemory(Storage.getYesterday()); }
    hasUserProfile(): boolean { return this.profile !== null; }
    getUserName(): string | null { return this.profile?.name || null; }
}
