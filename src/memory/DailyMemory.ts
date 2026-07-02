// src/memory/DailyMemory.ts

import { DailyMemory } from "../types/memory";
import { Message } from "../types/conversation";
import { Storage } from "../services/Storage";

export class DailyMemoryManager {
    private today: string;
    private memory: DailyMemory | null = null;

  constructor() {
        this.today = Storage.getToday();
        this.memory = Storage.loadDailyMemory(this.today);
  }

  initForUser(userName: string): DailyMemory {
        if (this.memory) return this.memory;
        const newMemory: DailyMemory = { date: this.today, userName, messages: [], notes: [], movedToday: false };
        Storage.saveDailyMemory(newMemory);
        this.memory = newMemory;
        return newMemory;
  }

  addMessage(message: Message): void {
        if (!this.memory) return;
        this.memory.messages.push(message);
        Storage.saveDailyMemory(this.memory);
  }

  recordMovement(movementId: string): void {
        if (!this.memory) return;
        this.memory.movedToday = true;
        this.memory.lastExerciseType = movementId;
        Storage.saveDailyMemory(this.memory);
  }

  getMemory(): DailyMemory | null { return this.memory; }
    hasMoved(): boolean { return this.memory?.movedToday || false; }
    getMessages(): Message[] { return (this.memory?.messages as Message[]) || []; }
    getMessageCount(): number { return this.memory?.messages?.length || 0; }
}
