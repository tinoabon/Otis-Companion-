import React, { useState, useEffect, useRef } from 'react';
import './App.css';

interface Message {
  id: string;
  role: 'user' | 'otis';
  content: string;
  type?: 'text' | 'movement-card' | 'chip-response';
  timestamp: Date;
}

interface ConversationMemory {
  date: string;
  userName: string;
  messages: Message[];
  lastMovement?: string;
  movedToday?: boolean;
}

const MOVEMENTS = {
  hips: {
    id: 'hips',
    name: 'Hip Opening',
    duration: 90,
    description: 'Wake up your hips. They've been compressed all day.'
  },
  neck: {
    id: 'neck',
    name: 'Neck Release',
    duration: 60,
    description: 'Release the tension from looking down.'
  },
  back: {
    id: 'back',
    name: 'Upper Back Release',
    duration: 120,
    description: 'Open your shoulders and chest.'
  },
  breathing: {
    id: 'breathing',
    name: 'Grounding Breath',
    duration: 180,
    description: 'Anchor yourself with your breath.'
  }
};

const generateOtisResponse = (userMessage: string): { response: string; shouldOfferMovement?: boolean } => {
  const lower = userMessage.toLowerCase();

  // Tired/low energy
  if (lower.includes('tired') || lower.includes('low') || lower.includes('exhausted')) {
    return {
      response: "I hear that. A little gentle movement might help wake you up.",
      shouldOfferMovement: true
    };
  }

  // Mentions pain/stiffness
  if (lower.includes('stiff') || lower.includes('sore') || lower.includes('tight') || lower.includes('pain')) {
    return {
      response: "Your body's asking for some attention. Let's move gently.",
      shouldOfferMovement: true
    };
  }

  // Energized/good
  if (lower.includes('good') || lower.includes('great') || lower.includes('energized')) {
    return {
      response: "That's wonderful. You're in a good place.",
      shouldOfferMovement: false
    };
  }

  // Asking for movement
  if (lower.includes('move') || lower.includes('stretch') || lower.includes('exercise') || lower.includes('help')) {
    return {
      response: "Let's do something together.",
      shouldOfferMovement: true
    };
  }

  // Default
  const defaults = [
    "Tell me more.",
    "I'm listening.",
    "What else?",
    "How does that feel?"
  ];

  return {
    response: defaults[Math.floor(Math.random() * defaults.length)],
    shouldOfferMovement: false
  };
};

const getGreeting = (name: string): string => {
  const greetings = [
    `Morning, ${name}.`,
    `Hey ${name}.`,
    `Good to see you, ${name}.`,
    `${name}.`
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
};

export default function App() {
  const [userName, setUserName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChips, setShowChips] = useState(false);
  const [pendingMovement, setPendingMovement] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`otis_${today}`);

    if (stored) {
      const memory = JSON.parse(stored);
      setUserName(memory.userName);
      setMessages(memory.messages);

      // Greet returning user
      setTimeout(() => {
        const greeting = getGreeting(memory.userName);
        addOtisMessage(`${greeting} How are you feeling after yesterday?`);
      }, 500);
    } else {
      // First time
      setTimeout(() => {
        addOtisMessage("Hi there. What should I call you?");
      }, 300);
    }
  }, []);

  const addMessage = (role: 'user' | 'otis', content: string, type: Message['type'] = 'text'): Message => {
    const message: Message = {
      id: Math.random().toString(),
      role,
      content,
      type,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, message]);
    return message;
  };

  const addOtisMessage = (content: string, type: Message['type'] = 'text', delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      addMessage('otis', content, type);
      setIsTyping(false);
    }, delay);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Getting name
    if (!userName) {
      const name = text.trim();
      setUserName(name);
      addMessage('user', name);

      setTimeout(() => {
        addOtisMessage(`Nice to meet you, ${name}. How are you feeling right now?`);
      }, 500);

      setInputValue('');
      return;
    }

    // Regular conversation
    addMessage('user', text);
    setInputValue('');

    // Generate response
    setTimeout(() => {
      const { response, shouldOfferMovement } = generateOtisResponse(text);
      addOtisMessage(response);

      if (shouldOfferMovement) {
        setTimeout(() => {
          setPendingMovement('hips');
          addOtisMessage(
            `I think your hips need some attention. Let's spend 90 seconds on this.`,
            'text',
            500
          );
          setShowChips(true);
        }, 1500);
      }
    }, 800);

    // Save memory
    const today = new Date().toISOString().split('T')[0];
    const memory: ConversationMemory = {
      date: today,
      userName: userName || '',
      messages
    };
    localStorage.setItem(`otis_${today}`, JSON.stringify(memory));
  };

  const handleChipClick = (chip: string) => {
    addMessage('user', chip, 'chip-response');
    setShowChips(false);
    setInputValue('');

    if (chip === 'Let\'s go') {
      setTimeout(() => {
        addMessage('otis', `
I'll guide you through this gently.

Stand or sit however feels comfortable. We'll make slow circles with your hips. Nothing forced—just moving with awareness.

Ready when you are.
        `, 'movement-card');
      }, 500);
    } else if (chip === 'Not today') {
      setTimeout(() => {
        addOtisMessage('That's okay. Anytime you want to move, I'm here.');
      }, 500);
    } else if (chip === 'Tell me more') {
      setTimeout(() => {
        addOtisMessage('Your hips probably feel tight from sitting. We can spend just 90 seconds waking them up.');
      }, 500);
    }
  };

  return (
    <div className="app">
      <div className="chat">
        {/* Header */}
        <div className="header">
          <div className="header-name">{userName || 'Otis'}</div>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper message-${msg.role}`}>
              <div className={`message bubble`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-wrapper message-otis">
              <div className="message bubble typing-bubble">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}

          {showChips && (
            <div className="chips-container">
              <button className="chip" onClick={() => handleChipClick("Let's go")}>
                Let's go
              </button>
              <button className="chip" onClick={() => handleChipClick('Tell me more')}>
                Tell me more
              </button>
              <button className="chip" onClick={() => handleChipClick('Not today')}>
                Not today
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(inputValue);
              }
            }}
            placeholder={userName ? "Tell me..." : "What's your name?"}
            autoFocus
            className="input"
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim()}
            className="send-btn"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
