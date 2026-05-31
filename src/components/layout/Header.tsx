import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Home, MessageSquare, Menu, X, Grid3X3 } from 'lucide-react';
import LogoMark from '../common/Logo';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../common/ThemeToggle';
import LanguageToggle from '../common/LanguageToggle';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { language } = useLanguage();
  const t = translations[language].nav;

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
          <Link to="/" className="flex items-center" onClick={closeMenu}>
            <LogoMark size={180} />
          </Link>

          {/* Desktop nav */}
          {user ? (
            <div className="hidden sm:flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-medium">{t.home}</span>
              </Link>
              <Link to="/categories" className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors">
                <Grid3X3 className="w-5 h-5" />
                <span className="font-medium">{t.categories}</span>
              </Link>
              <Link to="/chat" className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">{t.aiAssistant}</span>
              </Link>
              {user.is_admin ? (
                <Link to="/admin" className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors">
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">{t.admin}</span>
                </Link>
              ) : (
                <Link to="/dashboard" className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors">
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">{t.dashboard}</span>
                </Link>
              )}
              <div className="flex items-center space-x-3 pl-6 border-l border-border">
                <ThemeToggle size="sm" />
                <LanguageToggle size="sm" />
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">{user.full_name}</p>
                  <p className="text-xs text-text-muted">{user.is_admin ? t.roleAdmin : t.roleUser}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-surface-secondary hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                  title={t.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-medium">{t.home}</span>
              </Link>
              <Link to="/categories" className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors">
                <Grid3X3 className="w-5 h-5" />
                <span className="font-medium">{t.categories}</span>
              </Link>
              <Link to="/chat" className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">{t.aiAssistant}</span>
              </Link>
              <div className="flex items-center space-x-3 pl-6 border-l border-border">
                <ThemeToggle size="sm" />
                <LanguageToggle size="sm" />
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg border border-border text-text-secondary font-medium hover:text-text-primary hover:border-accent/40 transition-all"
                >
                  {t.login}
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent-dark transition-all"
                >
                  {t.signUp}
                </Link>
              </div>
            </div>
          )}

          {/* Mobile hamburger */}
          <div className="sm:hidden flex items-center gap-2">
            <ThemeToggle size="sm" />
            <LanguageToggle size="sm" />
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

      {/* Mobile menu — always mounted, animated open/close */}
      <div
        className="sm:hidden absolute top-full left-0 right-0 overflow-hidden"
        style={{
          maxHeight: menuOpen ? '600px' : '0px',
          opacity: menuOpen ? 1 : 0,
          transform: menuOpen ? 'translateY(0)' : 'translateY(-8px)',
          transition: menuOpen
            ? 'max-height 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1)'
            : 'max-height 0.25s cubic-bezier(0.4,0,1,1), opacity 0.2s ease, transform 0.2s ease',
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
      >
        <div
          className="border-t border-border/60 px-4 py-4 flex flex-col space-y-1 shadow-2xl bg-white/80 dark:bg-[#0a0a0f]/90"
          style={{
            backdropFilter: 'blur(20px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
          }}
        >
          {user ? (
            <>
              <div className="flex items-center space-x-3 pb-3 mb-2 border-b border-border/60">
                <div>
                  <p className="text-sm font-medium text-text-primary">{user.full_name}</p>
                  <p className="text-xs text-text-muted">{user.is_admin ? t.roleAdmin : t.roleUser}</p>
                </div>
              </div>
              {[
                { to: '/', Icon: Home, label: t.home },
                { to: '/categories', Icon: Grid3X3, label: t.categories },
                { to: '/chat', Icon: MessageSquare, label: t.aiAssistant },
                user.is_admin
                  ? { to: '/admin', Icon: LayoutDashboard, label: t.admin }
                  : { to: '/dashboard', Icon: LayoutDashboard, label: t.dashboard },
              ].map(({ to, Icon, label }, i) => (
                <Link
                  key={to}
                  to={to}
                  onClick={closeMenu}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/8 transition-all duration-150"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
              <button
                onClick={() => { closeMenu(); handleLogout(); }}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-error hover:bg-error/8 transition-all duration-150 cursor-pointer w-full mt-1"
              >
                <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
                <span className="font-medium">{t.logout}</span>
              </button>
            </>
          ) : (
            <>
              {[
                { to: '/', Icon: Home, label: t.home },
                { to: '/categories', Icon: Grid3X3, label: t.categories },
                { to: '/chat', Icon: MessageSquare, label: t.aiAssistant },
              ].map(({ to, Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={closeMenu}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/8 transition-all duration-150"
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="block px-6 py-2.5 rounded-lg border border-border text-text-secondary font-medium text-center hover:text-text-primary hover:border-accent/40 transition-all"
                >
                  {t.login}
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="block px-6 py-2.5 rounded-lg bg-accent text-white font-medium text-center hover:bg-accent-dark transition-all"
                >
                  {t.signUp}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
