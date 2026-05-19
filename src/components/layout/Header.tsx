import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Home, MessageSquare, Menu, X, Grid3X3 } from 'lucide-react';
import LogoMark from '../common/Logo';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../common/ThemeToggle';

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
    <header className="bg-bg-primary border-b border-border backdrop-blur-lg sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5" onClick={closeMenu}>
            <LogoMark size={34} />
            <span className="text-xl font-bold text-text-primary tracking-tight">
              {import.meta.env.VITE_APP_NAME || 'EduVideo'}
            </span>
          </Link>

          {/* Desktop nav */}
          {user ? (
            <div className="hidden sm:flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              <Link to="/categories" className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors">
                <Grid3X3 className="w-5 h-5" />
                <span className="font-medium">Categories</span>
              </Link>
              <Link to="/chat" className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </Link>
              {user.is_admin ? (
                <Link to="/admin" className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors">
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Admin</span>
                </Link>
              ) : (
                <Link to="/dashboard" className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors">
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              )}
              <div className="flex items-center space-x-3 pl-6 border-l border-border">
                <ThemeToggle size="sm" />
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">{user.full_name}</p>
                  <p className="text-xs text-text-muted">{user.is_admin ? 'Admin' : 'User'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-surface-secondary hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              <Link to="/categories" className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors">
                <Grid3X3 className="w-5 h-5" />
                <span className="font-medium">Categories</span>
              </Link>
              <Link to="/chat" className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </Link>
              <div className="flex items-center space-x-3 pl-6 border-l border-border">
                <ThemeToggle size="sm" />
                <Link
                  to="/login"
                  className="px-6 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent-dark transition-all"
                >
                  Login
                </Link>
              </div>
            </div>
          )}

          {/* Mobile hamburger */}
          <div className="sm:hidden flex items-center gap-2">
            <ThemeToggle size="sm" />
            <button
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all cursor-pointer"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 border-t border-border px-4 py-4 flex flex-col space-y-4 bg-bg-primary/95 backdrop-blur-lg shadow-xl">
          {user ? (
            <>
              <div className="flex items-center space-x-3 pb-3 border-b border-border">
                <div>
                  <p className="text-sm font-medium text-text-primary">{user.full_name}</p>
                  <p className="text-xs text-text-muted">{user.is_admin ? 'Admin' : 'User'}</p>
                </div>
              </div>
              <Link to="/" onClick={closeMenu} className="flex items-center space-x-2 text-text-secondary hover:text-accent transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              <Link to="/categories" onClick={closeMenu} className="flex items-center space-x-2 text-text-secondary hover:text-accent transition-colors">
                <Grid3X3 className="w-5 h-5" />
                <span className="font-medium">Categories</span>
              </Link>
              <Link to="/chat" onClick={closeMenu} className="flex items-center space-x-2 text-text-secondary hover:text-accent transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </Link>
              {user.is_admin ? (
                <Link to="/admin" onClick={closeMenu} className="flex items-center space-x-2 text-text-secondary hover:text-accent transition-colors">
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Admin</span>
                </Link>
              ) : (
                <Link to="/dashboard" onClick={closeMenu} className="flex items-center space-x-2 text-text-secondary hover:text-accent transition-colors">
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              )}
              <button
                onClick={() => { closeMenu(); handleLogout(); }}
                className="flex items-center space-x-2 text-text-secondary hover:text-error transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/" onClick={closeMenu} className="flex items-center space-x-2 text-text-secondary hover:text-accent transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              <Link to="/categories" onClick={closeMenu} className="flex items-center space-x-2 text-text-secondary hover:text-accent transition-colors">
                <Grid3X3 className="w-5 h-5" />
                <span className="font-medium">Categories</span>
              </Link>
              <Link to="/chat" onClick={closeMenu} className="flex items-center space-x-2 text-text-secondary hover:text-accent transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </Link>
              <Link
                to="/login"
                onClick={closeMenu}
                className="px-6 py-2 rounded-lg bg-accent text-white font-medium text-center hover:bg-accent-dark transition-all"
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
