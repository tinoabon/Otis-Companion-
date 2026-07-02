import React, { useEffect } from 'react';
import { ChatWindow } from '../components/ChatWindow';
import { useConversation } from '../hooks/useConversation';
import { useMemory } from '../hooks/useMemory';
import { useTyping } from '../hooks/useTyping';
import '../App.css';

export default function App() {
    const { messages, sendMessage, isLoading } = useConversation();
    const { userName, refresh: refreshMemory } = useMemory();
    const { isTyping } = useTyping();

  useEffect(() => {
        refreshMemory();
  }, []);

  const handleSend = async (text: string) => {
        await sendMessage(text);
  };

  return (
        <div className="app-container">
              <div className="app-sidebar">
                      <div className="sidebar-header">
                                <h1 className="app-title">Otis</h1>h1>
                                <p className="app-subtitle">Movement Companion</p>p>
                      </div>div>
                {userName && (
                    <div className="user-greeting">
                                <span>Hey, {userName}</span>span>
                    </div>div>
                      )}
              </div>div>
              <main className="app-main">
                      <ChatWindow
                                  messages={messages}
                                  isTyping={isLoading || isTyping}
                                  onSend={handleSend}
                                  disabled={isLoading}
                                />
              </main>main>
        </div>div>
      );
}</div>
