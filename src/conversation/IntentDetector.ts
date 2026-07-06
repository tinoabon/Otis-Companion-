// src/conversation/IntentDetector.ts
import { Intent, AnalyzedMessage } from "../types/engine";

export class IntentDetector {
  detect(message: string, _conversationHistory: any[]): AnalyzedMessage {
    const lower = message.toLowerCase();
    let intent = Intent.Unknown;

    // Name exchange (first message or asking for name)
    if (lower.includes("my name") || lower.includes("call me") || lower.includes("i am") || lower.includes("i'm")) {
      intent = Intent.NameExchange;
    }

    // Identity question
    if (lower.includes("who are you") || lower.includes("what's your name") || lower.includes("your name")) {
      intent = Intent.IdentityQuestion;
    }

    // Greeting
    if (lower.match(/^(hi|hey|hello|morning|good)/i)) {
      intent = Intent.Greeting;
    }

    // Body issue
    if (this.mentionsBody(lower)) {
      intent = Intent.BodyIssue;
    }

    // Story (sharing something that happened)
    if (lower.includes("yesterday") || lower.includes("today") || lower.includes("this morning") || lower.includes("spent")) {
      intent = Intent.Story;
    }

    // Opinion
    if (lower.includes("should") || lower.includes("think") || lower.includes("believe") || lower.includes("opinion")) {
      intent = Intent.Opinion;
    }

    // Question
    if (message.includes("?")) {
      if (intent === Intent.Unknown) {
        intent = Intent.Question;
      }
    }

    // Achievement
    if (lower.includes("did") || lower.includes("completed") || lower.includes("finished") || lower.includes("accomplished")) {
      if (this.mentionsMovement(lower) || this.mentionsPositive(lower)) {
        intent = Intent.Achievement;
      }
    }

    // Emotion
    if (this.mentionsEmotion(lower)) {
      intent = Intent.Emotion;
    }

    // Reflection
    if (lower.includes("feel") || lower.includes("feeling") || lower.includes("felt")) {
      intent = Intent.Reflection;
    }

    return {
      text: message,
      intent,
      entities: this.extractEntities(message),
      sentiment: this.detectSentiment(lower),
      mentionsBody: this.mentionsBody(lower),
      mentionsMovement: this.mentionsMovement(lower)
    };
  }

  private mentionsBody(text: string): boolean {
    const bodyKeywords = ["neck", "back", "hips", "shoulders", "sore", "stiff", "tight", "pain", "ache", "spine"];
    return bodyKeywords.some((k) => text.includes(k));
  }

  private mentionsMovement(text: string): boolean {
    const movementKeywords = ["move", "stretch", "exercise", "mobility", "walk", "run", "5k"];
    return movementKeywords.some((k) => text.includes(k));
  }

  private mentionsPositive(text: string): boolean {
    const positive = ["great", "good", "amazing", "excellent", "wonderful", "love"];
    return positive.some((k) => text.includes(k));
  }

  private mentionsEmotion(text: string): boolean {
    const emotions = ["tired", "stressed", "anxious", "calm", "happy", "sad", "frustrated"];
    return emotions.some((k) => text.includes(k));
  }

  private detectSentiment(text: string): "positive" | "neutral" | "negative" {
    const positiveWords = ["good", "great", "love", "amazing", "excellent", "happy", "wonderful"];
    const negativeWords = ["bad", "hate", "tired", "exhausted", "frustrated", "angry", "upset"];
    const hasPositive = positiveWords.some((w) => text.includes(w));
    const hasNegative = negativeWords.some((w) => text.includes(w));
    if (hasPositive && !hasNegative) return "positive";
    if (hasNegative && !hasPositive) return "negative";
    return "neutral";
  }

  private extractEntities(message: string): string[] {
    const entities: string[] = [];
    const lower = message.toLowerCase();

    // Work
    if (lower.includes("clinic") || lower.includes("patient") || lower.includes("work")) entities.push("work");
    if (lower.includes("football") || lower.includes("sport")) entities.push("sports");

    // Body parts
    if (lower.includes("neck")) entities.push("neck");
    if (lower.includes("back") || lower.includes("spine")) entities.push("back");
    if (lower.includes("hip")) entities.push("hips");

    // Emotions
    if (lower.includes("tired") || lower.includes("exhausted")) entities.push("tired");
    if (lower.includes("stressed") || lower.includes("anxious")) entities.push("stressed");
    if (lower.includes("calm") || lower.includes("good")) entities.push("good");

    return [...new Set(entities)];
  }
}
