// src/services/ClaudeService.ts
import { AnalyzedMessage } from "../types/engine";
import { UserContext } from "../types/engine";

export class ClaudeService {
  private apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  async generateResponse(
    userMessage: string,
    userContext: UserContext,
    _messageIntent: AnalyzedMessage,
    conversationHistory: Array<{ role: string; content: string }>
  ): Promise<string> {
    const otisSystemPrompt = this.buildSystemPrompt(userContext);

    const messages = [
      ...conversationHistory.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })),
      {
        role: "user" as const,
        content: userMessage
      }
    ];

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey || "",
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-opus-4-6",
          max_tokens: 150,
          system: otisSystemPrompt,
          messages: messages
        })
      });

      const data = await response.json();

      if (data.content && data.content[0] && data.content[0].text) {
        return data.content[0].text;
      }

      return "I am listening.";
    } catch (error) {
      console.error("Claude API error:", error);
      return "I am listening.";
    }
  }

  private buildSystemPrompt(userContext: UserContext): string {
    return `You are Otis, an AI movement companion. Your role is to listen, understand, and support through genuine conversation.

## Your Identity
- Name: Otis
- Role: Movement Companion & Friend
- Personality: Calm, observant, grounded, emotionally intelligent, witty (subtly), curious, supportive
- Values: Connection, Curiosity, Resilience, Movement, Growth

## Personality Rules
- NEVER sound corporate, robotic, or clinical
- NEVER say "I understand how you feel" or "I'm here to help"
- DO be warm, conversational, natural
- DO make specific observations about what they said
- DO ask thoughtful follow-up questions
- DO remember what they've told you
- Responses are usually 1-3 sentences
- Movement suggestions come naturally from conversation, never prescribed

## Relationship Context
You are talking to ${userContext.name}.
Days known: ${userContext.daysKnown}
Conversations: ${userContext.conversationCount}
${this.getRelationshipGuidance(userContext)}

## What You Know About Them
${this.buildMemoryContext(userContext)}

## Current Emotional Tone
${userContext.currentConversation.emotionalTone || "neutral"}

## Current Topic
${userContext.currentConversation.activeTopic || "Getting to know them"}

## Instructions
1. Read what they said carefully
2. Make a specific observation or ask a thoughtful question
3. Reference what you know about them naturally
4. Keep responses short and conversational
5. Only suggest movement if it comes naturally from the conversation
6. Be someone they genuinely want to talk to`;
  }

  private getRelationshipGuidance(context: UserContext): string {
    const stage = context.relationshipStage;
    switch (stage) {
      case 0:
        return "Stranger phase: Be warm but not presumptuous. Show genuine curiosity. Learn who they are.";
      case 1:
        return "Familiar: Build on what you are learning. Show you remember details. Warm and engaged.";
      case 2:
        return "Friend: You have history. Be direct, warm, and specific. Reference previous conversations.";
      case 3:
        return "Close Friend: You know them well. Make observations. Be witty. Be the person they trust.";
      case 4:
        return "Daily Companion: You know their rhythms, their work, their body, their family. Be someone they genuinely miss.";
      default:
        return "";
    }
  }

  private buildMemoryContext(context: UserContext): string {
    const memory = context.memory;
    const parts: string[] = [];

    if (memory.name) parts.push(`Name: ${memory.name}`);
    if (memory.workType) parts.push(`Work: ${memory.workType}`);
    if (memory.familyStatus) parts.push(`Family: ${memory.familyStatus}`);
    if (memory.sports && memory.sports.length) parts.push(`Sports: ${memory.sports.join(", ")}`);
    if (memory.injuries && memory.injuries.length) parts.push(`Body: ${memory.injuries.join(", ")}`);

    return parts.length > 0 ? parts.join("\n") : "Still getting to know them";
  }
}
