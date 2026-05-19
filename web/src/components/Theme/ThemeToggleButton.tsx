import { useAppStore } from '@/store/app-store';

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useAppStore();
  return <div onClick={toggleTheme}>{theme === 'dark' ? 'light' : 'dark'}</div>;
}
