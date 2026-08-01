import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

export const SignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    if (password.length < 8) {
      setError(t.passwordTooShort);
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, fullName);
      navigate('/');
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div>
        <h2 className="font-display font-medium text-text-primary text-[clamp(1.75rem,4.5vw,3.5rem)] leading-[1] tracking-[-0.03em] mb-10 sm:mb-14">
          {t.createAccount}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t.fullName}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="John Doe"
              className="input"
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t.confirmPassword}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="input"
            />
            {error && (
              <p className="mt-2 text-sm text-error">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? t.creatingAccount : t.signUp}
          </button>
        </form>

        <p className="mt-6 text-sm text-text-secondary">
          {t.alreadyHaveAccount}{' '}
          <Link to="/login" className="text-accent hover:text-accent-dark font-medium transition-colors">
            {t.login}
          </Link>
        </p>

        <p className="mt-4 text-sm text-text-secondary">
          <Link to="/" className="text-accent hover:text-accent-dark font-medium transition-colors">
            {t.backToVideos}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
