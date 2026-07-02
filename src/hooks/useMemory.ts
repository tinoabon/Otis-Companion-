// src/hooks/useMemory.ts

import { useState, useEffect } from "react";
import { MemoryStore } from "../memory/MemoryStore";
import { UserProfile, DailyMemory } from "../types/memory";

export function useMemory() {
    const [userName, setUserName] = useState<string | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [todayMemory, setTodayMemory] = useState<DailyMemory | null>(null);
    const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
        const store = MemoryStore.getInstance();
        store.loadAll();
        setUserName(store.getUserName());
        setProfile(store.getProfile());
        const today = store.getTodayMemory();
        setTodayMemory(today);
        setHasMoved(today?.movedToday || false);
  }, []);

  const refresh = () => {
        const store = MemoryStore.getInstance();
        store.loadAll();
        setUserName(store.getUserName());
        setProfile(store.getProfile());
        const today = store.getTodayMemory();
        setTodayMemory(today);
        setHasMoved(today?.movedToday || false);
  };

  return { userName, profile, todayMemory, hasMoved, refresh };
}
