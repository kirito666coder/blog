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
}));
