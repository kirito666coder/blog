// store/app-store.ts

import { create } from 'zustand';

type Theme = 'dark' | 'light';

type AppStore = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  loading: boolean;
  setLoading: (value: boolean) => void;

  musicEnabled: boolean;
  setMusicEnabled: (value: boolean) => void;

  // Route Reveal
  revealOpen: boolean;
  revealName: string;
  revealX: number;

  startReveal: (name: string, x?: number) => void;
  stopReveal: () => void;
};

export const useAppStore = create<AppStore>((set) => ({
  theme: 'dark',

  setTheme: (theme) => set({ theme }),

  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'dark' ? 'light' : 'dark',
    })),

  loading: true,

  setLoading: (value) => set({ loading: value }),

  musicEnabled: false,

  setMusicEnabled: (value) =>
    set({
      musicEnabled: value,
    }),

  // Reveal state
  revealOpen: false,
  revealName: '',
  revealX: 3000,

  startReveal: (name, x = 3000) =>
    set({
      revealOpen: true,
      revealName: name,
      revealX: x,
    }),

  stopReveal: () =>
    set({
      revealOpen: false,
    }),
}));
