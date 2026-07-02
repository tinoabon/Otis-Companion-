// src/conversation/OtisPersonality.ts

import { Message } from "../types/conversation";

export class OtisPersonality {
    /**
     * Otis is:
     * - Calm, observant, grounded, emotionally intelligent
     * - Reliable, curious, supportive, quietly optimistic
     * - Subtly witty, never loud or childish
     * - Short responses (1-3 sentences usually)
     * - Natural, conversational, never corporate
     */

  private analyzeUserState(userMessage: string): {
        energyLevel: "low" | "moderate" | "high";
        emotionalTone: "stressed" | "calm" | "curious" | "tired" | "good";
        mentionsBody: boolean;
        mentionsWork: boolean;
        asksQuestion: boolean;
  } {
        const lower = userMessage.toLowerCase();

      const energyKeywords = {
              low: ["tired", "exhausted", "drained", "low", "rough", "oof"],
              high: ["great", "good", "energized", "excited", "pumped"]
      };

      const emotionalKeywords = {
              stressed: ["stressed", "anxious", "worried", "nervous", "tight"],
              calm: ["calm", "peaceful", "ok", "fine", "alright"],
              tired: ["tired", "exhausted", "drained", "wiped"]
      };

      const bodyKeywords = ["neck", "back", "hips", "shoulders", "sore", "stiff", "tight", "pain", "ache"];
        const workKeywords = ["work", "clinic", "patients", "meeting", "desk", "day", "busy"];

      const energyLevel =
              energyKeywords.low.some((k) => lower.includes(k)) || lower.includes("low")
            ? "low"
                : energyKeywords.high.some((k) => lower.includes(k))
            ? "high"
                : "moderate";

      const emotionalTone = emotionalKeywords.stressed.some((k) => lower.includes(k))
          ? "stressed"
              : emotionalKeywords.tired.some((k) => lower.includes(k))
          ? "tired"
              : emotionalKeywords.calm.some((k) => lower.includes(k))
          ? "calm"
              : "good";

      return {
              energyLevel,
              emotionalTone,
              mentionsBody: bodyKeywords.some((k) => lower.includes(k)),
              mentionsWork: workKeywords.some((k) => lower.includes(k)),
              asksQuestion: userMessage.includes("?")
      };
  }

  generateResponse(
        userMessage: string,
        conversationHistory: Message[],
        lastMovementTime?: Date
      ): string {
        const state = this.analyzeUserState(userMessage);

      if (conversationHistory.length === 1) {
              return `Nice to meet you, ${userMessage.trim()}. What brings you by today?`;
      }

      const isNewDay = conversationHistory.length === 1;
        if (!isNewDay && conversationHistory.length === 2) {
                return this.greetReturningUser();
        }

      if (state.mentionsBody) {
              return this.acknowledgeBody(userMessage, state.emotionalTone);
      }

      if (state.mentionsWork) {
              return this.respondToLife(userMessage, state.emotionalTone);
      }

      if (state.energyLevel === "low" && !state.mentionsBody) {
              return this.respondToLowEnergy(state.emotionalTone);
      }

      if (state.energyLevel === "high") {
              return this.respondToGoodMood();
      }

      return this.defaultCurious(userMessage);
  }

  private greetReturningUser(): string {
        const greetings = [
                "Good to see you again.",
                "Hey, you're back.",
                "Welcome back."
              ];
        return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private acknowledgeBody(userMessage: string, tone: string): string {
        const acknowledges = [
                "Yeah. That sounds like it needs attention.",
                "I hear you. Your body is telling you something.",
                "Makes sense.",
                "That would do it."
              ];
        const followUps = [
                "How long has that been going on?",
                "When did that start?",
                "How is it affecting your day?"
              ];
        const ack = acknowledges[Math.floor(Math.random() * acknowledges.length)];
        const followUp = Math.random() > 0.5
          ? " " + followUps[Math.floor(Math.random() * followUps.length)]
                : "";
        return ack + followUp;
  }

  private respondToLife(userMessage: string, tone: string): string {
        const responses = [
                "That is a lot.",
                "No wonder.",
                "Fair enough.",
                "Sounds intense.",
                "That would wear anyone out."
              ];
        const followUps = [
                "How is your back holding up with all that?",
                "Your neck surviving?",
                "How is your body handling it?"
              ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        const followUp = Math.random() > 0.5
          ? " " + followUps[Math.floor(Math.random() * followUps.length)]
                : "";
        return response + followUp;
  }

  private respondToLowEnergy(tone: string): string {
        const responses = [
                "That tracks.",
                "Yeah, some days are just like that.",
                "Makes sense you're feeling that way."
              ];
        return responses[Math.floor(Math.random() * responses.length)];
  }

  private respondToGoodMood(): string {
        const responses = [
                "Good. Let's keep that going.",
                "Nice. Good energy today.",
                "That's the way."
              ];
        return responses[Math.floor(Math.random() * responses.length)];
  }

  private defaultCurious(userMessage: string): string {
        const responses = [
                "How's your body feeling today?",
                "Anything physically going on?",
                "How's the body holding up?"
              ];
        return responses[Math.floor(Math.random() * responses.length)];
  }

  shouldSuggestMovement(
        userMessage: string,
        conversationHistory: Message[],
        lastMovementTime?: Date
      ): boolean {
        const state = this.analyzeUserState(userMessage);
        const recentMessages = conversationHistory.slice(-3);
        const mentionedBodyRecently = recentMessages.some((m) =>
                ["neck", "back", "hips", "shoulders", "sore", "stiff"].some((k) =>
                          m.content.toLowerCase().includes(k)
                                                                                  )
                                                              );
        return state.mentionsBody && mentionedBodyRecently && conversationHistory.length > 4;
  }

  getMovementRecommendation(userMessage: string): string {
        const lower = userMessage.toLowerCase();
        if (lower.includes("hip") || lower.includes("sitting"))
                return "Your hips have been sitting all day. Want to open them up for a minute?";
        if (lower.includes("neck") || lower.includes("head"))
                return "Your neck sounds like it is asking for a break. Want to loosen things up?";
        if (lower.includes("back") || lower.includes("posture"))
                return "Your back could probably use some love. Ready to do a couple minutes together?";
        if (lower.includes("shoulder") || lower.includes("stress"))
                return "Those shoulders are carrying something. Let us release some of that.";
        return "I think your body is ready to move. Want to spend a few minutes together?";
  }
}
