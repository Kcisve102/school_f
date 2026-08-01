import React, { useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { language } = useLanguage();
  const t = translations[language].footer;

  // Published for the same reason as --header-h: the chat page is a fixed
  // viewport frame and has to subtract both to avoid overflowing the page.
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty('--footer-h', `${el.offsetHeight}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <footer ref={ref} className="bg-surface border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-text-secondary">
          <p>
            &copy; {currentYear} {import.meta.env.VITE_APP_NAME || 'Knowverd'}. {t.allRightsReserved}
          </p>
          <p className="mt-1 text-text-muted">
            {t.poweredBy}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
