import { useMediaQuery } from 'react-responsive';

export function useBreakpoint() {
  const isSm = useMediaQuery({ maxWidth: 639 });
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });
  const isDesktop = useMediaQuery({ maxWidth: 1280 });
  const isBigScreen = useMediaQuery({ minWidth: 768 });
  const isMd = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isLg = useMediaQuery({ minWidth: 1024, maxWidth: 1279 });
  const isXl = useMediaQuery({ minWidth: 1280, maxWidth: 1535 });
  const is4k = useMediaQuery({ minWidth: 1536 });

  return { isSm, isMd, isLg, isXl, isMobile, isTablet, isBigScreen, isDesktop, is4k };
}
