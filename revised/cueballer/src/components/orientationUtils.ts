// orientationUtils.ts
// Utility functions and hooks for handling orientation and viewport effects

import { useEffect, RefObject } from 'react';

export function useVhSetter() {
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);
    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);
}

export function useOrientationHandler(
  orientation: string,
  setOrientation: (o: string) => void,
  containerRef: RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const handleResize = () => {
      const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      if (orientation !== newOrientation) {
        setOrientation(newOrientation);
        document.documentElement.style.height = '100%';
        document.body.style.height = '100%';
        window.scrollTo(0, 0);
        if (containerRef.current) {
          containerRef.current.style.display = 'none';
          void containerRef.current.offsetHeight;
          containerRef.current.style.display = 'flex';
        }
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 300);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [orientation, setOrientation, containerRef]);
}
