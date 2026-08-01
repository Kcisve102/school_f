import React from 'react';
import LoginForm from '../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center">
      <div className="w-full px-6 py-16 sm:py-24">
        {/*
          Centred, unlike every other page in the app. The hard left edge earns
          its keep where there is other content to align with — headings, stats,
          tables, cards. An auth form has none of that, so a left edge here just
          leaves two thirds of the screen empty with nothing to hold it.

          The text stays left-aligned inside the column; only the column is
          centred.
        */}
        <div className="w-full max-w-md mx-auto">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
