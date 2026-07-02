import React, { useState } from 'react';
import { Exercise } from '../types/movement';

interface ExerciseCardProps {
    exercise: Exercise;
    onComplete?: (exerciseId: string, reps: number) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onComplete }) => {
    const [expanded, setExpanded] = useState(false);
    const [completed, setCompleted] = useState(false);

    const handleComplete = () => {
          setCompleted(true);
          if (onComplete) {
                  onComplete(exercise.id, exercise.defaultReps ?? 10);
          }
    };

    const difficultyColor: Record<string, string> = {
          beginner: '#4CAF50',
          intermediate: '#FF9800',
          advanced: '#F44336',
    };

    return (
          <div className={`exercise-card ${completed ? 'completed' : ''}`}>
                  <div className="exercise-header" onClick={() => setExpanded(!expanded)}>
                            <div className="exercise-title">
                                      <span className="exercise-name">{exercise.name}</span>span>
                                      <span
                                                    className="difficulty-badge"
                                                    style={{ backgroundColor: difficultyColor[exercise.difficulty] ?? '#888' }}
                                                  >
                                        {exercise.difficulty}
                                      </span>span>
                            </div>div>
                          <span className="expand-icon">{expanded ? '▲' : '▼'}</span>span>
                  </div>div>
            {expanded && (
                    <div className="exercise-details">
                              <p className="exercise-description">{exercise.description}</p>p>
                              <div className="exercise-meta">
                                          <span>{exercise.duration} sec</span>span>
                                {exercise.defaultReps && <span>{exercise.defaultReps} reps</span>span>}
                                          <span>{exercise.category}</span>span>
                              </div>div>
                      {!completed && (
                                  <button className="complete-button" onClick={handleComplete}>
                                                Mark Complete
                                  </button>button>
                              )}
                      {completed && <span className="completed-label">Completed!</span>span>}
                    </div>div>
                )}
          </div>div>
        );
};</div>
