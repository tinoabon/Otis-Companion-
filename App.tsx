import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Types
interface UserProfile {
  name: string;
}

interface Message {
  id: string;
  role: 'user' | 'otis';
  type: 'text' | 'emotional-state' | 'exercise' | 'breathing' | 'reflection' | 'closing';
  content: string;
  component?: React.ReactNode;
  timestamp: Date;
}

interface Movement {
  id: string;
  name: string;
  duration: number;
  narration: string[];
  cues: string[];
}

interface DailyMemory {
  date: string;
  messages: Message[];
  profile: UserProfile;
}

// Movement Library
const MOVEMENTS: Record<string, Movement> = {
  upper_back: {
    id: 'upper_back',
    name: 'Upper Back Release',
    duration: 5,
    narration: [
      "Let's start with your upper back.",
      "Stand or sit tall. Feel your shoulders for a moment.",
      "Now gently roll them back. Once, twice, now do 10 more rolls forward then 10 backwards.",
      "Let them drop. Feel the difference?",
      "Good. Now clasp your hands behind you, if that works.",
      "Gently press down and open your chest.",
      "Breathe here. You're waking up the muscles that got tight.",
      "Beautiful. That's the foundation."
    ],
    cues: ['Stand or sit comfortably', 'Gentle shoulder rolls', 'Feel your upper back']
  },
  hips_opening: {
    id: 'hips_opening',
    name: 'Hip Opening',
    duration: 5,
    narration: [
      "Now let's wake up your hips.",
      "Sitting or standing—whatever you prefer.",
      "Gently make circles with your hips.",
      "Slow and easy. Let your whole body relax into it.",
      "You're undoing hours of sitting.",
      "Feel how your lower back responds?",
      "Keep going. Nice and slow.",
      "You're doing this right."
    ],
    cues: ['Slow hip circles', 'Feel your lower back release', 'Move from your center']
  },
  neck_gentle: {
    id: 'neck_gentle',
    name: 'Gentle Neck Release',
    duration: 4,
    narration: [
      "Let's be gentle with your neck.",
      "Sit tall. Eyes forward.",
      "Slowly turn your head right. Hold for a breath.",
      "Come back to center.",
      "Now left. Same slowness.",
      "You're just opening up the tension. Not stretching.",
      "One more each way.",
      "Notice how that feels."
    ],
    cues: ['Slow head turns', 'No forcing', 'Breathe deeply']
  },
  breathing: {
    id: 'breathing',
    name: 'Grounding Breath',
    duration: 3,
    narration: [
      "Let's anchor this with your breath.",
      "Sit comfortably. Close your eyes if you want.",
      "Inhale for four counts.",
      "Hold for four.",
      "Exhale for four.",
      "Hold for four.",
      "Again. Slow and steady.",
      "You're bringing this into your body."
    ],
    cues: ['4-4-4-4 pattern', 'Slow breathing', 'Feel your whole body calm']
  },
  morning_flow: {
    id: 'morning_flow',
    name: 'Morning Wake-Up',
    duration: 7,
    narration: [
      "Let's wake up your whole body gently.",
      "Start with some gentle stretching. Reach toward the ceiling.",
      "Now touch your toes—not to get flexible, just to notice.",
      "Gentle neck rolls. Not full circles. Just half circles.",
      "Roll your shoulders back a few times.",
      "Now let's do some hip circles. Moving your center around.",
      "Feel how everything is connected?",
      "That's the foundation of a good day."
    ],
    cues: ['Gentle full-body movement', 'Wake up without forcing', 'Notice how your body responds']
  }
};

// Emotional States
const EMOTIONAL_STATES = [
  { id: 'energized', emoji: '😊', label: 'Ready to move' },
  { id: 'normal', emoji: '😌', label: 'Pretty good' },
  { id: 'low', emoji: '😴', label: 'Low energy' },
  { id: 'stiff', emoji: '😬', label: 'Stiff' },
  { id: 'pain', emoji: '🤕', label: "Something's bothering me" }
];

// Storage
const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

const loadMemory = (): DailyMemory | null => {
  const today = getTodayDate();
  const stored = localStorage.getItem(`otis_memory_${today}`);
  return stored ? JSON.parse(stored) : null;
};

const saveMemory = (memory: DailyMemory) => {
  const today = getTodayDate();
  localStorage.setItem(`otis_memory_${today}`, JSON.stringify(memory));
};

// Message Components
const TextMessage: React.FC<{ role: 'user' | 'otis'; content: string }> = ({ role, content }) => (
  <div className={`message message-${role}`}>
    <div className="message-bubble">{content}</div>
  </div>
);

const TypingIndicator: React.FC = () => (
  <div className="message message-otis">
    <div className="message-bubble typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
);

const EmotionalStateOptions: React.FC<{ onSelect: (state: string) => void }> = ({ onSelect }) => (
  <div className="message message-otis">
    <div className="quick-replies">
      {EMOTIONAL_STATES.map((state) => (
        <button
          key={state.id}
          onClick={() => onSelect(state.id)}
          className="quick-reply-btn"
        >
          <span className="emoji">{state.emoji}</span>
          <span className="label">{state.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const ExerciseCard: React.FC<{ 
  movement: Movement; 
  onStart: () => void 
}> = ({ movement, onStart }) => (
  <div className="message message-otis">
    <div className="exercise-card">
      <h3>{movement.name}</h3>
      <p className="duration">About {movement.duration} minutes</p>
      <button onClick={onStart} className="exercise-start-btn">
        Let's move
      </button>
    </div>
  </div>
);

const BreathingExercise: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = ['Inhale', 'Hold', 'Exhale', 'Hold'];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev >= 7) {
          onComplete();
          return 0;
        }
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="message message-otis">
      <div className="breathing-card">
        <div className="breathing-circle" style={{
          animation: step % 4 === 0 || step % 4 === 2 ? 'breathe-in 4s' : 'breathe-out 4s'
        }}>
          {steps[step % 4]}
        </div>
        <p className="breath-count">Cycle {Math.floor(step / 4) + 1} of 2</p>
      </div>
    </div>
  );
};

const ReflectionOptions: React.FC<{ onSelect: (state: string) => void }> = ({ onSelect }) => (
  <div className="message message-otis">
    <div className="quick-replies">
      {EMOTIONAL_STATES.map((state) => (
        <button
          key={state.id}
          onClick={() => onSelect(state.id)}
          className="quick-reply-btn"
        >
          <span className="emoji">{state.emoji}</span>
        </button>
      ))}
    </div>
  </div>
);

// Main App
export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [stage, setStage] = useState<'onboarding' | 'greeting' | 'conversation'>('onboarding');
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [isExercising, setIsExercising] = useState(false);
  const [exerciseStep, setExerciseStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize
  useEffect(() => {
    const today = getTodayDate();
    const stored = loadMemory();

    if (stored && stored.profile) {
      setProfile(stored.profile);
      setMessages(stored.messages);
      setStage('greeting');
      
      // Greet returning user
      setTimeout(() => {
        addOtisMessage(`Morning, ${stored.profile.name}. Good to see you again. How are you doing today?`, 'text');
      }, 500);
    }
  }, []);

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Math.random().toString(),
      role: 'user',
      type: 'text',
      content,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, message]);
    setInputValue('');
  };

  const addOtisMessage = (content: string, type: Message['type'] = 'text', delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      const message: Message = {
        id: Math.random().toString(),
        role: 'otis',
        type,
        content,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, message]);
      setIsTyping(false);
    }, delay);
  };

  const handleNameSubmit = (name: string) => {
    if (!name.trim()) return;

    const newProfile: UserProfile = { name: name.trim() };
    setProfile(newProfile);
    addUserMessage(name);

    setTimeout(() => {
      addOtisMessage(`Nice to meet you, ${name}! I'm Otis, and I'm excited to get to know you.`);
      setStage('greeting');

      setTimeout(() => {
        addOtisMessage('How are you doing today?', 'emotional-state');
      }, 1500);
    }, 500);
  };

  const handleEmotionalState = (stateId: string) => {
    const state = EMOTIONAL_STATES.find((s) => s.id === stateId);
    if (!state) return;

    addUserMessage(`${state.emoji} ${state.label}`);

    setTimeout(() => {
      // Generate contextual follow-up
      const followUps: Record<string, string> = {
        energized: "That's great energy! What's making you feel so good today?",
        normal: "Good to hear. Anything on your mind right now?",
        low: "I hear you. What's making you feel low today?",
        stiff: "Let's help with that. Where are you feeling the stiffness most?",
        pain: "I'm listening. What's bothering you?"
      };

      addOtisMessage(followUps[stateId] || "Tell me more about how you're feeling.");
    }, 500);

    setStage('conversation');
  };

  const handleReflection = (stateId: string) => {
    const state = EMOTIONAL_STATES.find((s) => s.id === stateId);
    if (!state) return;

    addUserMessage(`${state.emoji}`);

    setTimeout(() => {
      addOtisMessage(
        `Thanks for spending a few minutes with me today. I'll check in tomorrow morning. And if your body needs something later, just come find me. I'm here.`,
        'text'
      );
    }, 500);
  };

  const handleExerciseStart = () => {
    if (!selectedMovement) return;
    setIsExercising(true);
    setExerciseStep(0);

    const movement = selectedMovement;
    
    const playNarration = (index: number) => {
      if (index >= movement.narration.length) {
        setIsExercising(false);
        setTimeout(() => {
          addOtisMessage('How do you feel now?', 'reflection');
        }, 500);
        return;
      }

      addOtisMessage(movement.narration[index], 'text', 1000);
      setTimeout(() => {
        playNarration(index + 1);
      }, 2500 + movement.narration[index].length * 20);
    };

    playNarration(0);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    addUserMessage(text);

    // Simple response logic
    setTimeout(() => {
      if (text.toLowerCase().includes('move') || text.toLowerCase().includes('exercise')) {
        const movements = Object.values(MOVEMENTS);
        const selected = movements[Math.floor(Math.random() * movements.length)];
        setSelectedMovement(selected);
        addOtisMessage(
          `Based on what you've shared, I think a ${selected.name.toLowerCase()} would be perfect right now. Ready?`,
          'exercise',
          1000
        );
      } else {
        addOtisMessage('I hear you. Would some gentle movement help?', 'text', 1000);
      }
    }, 500);
  };

  // Onboarding
  if (stage === 'onboarding') {
    return (
      <div className="app">
        <div className="chat-container">
          <div className="messages">
            <div className="message message-otis">
              <div className="message-bubble">
                Hi! I'm Otis. I'm excited to get to know you.
              </div>
            </div>
            <div className="message message-otis">
              <div className="message-bubble">
                Before we get started, what's your name?
              </div>
            </div>
          </div>

          <div className="input-section">
            <input
              type="text"
              placeholder="Your name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNameSubmit(e.currentTarget.value);
                }
              }}
              className="chat-input"
            />
          </div>
        </div>
      </div>
    );
  }

  // Main Chat
  return (
    <div className="app">
      <div className="chat-container">
        <div className="messages">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.type === 'text' && (
                <TextMessage role={msg.role} content={msg.content} />
              )}
              {msg.type === 'emotional-state' && msg.role === 'otis' && (
                <EmotionalStateOptions onSelect={handleEmotionalState} />
              )}
              {msg.type === 'exercise' && msg.role === 'otis' && selectedMovement && (
                <ExerciseCard movement={selectedMovement} onStart={handleExerciseStart} />
              )}
              {msg.type === 'reflection' && msg.role === 'otis' && (
                <ReflectionOptions onSelect={handleReflection} />
              )}
            </div>
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {stage === 'greeting' && profile && !isExercising && (
          <div className="input-section">
            <input
              type="text"
              placeholder="Tell me..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage(inputValue);
                }
              }}
              className="chat-input"
              autoFocus
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              className="send-btn"
              disabled={!inputValue.trim()}
            >
              Send
            </button>
          </div>
        )}

        {isExercising && selectedMovement && (
          <div className="exercise-info">
            <p>Follow along with Otis. Press "Done" when you're finished.</p>
            <button
              onClick={() => {
                setIsExercising(false);
                setTimeout(() => {
                  addOtisMessage('How do you feel now?', 'reflection');
                }, 500);
              }}
              className="done-btn"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
