import React from 'react';
import LoginForm from '../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
