import { useCallback, useEffect, useRef, useState } from 'react';

type WindowSize = {
  width: number;
  height: number;
};

type Dimensions = {
  w: number;
  h: number;
};

export function useWindowSize(): WindowSize {
  const dimensions = useRef<Dimensions>({
    w: 1280,
    h: 800,
  });

  const createRuler = useCallback((): void => {
    let ruler: HTMLDivElement | null = document.createElement('div');

    ruler.style.position = 'fixed';
    ruler.style.height = '100vh';
    ruler.style.width = '0';
    ruler.style.top = '0';

    document.documentElement.appendChild(ruler);

    // Set cache conscientious of device orientation
    dimensions.current.w = window.innerWidth;
    dimensions.current.h = ruler.offsetHeight;

    // Clean up after ourselves
    document.documentElement.removeChild(ruler);
    ruler = null;
  }, []);

  // Get the actual height on iOS Safari
  const getHeight = useCallback((): number => {
    const isIOS = navigator?.userAgent.match(/iphone|ipod|ipad/i);

    if (isIOS) {
      createRuler();
      return dimensions.current.h;
    }

    return window.innerHeight;
  }, [createRuler]);

  const getSize = useCallback((): WindowSize => {
    return {
      width: window.innerWidth,
      height: getHeight(),
    };
  }, [getHeight]);

  const getInitialSize = (): WindowSize => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const [windowSize, setWindowSize] = useState<WindowSize>(getInitialSize);

  useEffect(() => {
    const handleResize = (): void => {
      setWindowSize(getSize());
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return (): void => {
      window.removeEventListener('resize', handleResize);
    };
  }, [getSize]);

  return windowSize;
}
