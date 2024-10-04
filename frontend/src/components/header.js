import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

const Header = ({ isAuthenticated, setIsAuthenticated }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  // Toggle sidebar open/close
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username'); // Also remove username if stored
    setIsAuthenticated(false); // Update login state
    setIsSidebarOpen(false); // Close sidebar
    navigate('/login'); // Redirect to login page
  };

  useEffect(() => {
    const token = localStorage.getItem('access');
    setIsAuthenticated(!!token); // Set login status based on token presence
  }, [setIsAuthenticated]);

  return (
    <div className="relative">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-gray-900 text-white shadow-md">
        <h1 className="text-3xl font-bold">NoteVault</h1>

        {/* Conditionally show username and menu icon based on login status */}
        <div className="flex items-center space-x-4">
          {isAuthenticated && <p className="text-lg">Hello {username}</p>}
          {isAuthenticated && <FaUserCircle className="text-2xl" />}
          <button onClick={toggleSidebar} className="text-2xl focus:outline-none">
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <nav
        className={`fixed top-0 right-0 h-full w-64 bg-gray-800 text-white transform ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out shadow-lg`}
      >
        <div className="flex flex-col p-4 space-y-4">
          <h2 className="text-2xl font-bold">Menu</h2>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="text-lg hover:bg-gray-700 p-2 rounded">
                Profile
              </Link>
              <button onClick={handleLogout} className="text-lg hover:bg-gray-700 p-2 rounded">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="text-lg hover:bg-gray-700 p-2 rounded">
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleSidebar}></div>
      )}
    </div>
  );
};

export default Header;
