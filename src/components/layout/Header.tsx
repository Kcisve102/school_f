import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, LogOut, LayoutDashboard, Home, MessageSquare, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="bg-[#0a0a1f] border-b border-white/10 backdrop-blur-lg sticky top-0 z-50 relative">
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-2 rounded-lg">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              {import.meta.env.VITE_APP_NAME || 'EduVideo'}
            </span>
          </Link>

          {/* Desktop nav */}
          {user ? (
            <div className="hidden sm:flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-1 text-gray-300 hover:text-purple-400 transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              <Link to="/chat" className="flex items-center space-x-1 text-gray-300 hover:text-purple-400 transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </Link>
              {user.is_admin ? (
                <Link to="/admin" className="flex items-center space-x-1 text-gray-300 hover:text-purple-400 transition-colors">
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Admin</span>
                </Link>
              ) : (
                <Link to="/dashboard" className="flex items-center space-x-1 text-gray-300 hover:text-purple-400 transition-colors">
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              )}
              <div className="flex items-center space-x-3 pl-6 border-l border-white/10">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user.full_name}</p>
                  <p className="text-xs text-gray-400">{user.is_admin ? 'Admin' : 'User'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-1 text-gray-300 hover:text-purple-400 transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              <Link to="/chat" className="flex items-center space-x-1 text-gray-300 hover:text-purple-400 transition-colors">
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

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu — absolutely positioned so it overlays content without pushing it down */}
      {menuOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 border-t border-white/10 px-4 py-4 flex flex-col space-y-4 bg-[#0a0a1f]/95 backdrop-blur-lg shadow-xl">
          {user ? (
            <>
              <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
                <div>
                  <p className="text-sm font-medium text-white">{user.full_name}</p>
                  <p className="text-xs text-gray-400">{user.is_admin ? 'Admin' : 'User'}</p>
                </div>
              </div>
              <Link to="/" onClick={closeMenu} className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              <Link to="/chat" onClick={closeMenu} className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </Link>
              {user.is_admin ? (
                <Link to="/admin" onClick={closeMenu} className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors">
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Admin</span>
                </Link>
              ) : (
                <Link to="/dashboard" onClick={closeMenu} className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors">
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              )}
              <button
                onClick={() => { closeMenu(); handleLogout(); }}
                className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/" onClick={closeMenu} className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              <Link to="/chat" onClick={closeMenu} className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </Link>
              <Link
                to="/login"
                onClick={closeMenu}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium text-center hover:from-purple-500 hover:to-blue-500 transition-all"
              >
                Login
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
