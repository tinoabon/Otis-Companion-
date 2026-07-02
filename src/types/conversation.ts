// src/types/conversation.ts

export interface Message {
    id: string;
    role: "user" | "otis";
    content: string;
    timestamp: Date;
    movementId?: string; // If this message triggered a movement
}

export interface ConversationSession {
    date: string;
    messages: Message[];
    startedAt: Date;
}

export interface ConversationState {
    sessions: ConversationSession[];
    currentSession: ConversationSession | null;
    isTyping: boolean;
    userName: string | null;
}

export type MessageRole = "user" | "otis";
