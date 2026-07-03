// src/types/memory.ts

export interface DailyMemory {
    date: string;
    userName: string;
    messages: any[];
    notes?: string[];
    movedToday?: boolean;
    lastExerciseType?: string;
}

export interface UserProfile {
    name: string;
    joinDate: string;
    attributes: {
      workType?: string;
      familyStatus?: string;
      interests?: string[];
      injuries?: string[];
      goals?: string[];
    };
}

export interface LongTermMemory {
    profile: UserProfile;
    conversationHistory: {
      date: string;
      summary: string;
    }[];
    patterns: {
      frequentComplaints?: string[];
      exercisesRespondsWellTo?: string[];
      typicalMood?: string;
    };
}
