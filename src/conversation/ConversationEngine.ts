// src/conversation/ConversationEngine.ts

import { Message, ConversationSession } from "../types/conversation";
import { OtisPersonality } from "./OtisPersonality";
import { MemoryIntegration } from "./MemoryIntegration";
import { Storage } from "../services/Storage";

export class ConversationEngine {
    private personality: OtisPersonality;
    private memoryIntegration: MemoryIntegration;
    private currentSession: ConversationSession | null = null;

  constructor() {
        this.personality = new OtisPersonality();
        this.memoryIntegration = new MemoryIntegration();
  }

  initSession(): ConversationSession {
        const today = Storage.getToday();
        const existingMemory = Storage.loadDailyMemory(today);
        const userName = Storage.loadUserProfile()?.name || null;

      if (existingMemory && existingMemory.messages.length > 0) {
              this.currentSession = {
                        date: today,
                        messages: existingMemory.messages as Message[],
                        startedAt: new Date()
              };
      } else {
              const openingMessage: Message = {
                        id: crypto.randomUUID(),
                        role: "otis",
                        content: userName
                          ? this.memoryIntegration.buildReturningGreeting(userName)
                                    : "Hey. I'm Otis. What's your name?",
                        timestamp: new Date()
              };
              this.currentSession = {
                        date: today,
                        messages: [openingMessage],
                        startedAt: new Date()
              };
              Storage.saveDailyMemory({
                        date: today,
                        userName: userName || "",
                        messages: [openingMessage]
              });
      }
        return this.currentSession;
  }

  async processMessage(userText: string): Promise<Message> {
        if (!this.currentSession) this.initSession();
        const userMessage: Message = {
                id: crypto.randomUUID(),
                role: "user",
                content: userText,
                timestamp: new Date()
        };
        this.currentSession!.messages.push(userMessage);
        const profile = Storage.loadUserProfile();
        if (!profile) {
                Storage.saveUserProfile({
                          name: userText.trim(),
                          joinDate: Storage.getToday(),
                          attributes: {}
                });
        }
        const responseText = this.personality.generateResponse(userText, this.currentSession!.messages);
        const shouldMove = this.personality.shouldSuggestMovement(userText, this.currentSession!.messages);
        let finalResponse = responseText;
        let movementId: string | undefined;
        if (shouldMove) {
                const recommendation = this.personality.getMovementRecommendation(userText);
                finalResponse = responseText + " " + recommendation;
                movementId = this.getMovementIdFromMessage(userText);
        }
        const otisMessage: Message = {
                id: crypto.randomUUID(),
                role: "otis",
                content: finalResponse,
                timestamp: new Date(),
                movementId
        };
        this.currentSession!.messages.push(otisMessage);
        const today = Storage.getToday();
        const memory = Storage.loadDailyMemory(today);
        if (memory) {
                memory.messages.push(userMessage, otisMessage);
                Storage.saveDailyMemory(memory);
        }
        return otisMessage;
  }

  private getMovementIdFromMessage(text: string): string {
        const lower = text.toLowerCase();
        if (lower.includes("hip") || lower.includes("sitting")) return "hip_opener";
        if (lower.includes("neck") || lower.includes("head")) return "neck_release";
        if (lower.includes("back") || lower.includes("posture")) return "lower_back_relief";
        if (lower.includes("shoulder")) return "shoulder_release";
        return "grounding_breath";
  }

  getSession(): ConversationSession | null { return this.currentSession; }
    getMessages(): Message[] { return this.currentSession?.messages || []; }
}
