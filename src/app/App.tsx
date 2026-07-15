import React, { useState, useEffect, useRef } from "react";
import "../App.css";
import { IntentDetector } from "../conversation/IntentDetector";

import { RelationshipTracker } from "../conversation/RelationshipTracker";

import { MemoryManager } from "../conversation/MemoryManager";

import { ClaudeService } from "../services/ClaudeService";
import { ReminderService } from "../services/ReminderService";
import { NotificationService } from "../services/NotificationService";
import { ReminderType, ReminderFrequency } from "../types/reminders";
import { ReminderSettings } from "./ReminderSettings";
import { getMovementsForRegion } from "../movement/MovementLibrary";

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

// Initialize services
const intentDetector = new IntentDetector();
const relationshipTracker = new RelationshipTracker();
const memoryManager = new MemoryManager();
const claudeService = new ClaudeService();
const reminderService = new ReminderService();

export const MOVEMENTS: Record<string, Movement> = {
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

// Stable, name-independent key so we can restore the user's profile on startup without asking their name again
const CURRENT_USER_KEY = "otis_current_user";

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
    const [userContext, setUserContext] = useState<any>(null);
    const [showSettings, setShowSettings] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
  
    const scrollToBottom = () => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
  
    useEffect(() => {
          scrollToBottom();
    }, [messages, isTyping]);
  
    useEffect(() => {
          const today = Storage.getToday();
          const stored = Storage.loadDailyMemory(today);
            const savedUserName = localStorage.getItem(CURRENT_USER_KEY);
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
          } else if (savedUserName) {
              setUserName(savedUserName);
              const restoredContext = memoryManager.loadUserContext(savedUserName, null);
              restoredContext.relationshipStage = relationshipTracker.calculateStage(
                  restoredContext.conversationCount,
                  restoredContext.daysKnown
                  );
              memoryManager.saveUserContext(restoredContext);
              setUserContext(restoredContext);
              
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

        // Check for due reminders every minute
        useEffect(() => {
            if (!userName) return;

const checkReminders = () => {
                const dueReminders = reminderService.getDueReminders(userName);

dueReminders.forEach((reminder) => {
    const pendingKey = `otis_pending_reminder_${userName}`;
    const existingPendingId = localStorage.getItem(pendingKey);
    if (existingPendingId && existingPendingId !== reminder.id) {
        reminderService.skipReminder(existingPendingId);
        reminderService.recordOutcome(userName, "skipped");
    }

    addOtisMessage(reminder.message, 500);

    if (document.hidden) {
        NotificationService.sendReminderNotification(reminder.message);
    }

    localStorage.setItem(pendingKey, reminder.id);
});
                                // Natural check-in if the user has been away for a while
                const lastActivityRaw = localStorage.getItem(`otis_last_activity_${userName}`);
                if (lastActivityRaw) {
                    const now = new Date();
                    const hour = now.getHours();
                    const isNightHours = hour >= 21 || hour < 4;
                    const hoursSinceActivity = (now.getTime() - new Date(lastActivityRaw).getTime()) / (1000 * 60 * 60);
                
                    const today = Storage.getToday();
                    const countKey = `otis_checkin_count_${userName}_${today}`;
                    const lastCheckInKey = `otis_last_auto_checkin_${userName}`;
                    const checkInsToday = parseInt(localStorage.getItem(countKey) || "0", 10);
                    const lastCheckInRaw = localStorage.getItem(lastCheckInKey);
                    const hoursSinceLastCheckIn = lastCheckInRaw
                        ? (now.getTime() - new Date(lastCheckInRaw).getTime()) / (1000 * 60 * 60)
                        : Infinity;
                
                    if (!isNightHours && hoursSinceActivity >= 4 && checkInsToday < 2 && hoursSinceLastCheckIn >= 3) {
                        const checkIns = [
                            "Hey, it's been a bit. How's your day going?",
                            "Just checking in. Everything good?",
                            "Thinking of you. How are you feeling?"
                        ];
                        const checkInMessage = checkIns[Math.floor(Math.random() * checkIns.length)];
                
                        addOtisMessage(checkInMessage, 500);
                
                        if (document.hidden) {
                            NotificationService.sendReminderNotification(checkInMessage);
                        }
                
                        localStorage.setItem(countKey, String(checkInsToday + 1));
                        localStorage.setItem(lastCheckInKey, now.toISOString());
                    }
                }
            };

            checkReminders();
            const interval = setInterval(checkReminders, 60000);

            return () => clearInterval(interval);
        }, [userName]);

        // Request notification permission on first load
        useEffect(() => {
            NotificationService.requestPermission();
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
  
    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const text = inputValue.trim();
        setInputValue("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";

        // Getting name
        if (!userName) {
            setUserName(text);
            localStorage.setItem(CURRENT_USER_KEY, text);
            addMessage("user", text);
            localStorage.setItem(`otis_last_activity_${text}`, new Date().toISOString());

            const newContext = memoryManager.loadUserContext(text, null);
            newContext.relationshipStage = relationshipTracker.calculateStage(newContext.conversationCount, 0);
            memoryManager.saveUserContext(newContext);
            setUserContext(newContext);

            setTimeout(() => {
                addOtisMessage(`Nice to meet you, ${text}. What brings you by today?`, 800);
            }, 300);

            // Auto-setup reminders for new users
            reminderService.autoScheduleReminders(text);
            return;
        }

        if (!userContext) return;

        // Regular conversation
        addMessage("user", text);
        localStorage.setItem(`otis_last_activity_${userName}`, new Date().toISOString());

        // Detect intent
        const intent = intentDetector.detect(text, messages);

        // Resolve any pending reminder based on this reply
        const pendingKey = `otis_pending_reminder_${userName}`;
        const pendingId = localStorage.getItem(pendingKey);
        let reminderUpdate: { status: "completed" | "skipped"; message: string; streak?: number } | null = null;
        if (pendingId) {
            const pending = reminderService.getReminders(userName).find((r) => r.id === pendingId);
            if (pending && !pending.completed && !pending.skipped) {
                const lower = text.toLowerCase();
                const doneWords = ["done", "did it", "finished", "yep", "yup", "just did", "already did"];
                const skipWords = ["not yet", "later", "busy", "skip", "can't", "cant", "didn't", "didnt", "no"];
                if (doneWords.some((w) => lower.includes(w))) {
                    reminderService.completeReminder(pending.id);
                    reminderService.recordOutcome(userName, "completed");
                    const streak = reminderService.getStreak(userName);
                    reminderUpdate = { status: "completed", message: pending.message, streak: streak.currentStreak };
                    localStorage.removeItem(pendingKey);
                } else if (skipWords.some((w) => lower.includes(w))) {
                    reminderService.skipReminder(pending.id);
                    reminderService.recordOutcome(userName, "skipped");
                    reminderUpdate = { status: "skipped", message: pending.message };
                    localStorage.removeItem(pendingKey);
                }
            }
        }

        // Proactively schedule a one-off movement reminder if the user mentions a sore/tight body part
        if (intent.mentionsBody && intent.entities.length > 0) {
            const regionMap: Record<string, string> = { neck: "neck", back: "back", hips: "hips" };
            const region = intent.entities.map((e) => regionMap[e]).find((r) => r);
            if (region) {
                const suggestion = getMovementsForRegion(region)[0];
                if (suggestion) {
                    const followUp = new Date();
                    followUp.setHours(followUp.getHours() + 2);
                    reminderService.createReminder(
                        userName,
                        ReminderType.BodyAwareness,
                        `Earlier you mentioned your ${region}. Want to try "${suggestion.name}" - ${suggestion.description}`,
                        followUp,
                        ReminderFrequency.Once,
                        { bodyRegion: region }
                        );
                }
            }
        }

        // Update user context with new information
        let updatedContext = memoryManager.updateMemoryFromConversation(userContext, text);
        updatedContext.relationshipStage = relationshipTracker.calculateStage(
            updatedContext.conversationCount,
            updatedContext.daysKnown
        );
        setUserContext(updatedContext);
        memoryManager.saveUserContext(updatedContext);

        // Build conversation history for Claude
        const conversationHistory = messages.map((msg) => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content
        }));

        // Call Claude to generate response
        setTimeout(async () => {
            setIsTyping(true);
            const response = await claudeService.generateResponse(
                text,
                updatedContext,
                intent,
                conversationHistory,
                reminderUpdate
            );
            addMessage("otis", response);
            setIsTyping(false);
        }, 500);
    };
  
    return (
          <div className="app">
                <div className="chat-container">
                        <div className="header">
                                  <h1 className="header-title">{userName || "Otis"}</h1>
                            {userName && (
              <button className="settings-button" onClick={() => setShowSettings(true)}>Settings</button>
              )}
                        </div>
                    {showSettings && userName && (
              <ReminderSettings userId={userName} reminderService={reminderService} onClose={() => setShowSettings(false)} />
              )}
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

                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    e.target.style.height = "auto";
                                    e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder={userName ? "Tell me..." : "Your name?"}
                                className="input"
                                rows={1}
                                autoFocus
                                />
                                  <button
                                                onClick={handleSendMessage}
                                                disabled={!inputValue.trim()}
                                                className="send-button"
                                              >
                                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
                                  </button>
                        </div>
                </div>
          </div>
        );
}
