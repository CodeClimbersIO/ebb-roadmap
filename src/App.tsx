import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import { JSX } from 'react';

// This will be implemented next
// import HomePage from './pages/HomePage';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!currentUser || !['editor', 'admin'].includes(currentUser.role || '')) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/" replace />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } />
          {/* Add protected route example for when we add editing features */}
          {/* <Route path="/edit/:id" element={
            <ProtectedRoute>
              <div className="p-8">Edit Page (to be implemented)</div>
            </ProtectedRoute>
          } /> */}
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
