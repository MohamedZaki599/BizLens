import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AssistantState {
  isOpen: boolean;
  isFloating: boolean;
  messages: AssistantMessage[];
  currentPrompt: string;
  
  // Actions
  openAssistant: (initialPrompt?: string) => void;
  closeAssistant: () => void;
  setPrompt: (prompt: string) => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  clearMessages: () => void;
}

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set) => ({
      isOpen: false,
      isFloating: true,
      messages: [],
      currentPrompt: '',

      openAssistant: (initialPrompt) => set({ 
        isOpen: true, 
        currentPrompt: initialPrompt ?? '' 
      }),
      
      closeAssistant: () => set({ isOpen: false }),
      
      setPrompt: (currentPrompt) => set({ currentPrompt }),
      
      addMessage: (role, content) => set((state) => ({
        messages: [
          ...state.messages,
          {
            id: Math.random().toString(36).substring(7),
            role,
            content,
            timestamp: Date.now(),
          },
        ],
      })),

      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'bizlens-assistant-storage',
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);
