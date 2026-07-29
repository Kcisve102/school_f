import React from 'react';
import SignupForm from '../components/auth/SignupForm';

export const SignupPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
