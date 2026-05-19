import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, LogOut, LayoutDashboard, Home, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-[#0a0a1f] border-b border-white/10 backdrop-blur-lg sticky top-0 z-50">
      <div className="mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-2 rounded-lg">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              {import.meta.env.VITE_APP_NAME || 'EduVideo'}
            </span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className="flex items-center space-x-1 text-gray-300 hover:text-purple-400 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>

              <Link
                to="/chat"
                className="flex items-center space-x-1 text-gray-300 hover:text-purple-400 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </Link>

              {user.is_admin ? (
                <Link
                  to="/admin"
                  className="flex items-center space-x-1 text-gray-300 hover:text-purple-400 transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Admin</span>
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 text-gray-300 hover:text-purple-400 transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              )}

              <div className="flex items-center space-x-3 pl-6 border-l border-white/10">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user.full_name}</p>
                  <p className="text-xs text-gray-400">
                    {user.is_admin ? 'Admin' : 'User'}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className="flex items-center space-x-1 text-gray-300 hover:text-purple-400 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              <Link
                to="/chat"
                className="flex items-center space-x-1 text-gray-300 hover:text-purple-400 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </Link>
              <Link
                to="/login"
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-500 hover:to-blue-500 transition-all"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
