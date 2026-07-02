import React from 'react';
import { Message } from '../types/conversation';

interface MessageBubbleProps {
    message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === 'user';
    const timeStr = new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
    });

    return (
          <div className={`message-bubble ${isUser ? 'user-message' : 'otis-message'}`}>
            {!isUser && (
                    <div className="avatar">
                              <span>O</span>span>
                    </div>div>
                )}
                <div className="bubble-content">
                        <div className="bubble-text">{message.content}</div>div>
                        <div className="bubble-time">{timeStr}</div>div>
                </div>div>
          </div>div>
        );
};</div>
