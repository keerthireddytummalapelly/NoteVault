import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Handle signup submission logic here
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
        const response = await fetch('http://localhost:8000/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password }),
        });
  
        const data = await response.json();
        if (response.ok) {
          setSuccess(true);
          setTimeout(() => {
            navigate('/login');
          }, 1500); // 1.5 second delay before redirecting
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError('Something went wrong. Please try again.');
      }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-3xl text-center text-white font-bold mb-6">NOTE VAULT</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-semibold mb-2">UserName</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded"
              placeholder="Enter your first name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded"
              placeholder="Enter your email"
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
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-semibold mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded"
              placeholder="Confirm your password"
              required
            />
          </div>
          <div className="mb-6">
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Register
            </button>
          </div>
          <div className="text-center text-gray-400">
            Existing user? <Link to="/login" className="text-blue-400 hover:text-blue-500">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
