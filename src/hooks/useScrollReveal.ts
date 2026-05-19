import { useEffect, DependencyList } from 'react';

/**
 * Attaches an IntersectionObserver to every element matching [class*="reveal-"].
 * Adds `.in-view` when the element enters the viewport, removes it when it leaves —
 * so animations re-fire on both scroll-down AND scroll-up.
 *
 * Pass `deps` to re-observe after async content renders (e.g. after loading state clears).
 */
export function useScrollReveal(
  options?: IntersectionObserverInit,
  deps: DependencyList = []
) {
  useEffect(() => {
    const defaultOptions: IntersectionObserverInit = {
      threshold: 0.12,
      rootMargin: '0px 0px -48px 0px',
      ...options,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    }, defaultOptions);

    // Observe all reveal-* elements and legacy animate-on-scroll elements
    const targets = document.querySelectorAll(
      '[class*="reveal-"], .animate-on-scroll'
    );
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
