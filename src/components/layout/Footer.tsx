import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-600">
          <p>
            &copy; {currentYear} {import.meta.env.VITE_APP_NAME || 'Educational Video Platform'}. All rights reserved.
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
