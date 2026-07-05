// src/conversation/MemoryManager.ts
import { UserContext, UserMemory, CurrentConversation, RelationshipStage } from "../types/engine";

export class MemoryManager {
  loadUserContext(userName: string, dailyMemory: any): UserContext {
    const stored = localStorage.getItem(`otis_user_${userName}`);

    if (stored) {
      const context: UserContext = JSON.parse(stored);
      context.conversationCount += 1;
      return context;
    }

    // New user
    const today = new Date();
    return {
      name: userName,
      relationshipStage: RelationshipStage.Stranger,
      daysKnown: 0,
      conversationCount: 1,
      memory: {},
      currentConversation: {
        activeTopic: undefined,
        emotionalTone: "neutral"
      }
    };
  }

  saveUserContext(context: UserContext): void {
    localStorage.setItem(`otis_user_${context.name}`, JSON.stringify(context));
  }

  updateMemoryFromConversation(context: UserContext, userMessage: string): UserContext {
    const lower = userMessage.toLowerCase();

    // Extract work type
    if (lower.includes("clinic")) {
      context.memory.workType = "chiropractor";
    }
    if (lower.includes("patient")) {
      context.memory.workType = "healthcare";
    }

    // Extract sports
    if (lower.includes("football")) {
      if (!context.memory.sports) context.memory.sports = [];
      if (!context.memory.sports.includes("football")) {
        context.memory.sports.push("football");
      }
    }

    // Extract family
    if (lower.includes("daughter") || lower.includes("son")) {
      context.memory.familyStatus = "parent";
    }

    // Extract injuries
    if (lower.includes("back")) {
      if (!context.memory.injuries) context.memory.injuries = [];
      if (!context.memory.injuries.includes("back")) {
        context.memory.injuries.push("back");
      }
    }

    // Update conversation context
    if (lower.includes("tired") || lower.includes("exhausted")) {
      context.currentConversation.emotionalTone = "tired";
    }
    if (lower.includes("stressed")) {
      context.currentConversation.emotionalTone = "stressed";
    }
    if (lower.includes("good") || lower.includes("great")) {
      context.currentConversation.emotionalTone = "calm";
    }

    return context;
  }
}
