import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { apiCallWithToken, logout } from '../api';

const Editor = () => {
  const { noteId } = useParams(); // Get noteId from the URL params
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(''); // Set category as the category ID
  const [categories, setCategories] = useState([]); // List of categories
  const [note, setNote] = useState('');
  const [newCategory, setNewCategory] = useState(''); // To create a new category
  const [isModalOpen, setIsModalOpen] = useState(false); // Manage modal state
  const navigate = useNavigate();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiCallWithToken('http://localhost:8000/categories', { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setCategories(data); // Store categories
        } else {
          console.error('Token expired, logging out...');
          logout();
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch the existing note if noteId is provided
  useEffect(() => {
    if (noteId) {
      const fetchNote = async () => {
        try {
          const response = await apiCallWithToken(`http://localhost:8000/notes/${noteId}`, { method: 'GET' });
          if (response.ok) {
            const data = await response.json();
            setTitle(data.title);
            setCategory(data.category); // Set the category ID from the note data
            setNote(data.content);
          } else {
            console.error('Failed to fetch note');
          }
        } catch (error) {
          console.error('Error fetching note:', error);
        }
      };
      fetchNote();
    }
  }, [noteId]);

  // Handle new category creation
  const handleNewCategory = async () => {
    try {
      const response = await apiCallWithToken('http://localhost:8000/categories/create/', {
        method: 'POST',
        body: JSON.stringify({ title: newCategory }),
      });

      if (response.ok) {
        const categoryData = await response.json();
        setCategories([...categories, categoryData]); // Add the new category to the list
        setCategory(categoryData.id); // Set it as the selected category
        setNewCategory(''); // Clear the input field
        setIsModalOpen(false); // Close the modal
      } else {
        console.error('Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  // Reset the form
  const handleReset = () => {
    setTitle('');
    setCategory('');
    setNote('');
  };

  // Handle saving the note
  const handleSave = async () => {
    try {
      const response = await apiCallWithToken(noteId ? `http://localhost:8000/notes/update/${noteId}/` : 'http://localhost:8000/notes/create/', {
        method: noteId ? 'PUT' : 'POST',
        body: JSON.stringify({ title, category, content: note }),
      });

      if (response.ok) {
        const savedNote = await response.json();
        console.log('Note saved:', savedNote);
        handleReset(); // Reset the form after saving
        navigate('/home'); // Redirect back to the home page
      } else {
        console.error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  // Handle deleting the note
  const handleDelete = async () => {
    if (noteId) {
      try {
        const response = await apiCallWithToken(`http://localhost:8000/notes/delete/${noteId}/`, { method: 'DELETE' });
        if (response.ok) {
          console.log('Note deleted successfully');
          navigate('/home'); // Redirect back to the home page
        } else {
          console.error('Failed to delete note');
        }
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <div className="w-full max-w-5xl bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{noteId ? 'Edit Note' : 'Create Note'}</h2>
          <div>
            {noteId && (
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
              >
                Delete
              </button>
            )}
            <button
              onClick={handleReset}
              className="ml-4 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
            >
              Reset
            </button>
            <button
              onClick={() => navigate('/')}
              className="ml-4 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2" htmlFor="title">
            Title
          </label>
          <input
            type="text"
            id="title"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
            required
          />
        </div>

        {/* Category Input */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2" htmlFor="category">
            Select Category
          </label>
          <div className="flex items-center">
            <select
              id="category"
              className="w-3/4 p-2 bg-gray-700 border border-gray-600 rounded"
              value={category} // Bind the selected category ID here
              onChange={(e) => setCategory(e.target.value)} // Set selected category ID
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>

            {/* Button to open modal for new category */}
            <button
              onClick={() => setIsModalOpen(true)} // Open the modal when clicked
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              New Category
            </button>
          </div>
        </div>

        {/* Note Input */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2" htmlFor="note">
            Note Content
          </label>
          <textarea
            id="note"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded h-48"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type your note here..."
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Save
          </button>
        </div>
      </div>

      {/* Modal for creating a new category */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-2xl mb-4">Create New Category</h3>
            <input
              type="text"
              className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded"
              placeholder="Enter new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)} // Close modal
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleNewCategory} // Save new category
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

export default Editor;
