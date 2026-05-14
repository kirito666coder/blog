import { useEffect, useState, type RefObject } from 'react';

export function useInViewport<T extends Element>(
  elementRef: RefObject<T | null>,
  unobserveOnIntersect: boolean = false,
  options: IntersectionObserverInit = {},
  shouldObserve: boolean = true
): boolean {
  const [intersect, setIntersect] = useState<boolean>(false);
  const [isUnobserved, setIsUnobserved] = useState<boolean>(false);

  useEffect(() => {
    if (!elementRef?.current) return;

    const observer = new IntersectionObserver(
      ([entry]: IntersectionObserverEntry[]) => {
        const { isIntersecting, target } = entry;

        setIntersect(isIntersecting);

        if (isIntersecting && unobserveOnIntersect) {
          observer.unobserve(target);
          setIsUnobserved(true);
        }
      },
      options
    );

    if (!isUnobserved && shouldObserve) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [elementRef, unobserveOnIntersect, options, isUnobserved, shouldObserve]);

  return intersect;
}
