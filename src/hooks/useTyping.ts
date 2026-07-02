import { useState, useCallback } from 'react';

export function useTyping() {
    const [isTyping, setIsTyping] = useState(false);

  const showTyping = useCallback((duration: number = 1500) => {
        setIsTyping(true);
        return new Promise<void>((resolve) => {
                setTimeout(() => {
                          setIsTyping(false);
                          resolve();
                }, duration);
        });
  }, []);

  const startTyping = useCallback(() => {
        setIsTyping(true);
  }, []);

  const stopTyping = useCallback(() => {
        setIsTyping(false);
  }, []);

  return {
        isTyping,
        showTyping,
        startTyping,
        stopTyping,
  };
}
