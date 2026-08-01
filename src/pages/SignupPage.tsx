import React from 'react';
import SignupForm from '../components/auth/SignupForm';

export const SignupPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center">
      <div className="w-full px-6 py-16 sm:py-24">
        {/* Centred for the same reason as login — see LoginPage. */}
        <div className="w-full max-w-md mx-auto">
          <SignupForm />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
