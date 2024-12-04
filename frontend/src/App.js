import { React, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { HashRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';
import ProtectedRoute from './components/protectedRoute';
import Editor from './components/editor';
import Header from './components/header';
import Profile from './pages/profile';
import ForgotPassword from './components/forgot-password';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access'));

  
  const ConditionalHeader = () => {
    const location = useLocation();
    const hideHeaderPaths = ['/','/login', '/signup', '/forgot-password'];
    return !hideHeaderPaths.includes(location.pathname) ? (
      <Header isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
    ) : null;
  };

  return (
    <div>
      <Router>
        <ConditionalHeader />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-note"
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-note/:noteId"
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
