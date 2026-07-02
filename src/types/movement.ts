// src/types/movement.ts

export interface Movement {
    id: string;
    name: string;
    duration: number; // seconds
  description: string;
    bodyRegion: "hips" | "neck" | "back" | "shoulders" | "full-body";
    intensity: "gentle" | "moderate" | "active";
    narrative: string[]; // Step-by-step cues Otis reads aloud
}

export interface MovementSession {
    movementId: string;
    startedAt: Date;
    completedAt?: Date;
    completed: boolean;
}

export type BodyRegion = Movement["bodyRegion"];
export type Intensity = Movement["intensity"];
