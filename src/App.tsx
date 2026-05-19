import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import VideoDetailPage from './pages/VideoDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';

function AppContent() {
  const { theme } = useTheme();
  
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <Header />

      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route
            path="/video/:id"
            element={
              <ProtectedRoute>
                <VideoDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="/chat" element={<ChatPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#1e1e28' : '#ffffff',
            color: theme === 'dark' ? '#fafafa' : '#1a1a1a',
            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e2dc'}`,
          },
          success: {
            iconTheme: {
              primary: theme === 'dark' ? '#10b981' : '#059669',
              secondary: theme === 'dark' ? '#fff' : '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: theme === 'dark' ? '#ef4444' : '#dc2626',
              secondary: theme === 'dark' ? '#fff' : '#fff',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
