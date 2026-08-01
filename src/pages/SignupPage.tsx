import React from 'react';
import SignupForm from '../components/auth/SignupForm';

export const SignupPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)]">
      <div className="px-6 lg:px-12 xl:px-20 py-16 sm:py-28">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 xl:col-span-4">
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
