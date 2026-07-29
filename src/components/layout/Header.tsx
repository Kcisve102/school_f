import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Home, MessageSquare, Menu, X, Grid3X3 } from 'lucide-react';
import LogoMark from '../common/Logo';
import { useAuth } from '../../hooks/useAuth';
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
    <header className="sticky top-0 z-50 px-4 sm:px-6 pt-4">
      <div
        className="mx-auto max-w-5xl rounded-full backdrop-blur-xl backdrop-saturate-150 shadow-lg shadow-black/20"
        style={{ backgroundColor: 'rgba(22, 23, 27, 0.65)' }}
      >
        <div className="flex items-center justify-between h-14 pl-3 pr-2 sm:pl-4 sm:pr-2">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 flex-shrink-0"
            onClick={closeMenu}
          >
            <LogoMark size={14} variant="mark" className="!text-white" />
          </Link>

          {/* Desktop nav */}
          {user ? (
            <div className="hidden sm:flex items-center gap-7">
              <Link to="/" className="flex items-center space-x-1.5 text-text-secondary hover:text-text-primary transition-colors">
                <Home className="w-4 h-4" />
                <span className="text-sm">{t.home}</span>
              </Link>
              <Link to="/categories" className="flex items-center space-x-1.5 text-text-secondary hover:text-text-primary transition-colors">
                <Grid3X3 className="w-4 h-4" />
                <span className="text-sm">{t.categories}</span>
              </Link>
              <Link to="/chat" className="flex items-center space-x-1.5 text-text-secondary hover:text-text-primary transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">{t.aiAssistant}</span>
              </Link>
              {user.is_admin ? (
                <Link to="/admin" className="flex items-center space-x-1.5 text-text-secondary hover:text-text-primary transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm">{t.admin}</span>
                </Link>
              ) : (
                <Link to="/dashboard" className="flex items-center space-x-1.5 text-text-secondary hover:text-text-primary transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm">{t.dashboard}</span>
                </Link>
              )}
              <div className="flex items-center gap-3">
                <LanguageToggle size="sm" />
                <div className="flex items-center gap-2 rounded-full bg-white text-[#16171b] pl-3 pr-1.5 py-1.5">
                  <div className="text-right leading-tight">
                    <p className="text-xs font-semibold">{user.full_name}</p>
                    <p className="text-[10px] text-black/50">{user.is_admin ? t.roleAdmin : t.roleUser}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-full bg-black/5 hover:bg-black/10 transition-all cursor-pointer"
                    title={t.logout}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-7">
              <Link to="/" className="flex items-center space-x-1.5 text-text-secondary hover:text-text-primary transition-colors">
                <Home className="w-4 h-4" />
                <span className="text-sm">{t.home}</span>
              </Link>
              <Link to="/categories" className="flex items-center space-x-1.5 text-text-secondary hover:text-text-primary transition-colors">
                <Grid3X3 className="w-4 h-4" />
                <span className="text-sm">{t.categories}</span>
              </Link>
              <Link to="/chat" className="flex items-center space-x-1.5 text-text-secondary hover:text-text-primary transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">{t.aiAssistant}</span>
              </Link>
              <div className="flex items-center gap-2">
                <LanguageToggle size="sm" />
                <Link
                  to="/login"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-2"
                >
                  {t.login}
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-white text-[#16171b] hover:bg-white/85 transition-colors rounded-full px-5 py-2.5"
                >
                  {t.signUp}
                </Link>
              </div>
            </div>
          )}

          {/* Mobile hamburger */}
          <div className="sm:hidden flex items-center gap-2">
            <LanguageToggle size="sm" />
            <button
              className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all cursor-pointer"
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
        className="sm:hidden mx-auto max-w-5xl overflow-hidden"
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
          className="mt-2 rounded-3xl px-4 py-4 flex flex-col space-y-1 backdrop-blur-xl backdrop-saturate-150 shadow-lg shadow-black/20"
          style={{ backgroundColor: 'rgba(22, 23, 27, 0.85)' }}
        >
          {user ? (
            <>
              <div className="flex items-center space-x-3 pb-3 mb-2 border-b border-white/10">
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
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all duration-150"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
              <button
                onClick={() => { closeMenu(); handleLogout(); }}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-full text-text-secondary hover:text-error hover:bg-error/10 transition-all duration-150 cursor-pointer w-full mt-1"
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
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all duration-150"
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors text-center px-3 py-2.5"
                >
                  {t.login}
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="text-sm font-medium bg-white text-[#16171b] hover:bg-white/85 transition-colors rounded-full text-center px-5 py-2.5"
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
