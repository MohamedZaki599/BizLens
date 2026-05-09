import { create } from 'zustand';

interface SignalWorkspaceState {
  isOpen: boolean;
  activeSignalKey: string | null;
  openWorkspace: (signalKey: string) => void;
  closeWorkspace: () => void;
}

export const useSignalWorkspace = create<SignalWorkspaceState>((set) => ({
  isOpen: false,
  activeSignalKey: null,
  openWorkspace: (signalKey) => set({ isOpen: true, activeSignalKey: signalKey }),
  closeWorkspace: () => set({ isOpen: false, activeSignalKey: null }),
}));
