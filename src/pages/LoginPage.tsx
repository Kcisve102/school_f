import React from 'react';
import LoginForm from '../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)]">
      <div className="px-6 lg:px-12 xl:px-20 py-16 sm:py-28">
        {/* Form sits on the page's hard left edge rather than dead-centre. The
            empty right column is the point — it holds the same emptiness the
            rest of the site opens with. */}
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-6 xl:col-span-5">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
