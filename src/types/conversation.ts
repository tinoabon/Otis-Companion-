// src/types/conversation.ts

export interface Message {
    id: string;
    role: 'user' | 'otis';
    content: string;
    type: 'text' | 'exercise-card' | 'reflection';
    timestamp: Date;
}

export interface ConversationContext {
    messages: Message[];
    recentTopics: string[];
    lastExerciseTime?: Date;
    userEnergyLevel?: 'low' | 'moderate' | 'high';
    recentMood?: string;
    recentlyMentioned?: string[];
}
