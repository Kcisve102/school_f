import React from 'react';
import SignupForm from '../components/auth/SignupForm';

export const SignupPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <SignupForm />
    </div>
  );
};

export default SignupPage;
