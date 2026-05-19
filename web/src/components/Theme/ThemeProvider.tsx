'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');

    document.documentElement.classList.add(theme);
  }, [theme]);

  return children;
}
