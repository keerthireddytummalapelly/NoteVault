import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [reTypePassword, setReTypePassword] = useState('');

  const [tooltipContent, setTooltipContent] = useState([
    "- Password is required.",
    "- Password must be at least 8 characters long.",
    "- Password must be at most 20 characters long.",
    "- Password must contain at least one uppercase letter.",
    "- Password must contain at least one lowercase letter.",
    "- Password must contain at least one number.",
    "- Password must contain at least one special character (e.g., @, #, $, etc.).",
    "- Password should not contain any whitespace."
  ]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [tooltipClass, setTooltipClass] = useState('text-white');

  const validatePassword = (password) => {
    const minLength = 8;
    const maxLength = 20;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasWhitespace = /\s/.test(password);

    const unsatisfiedRules = new Set();

    if (password.length === 0) {
      unsatisfiedRules.add("- Password is required.");
      unsatisfiedRules.add("- Password must be at least 8 characters long.");
      unsatisfiedRules.add("- Password must be at most 20 characters long.");
      unsatisfiedRules.add("- Password must contain at least one uppercase letter.");
      unsatisfiedRules.add("- Password must contain at least one lowercase letter.");
      unsatisfiedRules.add("- Password must contain at least one number.");
      unsatisfiedRules.add("- Password must contain at least one special character (e.g., @, #, $, etc.).");
      unsatisfiedRules.add("- Password should not contain any whitespace.");
    } else {
      if (password.length < minLength) {
        unsatisfiedRules.add("- Password must be at least 8 characters long.");
      }
      if (password.length > maxLength) {
        unsatisfiedRules.add("- Password must be at most 20 characters long.");
      }
      if (!hasUpperCase) {
        unsatisfiedRules.add("- Password must contain at least one uppercase letter.");
      }
      if (!hasLowerCase) {
        unsatisfiedRules.add("- Password must contain at least one lowercase letter.");
      }
      if (!hasNumber) {
        unsatisfiedRules.add("- Password must contain at least one number.");
      }
      if (!hasSpecialChar) {
        unsatisfiedRules.add("- Password must contain at least one special character (e.g., @, #, $, etc.).");
      }
      if (hasWhitespace) {
        unsatisfiedRules.add("- Password should not contain any whitespace.");
      }
    }
    return Array.from(unsatisfiedRules);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setNewPassword(newPassword);
    const unsatisfiedRules = validatePassword(newPassword);
    if (unsatisfiedRules.length > 0) {
      setShowTooltip(true);
      setTooltipContent(unsatisfiedRules);
      setIsPasswordValid(false);
      setTooltipClass('text-white');
    } else {
      setShowTooltip(false);
      setIsPasswordValid(true);
    }
  };

  const handlePasswordClick = () => {
    setShowTooltip(true);
    setTooltipClass('text-white');
  };

  const handlePasswordBlur = () => {
    const unsatisfiedRules = validatePassword(newPassword);
    if (unsatisfiedRules.length > 0) {
      setTooltipClass('text-red-500');
      setIsPasswordValid(false);
    } else {
      setTooltipClass('text-white');
    }
  };

  const handleResetNewPassword = async (e) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      toast.error('Password requirements are not met');
      return;
    }

    if (newPassword !== reTypePassword) {
        toast.error('Passwords do not match');
        return;
    }
    try {
      const response = await fetch('http://52.7.128.221:8000/reset-new-password/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            email,
            new_password: newPassword,
            re_type_password: reTypePassword,
        }),
      });
      
      if (response.ok) {
          toast.success('Password reset successfully. You will be redirected to login page.');
          setTimeout(() => {
              navigate('/login');
          }, 3000);
      } else {
          const data = await response.json();
          toast.error(data.error || 'Failed to reset password');
      }
    } catch (err) {
        console.error('Error resetting password:', err);
        toast.error('An error occurred');
    }
  };
  
  return (
    <div className="min-h-screen bg-black flex items-center  p-4">
      <div className="flex flex-col lg:flex-row gap-24">
        <div className="flex flex-col items-center mt-5 lg:ml-48">
          <img src="/fp1.png" alt="Logo" className="w-60 h-48 sm:w-80 sm:h-64 mb-4" />
          <h3 className="text-white text-lg sm:text-xl font-semibold text-center">
            Forgot your password? <br />No worries, create a new one and get back on track!
          </h3>
        </div>
        <div className="bg-black p-8 sm:p-10 rounded-md max-w-md w-full border-2 border-white">
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleResetNewPassword}>
            <div className="mb-4 flex flex-col sm:flex-row items-center">
              <label className="text-white text-sm font-semibold w-full sm:w-1/3 mr-8">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-2 w-full sm:w-2/3 bg-white border border-black text-black rounded"
                placeholder="Enter username"
                required
              />
            </div>
            <div className="mb-4 flex flex-col sm:flex-row items-center">
              <label className="text-white text-sm font-semibold w-full sm:w-1/3 mr-8">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 w-full sm:w-2/3 bg-white border border-black text-black rounded"
                placeholder="Enter email"
                required
              />
            </div>
            <div className="mb-4 flex flex-col sm:flex-row items-center relative">
              <label className="text-white text-sm w-full sm:w-1/3 font-semibold mr-8">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={handlePasswordChange}
                onClick={handlePasswordClick}
                onBlur={handlePasswordBlur}
                className="p-2 w-full sm:w-2/3 bg-white border border-black text-black rounded"
                placeholder="Enter new password"
              />
              {showTooltip && (
                <div className="absolute left-full top-0 ml-2 p-2 bg-gray-900 rounded shadow-lg min-w-[330px] sm:block hidden">
                  <ul className={`${tooltipClass} text-sm`}>
                    {tooltipContent.map((message, index) => (
                      <li key={index}>{message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="mb-4 flex flex-col sm:flex-row items-center">
              <label className="text-white text-sm font-semibold w-full sm:w-1/3 mr-8">Re-type Password</label>
              <input
                type="password"
                value={reTypePassword}
                onChange={(e) => setReTypePassword(e.target.value)}
                className="p-2 w-full sm:w-2/3 bg-white border border-black text-black rounded"
                placeholder="Re-type new password"
              />
            </div>
            <div className="m-6">
              <button
                type="submit"
                className="w-full bg-white text-black py-2 rounded font-semibold hover:bg-gray-300"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default ForgotPassword;
