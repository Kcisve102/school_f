import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a1f] border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-400">
          <p>
            &copy; {currentYear} {import.meta.env.VITE_APP_NAME || 'EduVideo'}. All rights reserved.
          </p>
          <p className="mt-1 text-gray-500">
            Powered by AI transcription and summarization
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
