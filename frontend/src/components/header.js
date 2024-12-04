import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const Header = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [firstName, setFirstName] = useState(
    localStorage.getItem("firstName") || "");
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("firstName")
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUsername("");
    setIsSidebarOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    const storedUsername = localStorage.getItem("username");
    setIsAuthenticated(!!token);
    setUsername(storedUsername || "");
  }, [setIsAuthenticated]);

  return (
    <div>
      <header className="flex justify-between items-center p-4 bg-black text-white shadow-md">
        <div
          className="flex items-center space-x-1 group"
          onClick={() => {
            navigate("/");
          }}
        >
          <img src="/Logo.png" alt="Logo" className="w-16 h-10" />
          <h1 className="text-2xl font-semibold cursor-pointer">NoteVault</h1>
        </div>

        <div className="flex items-center space-x-4">
          <p className="text-lg">Hello, {firstName }</p>
          <button
            onClick={toggleSidebar}
            className="text-2xl focus:outline-none"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50"
          onClick={toggleSidebar}
        >
          <nav
            className="fixed top-0 right-0 w-64 bg-black text-white h-full p-4 shadow-lg z-60"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              to="/profile"
              className="text-center text-lg text-white hover:bg-gray-500 p-2 rounded mt-14 block w-full"
              onClick={() => setIsSidebarOpen(false)}
            >
              View Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-center text-lg text-white hover:bg-gray-500 p-2 rounded mt-4 block w-full"
            >
              Logout
            </button>
          </nav>
        </div>
      )}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      ></div>
    </div>
  );
};

export default Header;
