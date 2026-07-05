// src/types/engine.ts
export enum Intent {
  NameExchange = "name_exchange",
  Greeting = "greeting",
  IdentityQuestion = "identity_question",
  BodyIssue = "body_issue",
  Story = "story",
  Opinion = "opinion",
  Question = "question",
  Achievement = "achievement",
  Emotion = "emotion",
  SmallTalk = "small_talk",
  Reflection = "reflection",
  Unknown = "unknown"
}

export enum RelationshipStage {
  Stranger = 0,
  Familiar = 1,
  Friend = 2,
  CloseFriend = 3,
  DailyCompanion = 4
}

export interface UserMemory {
  name?: string;
  workType?: string;
  familyStatus?: string;
  sports?: string[];
  injuries?: string[];
  preferences?: string[];
  recentWins?: string[];
  routines?: string[];
  fears?: string[];
  humor?: string[];
}

export interface CurrentConversation {
  activeTopic?: string;
  secondaryTopic?: string;
  emotionalTone?: "happy" | "tired" | "stressed" | "calm" | "neutral";
  lastQuestionAsked?: string;
  recentBodyMentions?: string[];
}

export interface UserContext {
  name: string;
  relationshipStage: RelationshipStage;
  daysKnown: number;
  conversationCount: number;
  memory: UserMemory;
  currentConversation: CurrentConversation;
  todayMoved?: boolean;
  lastMovementTime?: Date;
}

export interface AnalyzedMessage {
  text: string;
  intent: Intent;
  entities: string[];
  sentiment: "positive" | "neutral" | "negative";
  mentionsBody: boolean;
  mentionsMovement: boolean;
}

export interface ClaudeContext {
  userContext: UserContext;
  messageIntent: AnalyzedMessage;
  conversationHistory: Array<{ role: string; content: string }>;
  otisPersonality: string;
}
