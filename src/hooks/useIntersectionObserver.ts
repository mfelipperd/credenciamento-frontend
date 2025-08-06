import { useEffect, useState } from "react";
import type { RefObject } from "react";

interface UseIntersectionObserverProps {
  root?: RefObject<Element>;
  rootMargin?: string;
  threshold?: number;
}

export const useIntersectionObserver = (
  elementRef: RefObject<Element>,
  {
    root,
    rootMargin = "0px",
    threshold = 0.1,
  }: UseIntersectionObserverProps = {}
): boolean => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: root?.current,
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [elementRef, root, rootMargin, threshold]);

  return isVisible;
};
