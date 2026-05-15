import { useThemeStore } from '@/store/theme-store';

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useThemeStore();
  return <div onClick={toggleTheme}>{theme === 'dark' ? 'light' : 'dark'}</div>;
}
