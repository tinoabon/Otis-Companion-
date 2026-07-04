import React, { useState, useEffect, useRef } from "react";
import "../App.css";

interface Message {
    id: string;
    role: "user" | "otis";
    content: string;
    type: "text" | "exercise-card" | "reflection";
    timestamp: Date;
}

interface DailyMemory {
    date: string;
    userName: string;
    messages: Message[];
    movedToday?: boolean;
}

interface Movement {
    id: string;
    name: string;
    duration: number;
    description: string;
    narrative: string[];
}

class OtisEngine {
    generateResponse(userMessage: string, conversationHistory: Message[]): string {
          const lower = userMessage.toLowerCase();
          if (conversationHistory.length === 1) {
                  return `Nice to meet you, ${userMessage.trim()}. What brings you by today?`;
          }
          const mentionsBody = ["neck","back","hips","shoulders","sore","stiff","tight"].some((k) => lower.includes(k));
          const mentionsWork = ["work","clinic","patients","busy","day"].some((k) => lower.includes(k));
          const isLowEnergy = ["tired","exhausted","drained","low","rough"].some((k) => lower.includes(k));
          const isGood = ["great","good","energized","excellent"].some((k) => lower.includes(k));
          if (mentionsBody) {
                  const responses = [
                            "Yeah. That sounds like it needs attention.",
                            "Makes sense. When did that start?",
                            "I hear you. How is that affecting your day?"
                          ];
                  return responses[Math.floor(Math.random() * responses.length)];
          }
          if (mentionsWork) {
                  const responses = [
                            "That is a lot.",
                            "No wonder. Your back surviving?",
                            "Sounds intense. How are you holding up?"
                          ];
                  return responses[Math.floor(Math.random() * responses.length)];
          }
          if (isLowEnergy) {
                  return "Rest is good. Your body might appreciate some gentle movement though.";
          }
          if (isGood) {
                  const responses = ["Love hearing that.", "That is great.", "Good."];
                  return responses[Math.floor(Math.random() * responses.length)];
          }
          const defaults = ["Tell me more.", "I am listening.", "Yeah?"];
          return defaults[Math.floor(Math.random() * defaults.length)];
    }

  shouldRecommendMovement(userMessage: string, conversationHistory: Message[]): boolean {
        const lower = userMessage.toLowerCase();
        const mentionsBody = ["neck","back","hips","tight","sore"].some((k) => lower.includes(k));
        return mentionsBody && conversationHistory.length > 5;
  }

  getMovementMessage(userMessage: string): string {
        const lower = userMessage.toLowerCase();
        if (lower.includes("hip") || lower.includes("sitting"))
                return "Your hips have been sitting all day. Want to open them up for a minute?";
        if (lower.includes("neck"))
                return "Your neck sounds like it is asking for a break. Want to loosen things up?";
        if (lower.includes("back"))
                return "Your back could probably use some love. Want to spend a couple minutes together?";
        return "I think your body is ready to move. Want to do something together?";
  }
}

const MOVEMENTS: Record<string, Movement> = {
    hip_opener: {
          id: "hip_opener",
          name: "Hip Opening",
          duration: 90,
          description: "Wake up your hips.",
          narrative: [
                  "Stand or sit comfortably.",
                  "We will make slow circles with your hips.",
                  "Move from your hips, not your torso.",
                  "Go slow. No rush.",
                  "Feel where they want to open.",
                  "Nice."
                ]
    },
    neck_release: {
          id: "neck_release",
          name: "Neck Release",
          duration: 60,
          description: "Release tension.",
          narrative: [
                  "Sit comfortably with your spine tall.",
                  "Slowly drop your right ear toward your right shoulder.",
                  "Feel the stretch on the left side.",
                  "Breathe here for a few breaths.",
                  "Now the other side.",
                  "Simple."
                ]
    },
    upper_back_release: {
          id: "upper_back_release",
          name: "Upper Back Release",
          duration: 120,
          description: "Open your shoulders and chest.",
          narrative: [
                  "Stand with feet shoulder width apart.",
                  "Interlace your hands behind your back.",
                  "Straighten your arms and lift your chest.",
                  "Feel your shoulder blades draw together.",
                  "This opens everything your desk closed.",
                  "Hold here. Breathe."
                ]
    }
};

class Storage {
    static saveDailyMemory(memory: DailyMemory): void {
          const key = `otis_daily_${memory.date}`;
          localStorage.setItem(key, JSON.stringify(memory));
    }

  static loadDailyMemory(date: string): DailyMemory | null {
        const key = `otis_daily_${date}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
  }

  static getToday(): string {
        return new Date().toISOString().split("T")[0];
  }
}

const TypingIndicator: React.FC = () => (
    <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
    </div>
  );

interface MessageBubbleProps {
    message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => (
    <div className={`message message-${message.role}`}>
        <div className="bubble">{message.content}</div>
    </div>
  );

interface ExerciseCardProps {
    movement: Movement;
    onStart: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ movement, onStart }) => (
    <div className="exercise-card">
        <div className="exercise-header">
              <h3>{movement.name}</h3>
              <p className="exercise-duration">{movement.duration}s</p>
        </div>
        <p className="exercise-description">{movement.description}</p>
        <button className="exercise-button" onClick={onStart}>
              Start
        </button>
    </div>
  );

export default function App() {
    const [userName, setUserName] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showExercise, setShowExercise] = useState<Movement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const otisEngine = useRef(new OtisEngine());
  
    const scrollToBottom = () => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
  
    useEffect(() => {
          scrollToBottom();
    }, [messages, isTyping]);
  
    useEffect(() => {
          const today = Storage.getToday();
          const stored = Storage.loadDailyMemory(today);
          if (stored) {
                  setUserName(stored.userName);
                  setMessages(
                            stored.messages.map((m) => ({
                                        ...m,
                                        timestamp: new Date(m.timestamp)
                            }))
                          );
                  setTimeout(() => {
                            const greetings = [
                                        "Morning. How are you?",
                                        "Good to see you again. How are things?",
                                        "Hey. What is going on?"
                                      ];
                            const greeting = greetings[Math.floor(Math.random() * greetings.length)];
                            addOtisMessage(greeting);
                  }, 500);
          } else {
                  setTimeout(() => {
                            addOtisMessage("Hi there. What should I call you?");
                  }, 300);
          }
    }, []);
  
    const addMessage = (
          role: "user" | "otis",
          content: string,
          type: "text" | "exercise-card" = "text"
        ) => {
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
  
    const addOtisMessage = (content: string, delay = 1000) => {
          setIsTyping(true);
          setTimeout(() => {
                  addMessage("otis", content);
                  setIsTyping(false);
          }, delay);
    };
  
    const handleSendMessage = () => {
          if (!inputValue.trim()) return;
          const text = inputValue.trim();
          setInputValue("");
          if (!userName) {
                  setUserName(text);
                  addMessage("user", text);
                  setTimeout(() => {
                            addOtisMessage(
                                        `Nice to meet you, ${text}. What is going on today?`,
                                        800
                                      );
                  }, 300);
                  const today = Storage.getToday();
                  Storage.saveDailyMemory({
                            date: today,
                            userName: text,
                            messages: [
                              {
                                            id: Math.random().toString(),
                                            role: "user",
                                            content: text,
                                            type: "text",
                                            timestamp: new Date()
                              }
                                      ]
                  });
                  return;
          }
          addMessage("user", text);
          setTimeout(() => {
                  const response = otisEngine.current.generateResponse(text, messages);
                  addOtisMessage(response, 800);
                  if (otisEngine.current.shouldRecommendMovement(text, messages)) {
                            setTimeout(() => {
                                        const movementMessage = otisEngine.current.getMovementMessage(text);
                                        addOtisMessage(movementMessage, 800);
                                        setTimeout(() => {
                                                      const movements = Object.values(MOVEMENTS);
                                                      const suggested = movements[Math.floor(Math.random() * movements.length)];
                                                      setShowExercise(suggested);
                                        }, 1500);
                            }, 1200);
                  }
          }, 500);
          const today = Storage.getToday();
          const memory = Storage.loadDailyMemory(today);
          if (memory && userName) {
                  memory.messages.push({
                            id: Math.random().toString(),
                            role: "user",
                            content: text,
                            type: "text",
                            timestamp: new Date()
                  });
                  Storage.saveDailyMemory(memory);
          }
    };
  
    return (
          <div className="app">
                <div className="chat-container">
                        <div className="header">
                                  <h1 className="header-title">{userName || "Otis"}</h1>
                        </div>
                        <div className="messages-container">
                          {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                      ))}
                          {isTyping && (
                        <div className="message message-otis">
                                      <TypingIndicator />
                        </div>
                                  )}
                          {showExercise && (
                        <div className="exercise-container">
                                      <div className="message message-otis">
                                                      <div className="bubble">
                                                                        Ready when you are. Do the movement at your own pace.
                                                      </div>
                                      </div>
                                      <ExerciseCard
                                                        movement={showExercise}
                                                        onStart={() => {
                                                                            setShowExercise(null);
                                                                            addMessage("user", "Starting now");
                                                                            setTimeout(() => {
                                                                                                  addOtisMessage(
                                                                                                                          "How did that feel?",
                                                                                                                          800
                                                                                                                        );
                                                                            }, 2000);
                                                        }}
                                                      />
                        </div>
                                  )}
                                  <div ref={messagesEndRef} />
                        </div>
                        <div className="input-container">
                                  <input
                                                type="text"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                                  handleSendMessage();
                                                                }
                                                }}
                                                placeholder={userName ? "Tell me..." : "Your name?"}
                                                className="input"
                                                autoFocus
                                              />
                                  <button
                                                onClick={handleSendMessage}
                                                disabled={!inputValue.trim()}
                                                className="send-button"
                                              >
                                              →
                                  </button>
                        </div>
                </div>
          </div>
        );
}
