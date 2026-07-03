// src/types/movement.ts

export interface Movement {
    id: string;
    name: string;
    duration: number;
    description: string;
    bodyRegion: string;
    intensity: 'gentle' | 'moderate' | 'energizing';
    narrative: string[];
}

export interface MovementRecommendation {
    movement: Movement;
    reason: string;
    context: string;
}
