import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home'); 
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username) {
      toast.info("Please fill in the username", {
        style: {
          backgroundColor: '#2196F3',
          color: 'white',
          borderRadius: '8px',
          padding: '10px',
        },
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    } else if (!password) {
      toast.info("Please fill in password.", {
        style: {
          backgroundColor: '#2196F3',
          color: 'white',
          borderRadius: '8px',
          padding: '10px',
        },
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    try {
      const response = await fetch('http://52.7.128.221:8000/login/', {
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

        const firstNameResponse = await fetch(`http://52.7.128.221:8000/api/getFirstname/?username=${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.access}`,
          },
        });
  
        const firstNameData = await firstNameResponse.json();
        if (firstNameData.first_name) {
          localStorage.setItem('firstName', firstNameData.first_name);
        }
        
        navigate('/home');
      } else {
        const result = await response.json();
        setError(result.detail || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('An error occurred while logging in. Please try again.');
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row gap-0 items-center ">
      <div className="flex flex-col items-center w-full md:w-1/2 mb-4 md:ml-20 ">
        <img src="/Logo.png" alt="Logo" className="w-40 h-28 mb-4 "/>
        <h1 className="text-3xl md:text-5xl text-white font-bold mb-3 text-center">NOTE VAULT</h1>
        <h3 className="text-white text-lg md:text-xl font-semibold text-center">
          Secure your thoughts, unlock your potential
        </h3>
      </div>
      <div className="bg-black p-8 rounded-md w-full max-w-md border-2 border-white">
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-col md:flex-row items-center">
            <label className="text-white text-sm font-semibold md:w-1/3">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full md:w-2/3 p-2 mt-2 md:mt-0 md:ml-[36px] bg-white text-black rounded outline-none"
              placeholder="Enter your username"
            />
          </div>
          <div className="mb-4 flex flex-col md:flex-row items-center">
            <label className="text-white text-sm font-semibold md:w-1/3">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full md:w-2/3 p-2 mt-2 md:mt-0 md:ml-[36px] bg-white text-black rounded outline-none"
              placeholder="Enter your password"
            />
          </div>
          <div className="text-right text-white">
            <Link to="/forgot-password" className="hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="m-6">
            <button
              type="submit"
              className="w-full bg-white text-black py-2 rounded font-semibold hover:bg-gray-300"
            >
              Login
            </button>
            <ToastContainer />
          </div>
          <div className="mt-4 text-center text-white">
            New user?{' '}
            <Link to="/signup" className="text-white hover:underline">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
