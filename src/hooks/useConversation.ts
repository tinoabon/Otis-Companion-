// src/hooks/useConversation.ts

import { useState, useCallback, useRef, useEffect } from "react";
import { Message } from "../types/conversation";
import { ConversationEngine } from "../conversation/ConversationEngine";

export function useConversation() {
    const engineRef = useRef<ConversationEngine | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isReady, setIsReady] = useState(false);

  useEffect(() => {
        engineRef.current = new ConversationEngine();
        const session = engineRef.current.initSession();
        setMessages(session.messages);
        setIsReady(true);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
        if (!engineRef.current || !text.trim()) return;
        const userMsg: Message = {
                id: crypto.randomUUID(),
                role: "user",
                content: text.trim(),
                timestamp: new Date()
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsTyping(true);
        await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));
        try {
                await engineRef.current.processMessage(text.trim());
                setMessages(engineRef.current.getMessages());
        } catch (error) {
                console.error("Error processing message:", error);
        } finally {
                setIsTyping(false);
        }
  }, []);

  return { messages, isTyping, isReady, sendMessage };
}
