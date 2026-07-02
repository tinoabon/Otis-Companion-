import React, { useState, useRef, KeyboardEvent } from 'react';

interface MessageInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
    onSend,
    disabled = false,
    placeholder = 'Message Otis...',
}) => {
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
          const trimmed = value.trim();
          if (!trimmed || disabled) return;
          onSend(trimmed);
          setValue('');
          if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto';
          }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
          if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
          }
    };

    const handleInput = () => {
          const el = textareaRef.current;
          if (!el) return;
          el.style.height = 'auto';
          el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    };

    return (
          <div className="message-input-container">
                <textarea
                          ref={textareaRef}
                          className="message-input"
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onInput={handleInput}
                          placeholder={placeholder}
                          disabled={disabled}
                          rows={1}
                        />
                <button
                          className="send-button"
                          onClick={handleSend}
                          disabled={disabled || !value.trim()}
                          aria-label="Send message"
                        >
                        Send
                </button>button>
          </div>div>
        );
};</div>
