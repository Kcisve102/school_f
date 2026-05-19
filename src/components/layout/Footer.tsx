import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-text-secondary">
          <p>
            &copy; {currentYear} {import.meta.env.VITE_APP_NAME || 'EduVideo'}. All rights reserved.
          </p>
          <p className="mt-1 text-text-muted">
            Powered by AI transcription and summarization
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
