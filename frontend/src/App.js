import {React, useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';
import ProtectedRoute from './components/protectedRoute';
import Editor from './components/editor';
import Header from './components/header';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access'));
  return (
    <div>
       
    
    <Router>
    <Header isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={<h1 className="text-white text-center text-4xl">Welcome to NoteVault</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
