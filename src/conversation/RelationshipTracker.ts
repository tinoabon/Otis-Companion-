// src/conversation/RelationshipTracker.ts
import { RelationshipStage } from "../types/engine";

export class RelationshipTracker {
  calculateStage(conversationCount: number, daysKnown: number): RelationshipStage {
    // Strangers: First few conversations
    if (conversationCount < 3) return RelationshipStage.Stranger;

    // Familiar: Multiple conversations in first week
    if (daysKnown < 7 && conversationCount < 10) return RelationshipStage.Familiar;

    // Friend: Regular conversations, some history
    if (daysKnown < 30 && conversationCount < 20) return RelationshipStage.Familiar;
    if (daysKnown < 30) return RelationshipStage.Friend;

    // Close Friend: Months of regular check-ins
    if (daysKnown < 90) return RelationshipStage.Friend;
    if (daysKnown < 180) return RelationshipStage.CloseFriend;

    // Daily Companion: Over 6 months
    return RelationshipStage.DailyCompanion;
  }

  getRelationshipContext(stage: RelationshipStage): string {
    switch (stage) {
      case RelationshipStage.Stranger:
        return "We just met. Be warm but not presumptuous. Learn their name and what matters to them.";
      case RelationshipStage.Familiar:
        return "We are getting to know each other. Show genuine curiosity. Start remembering details.";
      case RelationshipStage.Friend:
        return "We have some history. Reference previous conversations naturally. Be more direct and warm.";
      case RelationshipStage.CloseFriend:
        return "We know each other well. Make specific observations. Use what you know about them. Be witty and supportive.";
      case RelationshipStage.DailyCompanion:
        return "We talk regularly. You know their rhythms, their work, their body, their family. Be like someone they genuinely miss when they do not hear from them.";
      default:
        return "";
    }
  }
}
