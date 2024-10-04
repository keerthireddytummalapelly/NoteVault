import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    try {
      const response = await fetch('http://localhost:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }), 
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('username', username); 
        localStorage.setItem('token', data.access); 
        localStorage.setItem('refresh', data.refresh); 
        navigate('/home'); 
      } else {
        const result = await response.json();
        setError(result.detail || 'Login failed'); 
      }
    } catch (error) {
      setError('An error occurred while logging in. Please try again.');
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-3xl text-center text-white font-bold mb-6">NOTE VAULT</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-semibold mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded"
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="mb-6">
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Login
            </button>
          </div>
          <div className="text-center text-gray-400">
            <Link to="/forgot-password" className="hover:text-gray-200">Forgot password?</Link>
          </div>
          <div className="mt-4 text-center text-gray-400">
            New user? <Link to="/signup" className="text-blue-400 hover:text-blue-500">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
