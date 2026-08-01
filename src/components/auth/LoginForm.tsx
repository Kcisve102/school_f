import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const t = translations[language].auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from || (user.is_admin ? '/admin' : '/'));
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* No card. The form reads as a column on the page rather than a boxed
          object floating on it — the surrounding emptiness does the framing. */}
      <div>
        <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-6">
          {t.loginSubtitle}
        </p>
        <h2 className="font-display font-medium text-text-primary text-[clamp(1.75rem,4.5vw,3.5rem)] leading-[1] tracking-[-0.03em] mb-10 sm:mb-14">
          {t.adminLogin}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? t.loggingIn : t.login}
          </button>
        </form>

        <p className="mt-8 text-sm text-text-secondary">
          {t.noAccount}{' '}
          <Link to="/signup" className="inline-flex items-center min-h-[44px] text-accent hover:text-accent-dark font-medium transition-colors">
            {t.signUp}
          </Link>
        </p>

        <p className="mt-3 text-sm text-text-secondary">
          <Link to="/" className="inline-flex items-center min-h-[44px] text-accent hover:text-accent-dark font-medium transition-colors">
            {t.backToVideos}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
