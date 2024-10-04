import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlusCircle, FaThumbtack, FaUserCircle, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { FiFilter } from 'react-icons/fi';
import { apiCallWithToken, logout } from '../api';

const Home = () => {
  const [notes, setNotes] = useState([]); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [filteredNotes, setFilteredNotes] = useState([]); 
  const [categories, setCategories] = useState([{ _id: 'all', title: 'All' }]); 
  const [selectedCategoryId, setSelectedCategoryId] = useState('all'); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [newCategoryTitle, setNewCategoryTitle] = useState(''); 
  const [visibleCategoryStartIndex, setVisibleCategoryStartIndex] = useState(0); // Track which categories to display
  const navigate = useNavigate();

  const categoriesToShow = 3; 

  // Fetch all categories initially
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await apiCallWithToken('http://localhost:8000/categories/');
        const categoriesData = await categoriesResponse.json();
        setCategories([{ _id: 'all', title: 'All' }, ...categoriesData]);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
  
    fetchCategories();
  }, []);

  // Fetch notes based on selected category
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        let notesResponse;
        if (selectedCategoryId === 'all') {
          notesResponse = await apiCallWithToken('http://localhost:8000/notes/');
        } else {
          notesResponse = await apiCallWithToken(`http://localhost:8000/notes/category/${selectedCategoryId}/`);
        }
        
        const notesData = await notesResponse.json();
        setNotes(notesData);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchNotes();
  }, [selectedCategoryId]); // Re-fetch notes when selectedCategoryId changes

  // Handle search and filtering
  useEffect(() => {
    let tempNotes = notes.filter((note) => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
    setFilteredNotes(tempNotes);
  }, [searchQuery, notes]);

  // Handle note pin/unpin
  const togglePin = (noteId) => {
    const updatedNotes = notes.map((note) =>
      note._id === noteId ? { ...note, pinned: !note.pinned } : note
    );
    setNotes(updatedNotes);
  };

  // Handle adding a new category
  const addNewCategory = async () => {
    if (newCategoryTitle.trim()) {
      const token = localStorage.getItem('token');
      try {
        const response = await apiCallWithToken('http://localhost:8000/categories/create/', {
          method: 'POST',
          body: JSON.stringify({ title: newCategoryTitle }),
        });

        if (response.ok) {
          const category = await response.json();
          setCategories([...categories, category]); 
          setSelectedCategoryId(category._id); 
          setNewCategoryTitle('');
          setIsModalOpen(false); 
        } else {
          console.error('Failed to create category');
        }
      } catch (error) {
        console.error('Error creating category:', error);
      }
    }
  };

  // Navigate through categories using arrow buttons
  const handlePrevCategory = () => {
    if (visibleCategoryStartIndex > 0) {
      setVisibleCategoryStartIndex(visibleCategoryStartIndex - 1);
    }
  };

  const handleNextCategory = () => {
    if (visibleCategoryStartIndex + categoriesToShow < categories.length) {
      setVisibleCategoryStartIndex(visibleCategoryStartIndex + 1);
    }
  };

  // Navigate to note detail page
  const handleNoteClick = (noteId) => {
    navigate(`/edit-note/${noteId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
     

      {/* Search and Filter Section */}
      <div className="flex items-center w-full max-w-5xl mb-4 space-x-4">
        <div className="flex items-center bg-gray-700 rounded-full px-4 py-2 w-3/5">
          <FaSearch className="text-white mr-2" />
          <input
            type="text"
            placeholder="Search a Note"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent focus:outline-none text-white w-full"
          />
        </div>

        {/* Category Tabs with Left/Right Arrows */}
        <div className="flex items-center space-x-2">
          {/* Left Arrow */}
          {visibleCategoryStartIndex > 0 && (
            <button className="bg-gray-700 py-2 px-4 rounded-full" onClick={handlePrevCategory}>
              <FaArrowLeft className="text-white" />
            </button>
          )}

          {/* Category Filter Buttons */}
          {categories
            .slice(visibleCategoryStartIndex, visibleCategoryStartIndex + categoriesToShow)
            .map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`py-2 px-4 rounded-full ${
                  selectedCategoryId === category.id ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                {category.title}
              </button>
            ))}

          {/* Right Arrow */}
          {visibleCategoryStartIndex + categoriesToShow < categories.length && (
            <button className="bg-gray-700 py-2 px-4 rounded-full" onClick={handleNextCategory}>
              <FaArrowRight className="text-white" />
            </button>
          )}

          {/* Add new category button */}
          <button
            className="bg-gray-700 py-2 px-4 rounded-full"
            onClick={() => setIsModalOpen(true)} // Open the modal when "+" button is clicked
          >
            <FaPlusCircle className="text-white" />
          </button>
        </div>

      
      </div>

      {/* Notes Display */}
      <div className="w-full max-w-5xl grid grid-cols-3 gap-4">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div
              key={note._id}
              className="bg-gray-800 p-4 rounded-lg shadow-lg relative cursor-pointer"
              onClick={() => handleNoteClick(note.id)} // Navigate to note detail on click
            >
              <h3 className="text-xl font-bold">{note.title}</h3> {/* Display note title */}
              <p className="text-gray-400">{note.content}</p> {/* Display note content */}
              <span className="text-sm text-gray-400">#{note.category.title}</span> {/* Display category title */}

              {/* Pin Icon */}
              <FaThumbtack
                className={`absolute top-2 right-2 cursor-pointer ${
                  note.pinned ? 'text-yellow-400' : 'text-gray-400'
                }`}
                onClick={() => togglePin(note._id)}
              />
            </div>
          ))
        ) : (
          <p className="text-gray-400">No notes available in this category.</p>
        )}
      </div>

      {/* Create New Note Button */}
      <button
        onClick={() => navigate('/create-note')}
        className="fixed bottom-10 right-10 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full flex items-center"
      >
        <FaPlusCircle className="mr-2" /> Create a new Note
      </button>

      {/* Modal for creating a new category */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-2xl mb-4">Create New Category</h3>
            <input
              type="text"
              className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded"
              placeholder="Enter category title"
              value={newCategoryTitle}
              onChange={(e) => setNewCategoryTitle(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)} // Close modal
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={addNewCategory} // Save new category
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
