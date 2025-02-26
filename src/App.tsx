import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';

// Import pages (we'll create these next)
// import HomePage from './pages/HomePage';
// import LoginPage from './pages/LoginPage';
// import NotePage from './pages/NotePage';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* <Route path="/" element={<HomePage user={user} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/note/:id" element={<NotePage user={user} />} /> */}
          <Route path="/" element={<div className="p-8">Home Page (to be implemented)</div>} />
          <Route path="/login" element={<div className="p-8">Login Page (to be implemented)</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
