import React, { useState, useEffect } from 'react';
import './App.css';

// Types
interface UserProfile {
  name: string;
}

interface DailyMemory {
  date: string;
  greeting: string;
  howTheyFelt: string;
  userNotes?: string;
  followUpQuestion?: string;
  followUpAnswer?: string;
  movementRecommendation: string;
  beforeMovement: string;
  afterMovement: string;
  completionNote?: string;
}

interface Memory {
  profile: UserProfile | null;
  history: DailyMemory[];
}

interface Movement {
  id: string;
  name: string;
  duration: number;
  narration: string[]; // Each narration step
  cues: string[];
}

// Movement Library (Small, Intentional)
const MOVEMENTS: Record<string, Movement> = {
  upper_back: {
    id: 'upper_back',
    name: 'Upper Back Release',
    duration: 5,
    narration: [
      "Let's start with your upper back.",
      "Stand or sit tall. Feel your shoulders for a moment.",
      "Now gently roll them back. Once, twice, three times.",
      "Let them drop. Feel the difference?",
      "Good. Now clasp your hands behind you, if that works.",
      "Gently press down and open your chest.",
      "Breathe here. You're waking up the muscles that got tight.",
      "Beautiful. That's the foundation."
    ],
    cues: [
      'Stand or sit comfortably',
      'Gentle shoulder rolls, moving slowly',
      'Feel your upper back as you move',
      'No forcing—just noticing'
    ]
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
    cues: [
      'Slow hip circles, both directions',
      'Feel your lower back release',
      'Move from your center'
    ]
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
    cues: [
      'Slow, controlled head turns',
      'No forcing or bouncing',
      'Breathe deeply as you move'
    ]
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
    cues: [
      'Slow, counted breathing',
      '4-4-4-4 pattern',
      'Feel your whole body calm'
    ]
  },

  walk_present: {
    id: 'walk_present',
    name: 'Mindful Movement',
    duration: 5,
    narration: [
      "Let's finish with some easy movement.",
      "Stand up. Shake out your hands.",
      "Now walk slowly around your space.",
      "Pay attention to how your feet meet the ground.",
      "Swing your arms naturally.",
      "You're not exercising. You're just moving with awareness.",
      "Feel the difference between moving on autopilot and moving with intention?",
      "That's what we're building together."
    ],
    cues: [
      'Slow, mindful walking',
      'Feel your feet, your arms, your breath',
      'No rush'
    ]
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
    cues: [
      'Gentle, full-body movement',
      'Wake up without forcing',
      'Notice how your body responds'
    ]
  }
};

// Emotional States
const EMOTIONAL_STATES = [
  { id: 'energized', emoji: '😊', label: 'Ready to move', color: '#10b981' },
  { id: 'normal', emoji: '😌', label: 'Pretty good', color: '#6b7280' },
  { id: 'low', emoji: '😴', label: 'Low energy', color: '#f59e0b' },
  { id: 'stiff', emoji: '😬', label: 'Stiff', color: '#f97316' },
  { id: 'pain', emoji: '🤕', label: "Something's bothering me", color: '#ef4444' }
];

// Storage
const loadMemory = (): Memory => {
  const stored = localStorage.getItem('otis_memory_v2');
  if (stored) return JSON.parse(stored);
  return { profile: null, history: [] };
};

const saveMemory = (memory: Memory) => {
  localStorage.setItem('otis_memory_v2', JSON.stringify(memory));
};

const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getYesterdayDate = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

// Greeting Generator
const generateGreeting = (name: string, memory: DailyMemory | undefined): string => {
  if (!memory) {
    return `Morning, ${name}. Good to see you.`;
  }

  // Reference yesterday's experience naturally
  const hints = [
    `Yesterday you said you felt ${memory.howTheyFelt}. How's today looking?`,
    `You mentioned your ${memory.movementRecommendation.toLowerCase()} yesterday. That still on your mind today?`,
    `Yesterday you completed a session. Ready to do it again?`,
    `Good morning. Ready for another conversation?`
  ];

  return `Morning, ${name}. ${hints[Math.floor(Math.random() * hints.length)]}`;
};

// Components
const Onboarding: React.FC<{ onComplete: (profile: UserProfile) => void }> = ({ onComplete }) => {
  const [name, setName] = useState('');

  const handleStart = () => {
    if (name.trim()) {
      onComplete({ name: name.trim() });
    }
  };

  return (
    <div className="screen greeting-screen">
      <div className="conversation-box">
        <p className="otis-message">
          Hi! I'm Otis. I'm excited to get to know you.
        </p>
        <p className="otis-message">
          Before we get started, what's your name?
        </p>
      </div>

      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleStart();
        }}
        autoFocus
        className="name-input"
      />

      <button onClick={handleStart} className="btn-primary" disabled={!name.trim()}>
        Let's Begin
      </button>
    </div>
  );
};

const Greeting: React.FC<{
  name: string;
  yesterday: DailyMemory | undefined;
  onNext: () => void;
}> = ({ name, yesterday, onNext }) => {
  const greeting = generateGreeting(name, yesterday);

  return (
    <div className="screen greeting-screen">
      <div className="conversation-box">
        <p className="otis-message">{greeting}</p>
      </div>

      <button onClick={onNext} className="btn-primary">
        Continue
      </button>
    </div>
  );
};

const HowAreYou: React.FC<{
  onStateSelect: (state: string, label: string) => void;
}> = ({ onStateSelect }) => {
  const [showText, setShowText] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [freeText, setFreeText] = useState('');

  const handleStateClick = (id: string, label: string) => {
    setSelectedState(id);
    setShowText(true);
  };

  const handleSubmit = () => {
    const state = EMOTIONAL_STATES.find(s => s.id === selectedState);
    if (state) {
      // Combine the emotional state with free text
      const fullResponse = freeText ? `${state.label} - ${freeText}` : state.label;
      onStateSelect(state.id, fullResponse);
    }
  };

  return (
    <div className="screen conversation-screen">
      <div className="conversation-box">
        <p className="otis-message">How are you doing today?</p>
      </div>

      <div className="emotional-buttons">
        {EMOTIONAL_STATES.map((state) => (
          <button
            key={state.id}
            onClick={() => handleStateClick(state.id, state.label)}
            className={`emotional-btn ${selectedState === state.id ? 'active' : ''}`}
            style={selectedState === state.id ? { borderColor: state.color, backgroundColor: `${state.color}15` } : {}}
          >
            <span className="emoji">{state.emoji}</span>
            <span className="label">{state.label}</span>
          </button>
        ))}
      </div>

      {showText && selectedState && (
        <div className="text-input-section">
          <input
            type="text"
            placeholder="Anything else you want to tell me? (optional)"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            autoFocus
          />
          <button onClick={handleSubmit} className="btn-primary">
            Tell me more
          </button>
        </div>
      )}
    </div>
  );
};

const FollowUp: React.FC<{
  state: string;
  onResponse: (response: string) => void;
}> = ({ state, onResponse }) => {
  const [text, setText] = useState('');

  const emotionalState = EMOTIONAL_STATES.find(s => s.id === state);
  const stateLabel = emotionalState?.label || state;

  // Generate contextual follow-up based on emotional state
  const getFollowUpQuestion = () => {
    switch (state) {
      case 'energized':
        return "What are you doing today that has you energized?";
      case 'normal':
        return "Anything on your mind right now?";
      case 'low':
        return "What's making you feel low today?";
      case 'stiff':
        return "Where in your body are you feeling stiff?";
      case 'pain':
        return "What's bothering you?";
      default:
        return "Tell me more about how you're feeling.";
    }
  };

  const handleSkip = () => {
    onResponse('');
  };

  const handleSubmit = () => {
    onResponse(text);
  };

  return (
    <div className="screen conversation-screen">
      <div className="conversation-box">
        <p className="otis-message">{getFollowUpQuestion()}</p>
      </div>

      <input
        type="text"
        placeholder="Tell me..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
        }}
        autoFocus
        className="wide-input"
      />

      <div className="button-group">
        <button onClick={handleSubmit} className="btn-primary">
          Continue
        </button>
        <button onClick={handleSkip} className="btn-secondary">
          Skip
        </button>
      </div>
    </div>
  );
};

const RecommendationScreen: React.FC<{
  name: string;
  understanding: string;
  recommendation: string;
  movement: Movement;
  onStart: () => void;
}> = ({ name, understanding, recommendation, movement, onStart }) => {
  return (
    <div className="screen conversation-screen">
      <div className="conversation-box">
        <p className="otis-message">
          {recommendation}
        </p>
        <p className="otis-message" style={{ marginTop: '1rem', fontSize: '0.95rem', opacity: 0.8 }}>
          We'll do this together. About {movement.duration} minutes.
        </p>
      </div>

      <button onClick={onStart} className="btn-primary">
        Let's move
      </button>
    </div>
  );
};

const MovementSession: React.FC<{
  movement: Movement;
  onComplete: () => void;
}> = ({ movement, onComplete }) => {
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [isMoving, setIsMoving] = useState(false);

  const currentNarration = movement.narration[narrationIndex];
  const isComplete = narrationIndex >= movement.narration.length;

  const handleNext = () => {
    if (!isComplete) {
      setNarrationIndex(narrationIndex + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="screen movement-screen">
      <div className="movement-header">
        <p className="step-indicator">
          {narrationIndex + 1} of {movement.narration.length}
        </p>
        <h2>{movement.name}</h2>
      </div>

      <div className="narration-box">
        <p className="narration-text">{currentNarration}</p>
      </div>

      <div className="cues-box">
        {movement.cues.map((cue, i) => (
          <p key={i} className="cue">• {cue}</p>
        ))}
      </div>

      <button
        onClick={handleNext}
        className="btn-primary"
      >
        {isComplete ? "Finished" : "Continue"}
      </button>
    </div>
  );
};

const HowNow: React.FC<{
  onReflection: (state: string, notes: string) => void;
}> = ({ onReflection }) => {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const handleStateClick = (id: string) => {
    setSelectedState(id);
    setShowNotes(true);
  };

  const handleSubmit = () => {
    if (selectedState) {
      onReflection(selectedState, notes);
    }
  };

  return (
    <div className="screen conversation-screen">
      <div className="conversation-box">
        <p className="otis-message">How do you feel now?</p>
      </div>

      <div className="emotional-buttons">
        {EMOTIONAL_STATES.map((state) => (
          <button
            key={state.id}
            onClick={() => handleStateClick(state.id)}
            className={`emotional-btn ${selectedState === state.id ? 'active' : ''}`}
            style={selectedState === state.id ? { borderColor: state.color, backgroundColor: `${state.color}15` } : {}}
          >
            <span className="emoji">{state.emoji}</span>
            <span className="label">{state.label}</span>
          </button>
        ))}
      </div>

      {showNotes && selectedState && (
        <div className="text-input-section">
          <input
            type="text"
            placeholder="Anything you noticed? (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            autoFocus
          />
          <button onClick={handleSubmit} className="btn-primary">
            Done
          </button>
        </div>
      )}
    </div>
  );
};

const ClosingMessage: React.FC<{
  name: string;
  onReset: () => void;
}> = ({ name, onReset }) => {
  return (
    <div className="screen closing-screen">
      <div className="conversation-box">
        <p className="otis-message">
          Thanks for spending a few minutes with me today.
        </p>
        <p className="otis-message">
          I'll check in tomorrow morning.
        </p>
        <p className="otis-message" style={{ fontSize: '0.95rem', opacity: 0.7, marginTop: '1.5rem' }}>
          And if your neck tightens up, or your back gets sore, or you just want to chat—come find me. I'm here.
        </p>
      </div>

      <button onClick={onReset} className="btn-secondary" style={{ marginTop: '2rem' }}>
        See you tomorrow
      </button>
    </div>
  );
};

// Main App
export default function App() {
  const [memory, setMemory] = useState<Memory>(loadMemory());
  const [flow, setFlow] = useState<string>(memory.profile ? 'greeting' : 'onboarding');
  const [emotionalState, setEmotionalState] = useState<string>('');
  const [followUpResponse, setFollowUpResponse] = useState<string>('');
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [reflectionState, setReflectionState] = useState<string>('');
  const [reflectionNotes, setReflectionNotes] = useState<string>('');

  const today = getTodayDate();
  const yesterday = getYesterdayDate();
  const yesterdayMemory = memory.history.find(h => h.date === yesterday);
  const alreadyCompletedToday = memory.history.find(h => h.date === today);

  // Recommendation logic
  const generateRecommendation = (
    state: string,
    followUp: string
  ): { recommendation: string; movement: Movement } => {
    // Select movement based on emotional state and follow-up context
    let selectedId = 'morning_flow';

    if (state === 'pain') {
      selectedId = 'breathing'; // Start gentle
    } else if (state === 'stiff') {
      selectedId = followUp.toLowerCase().includes('neck') ? 'neck_gentle' : 'upper_back';
    } else if (state === 'low') {
      selectedId = 'morning_flow'; // Wake up gently
    } else if (state === 'energized') {
      selectedId = 'morning_flow'; // Full body
    } else {
      selectedId = 'hips_opening'; // Neutral
    }

    const movement = MOVEMENTS[selectedId] || MOVEMENTS['morning_flow'];
    
    const recommendations: Record<string, string> = {
      upper_back: "Based on what you've shared, I think your upper back could use some attention today. Let's open that up together.",
      hips_opening: "Let's start with your hips—they probably need some love after being sat on all day.",
      neck_gentle: "Your neck is asking for attention. Let's be gentle with it.",
      breathing: "Let's start simple. Just breathe together for a minute, then we'll move.",
      walk_present: "Let's get you moving mindfully. Nothing intense—just awareness.",
      morning_flow: "Let's do a gentle wake-up. Get your whole body moving together."
    };

    const recommendation = recommendations[movement.id] || recommendations['morning_flow'];

    return { recommendation, movement };
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    const newMemory = { ...memory, profile };
    setMemory(newMemory);
    saveMemory(newMemory);
    setFlow('greeting');
  };

  const handleGreetingNext = () => {
    setFlow('howareyou');
  };

  const handleStateSelect = (state: string, label: string) => {
    setEmotionalState(state);
    setFlow('followup');
  };

  const handleFollowUpResponse = (response: string) => {
    setFollowUpResponse(response);
    
    const { recommendation, movement } = generateRecommendation(emotionalState, response);
    setSelectedMovement(movement);
    
    setFlow('recommendation');
  };

  const handleMovementStart = () => {
    setFlow('movement');
  };

  const handleMovementComplete = () => {
    setFlow('hownow');
  };

  const handleReflectionSubmit = (state: string, notes: string) => {
    setReflectionState(state);
    setReflectionNotes(notes);

    // Save to memory
    const dailyEntry: DailyMemory = {
      date: today,
      greeting: generateGreeting(memory.profile?.name || 'Friend', yesterdayMemory),
      howTheyFelt: emotionalState,
      userNotes: followUpResponse,
      followUpAnswer: followUpResponse,
      movementRecommendation: selectedMovement?.name || 'Movement',
      beforeMovement: emotionalState,
      afterMovement: state,
      completionNote: notes
    };

    const newHistory = [...memory.history, dailyEntry];
    const newMemory = { ...memory, history: newHistory };
    setMemory(newMemory);
    saveMemory(newMemory);

    setFlow('closing');
  };

  const handleReset = () => {
    // Reset for next day
    setEmotionalState('');
    setFollowUpResponse('');
    setSelectedMovement(null);
    setReflectionState('');
    setReflectionNotes('');
    setFlow('greeting');
  };

  // Prevent re-running if already completed today
  if (alreadyCompletedToday && flow === 'greeting') {
    return (
      <div className="screen conversation-screen">
        <div className="conversation-box">
          <p className="otis-message">
            You already showed up today. Great work.
          </p>
          <p className="otis-message" style={{ marginTop: '1rem', fontSize: '0.95rem', opacity: 0.7 }}>
            I'll see you tomorrow morning.
          </p>
        </div>
        <button onClick={() => setFlow('closing')} className="btn-secondary">
          See you tomorrow
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      {flow === 'onboarding' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {flow === 'greeting' && memory.profile && (
        <Greeting
          name={memory.profile.name}
          yesterday={yesterdayMemory}
          onNext={handleGreetingNext}
        />
      )}

      {flow === 'howareyou' && (
        <HowAreYou onStateSelect={handleStateSelect} />
      )}

      {flow === 'followup' && (
        <FollowUp state={emotionalState} onResponse={handleFollowUpResponse} />
      )}

      {flow === 'recommendation' && selectedMovement && (
        <RecommendationScreen
          name={memory.profile?.name || 'Friend'}
          understanding={followUpResponse}
          recommendation={generateRecommendation(emotionalState, followUpResponse).recommendation}
          movement={selectedMovement}
          onStart={handleMovementStart}
        />
      )}

      {flow === 'movement' && selectedMovement && (
        <MovementSession
          movement={selectedMovement}
          onComplete={handleMovementComplete}
        />
      )}

      {flow === 'hownow' && (
        <HowNow onReflection={handleReflectionSubmit} />
      )}

      {flow === 'closing' && memory.profile && (
        <ClosingMessage
          name={memory.profile.name}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
