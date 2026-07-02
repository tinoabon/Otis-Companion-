import React, { useEffect, useRef } from 'react';
import { Message } from '../types/conversation';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { DateDivider } from './DateDivider';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
    messages: Message[];
    isTyping: boolean;
    onSend: (message: string) => void;
    disabled?: boolean;
}

function isSameDay(a: Date, b: Date): boolean {
    return (
          a.getFullYear() === b.getFullYear() &&
          a.getMonth() === b.getMonth() &&
          a.getDate() === b.getDate()
        );
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    messages,
    isTyping,
    onSend,
    disabled = false,
}) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const renderMessages = () => {
          const elements: React.ReactNode[] = [];
          let lastDate: Date | null = null;

          messages.forEach((msg, index) => {
                  const msgDate = new Date(msg.timestamp);
                  if (!lastDate || !isSameDay(lastDate, msgDate)) {
                            elements.push(
                                        <DateDivider key={`date-${msg.id}`} date={msg.timestamp} />
                                      );
                            lastDate = msgDate;
                  }
                  elements.push(<MessageBubble key={msg.id ?? index} message={msg} />);
          });

          return elements;
    };

    return (
          <div className="chat-window">
                <div className="chat-header">
                        <div className="otis-avatar">O</div>div>
                        <div className="otis-info">
                                  <span className="otis-name">Otis</span>span>
                                  <span className="otis-status">Your Movement Companion</span>span>
                        </div>div>
                </div>div>
                <div className="messages-container">
                  {renderMessages()}
                  {isTyping && <TypingIndicator />}
                        <div ref={bottomRef} />
                </div>div>
                <MessageInput onSend={onSend} disabled={disabled} />
          </div>div>
        );
};</div>
