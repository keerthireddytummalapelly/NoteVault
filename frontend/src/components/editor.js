import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { apiCallWithToken, logout } from '../api';
import { FaTrashAlt, FaTimes } from 'react-icons/fa';  
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdRefresh } from "react-icons/md";
import { FaMicrophone, FaStop, FaSpinner } from 'react-icons/fa';
import { IoClose } from "react-icons/io5";
import { GiAnticlockwiseRotation } from "react-icons/gi";


const Editor = () => {
  const { noteId } = useParams(); 
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [note, setNote] = useState('');
  const [prevNote, setPrevNote] = useState('');
  const [newCategory, setNewCategory] = useState(''); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isRecording, setIsRecording] = useState(false);
  const [fontSize, setFontSize] = useState(16); 
  const [fontStyle, setFontStyle] = useState('Calibri Body'); 
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [undo, setUndo] = useState(false);
  
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleUndo = () => {
    setUndo(false);
    setNote(prevNote);
    setPrevNote('');
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const openResetModal = () => {
    
    setIsResetModalOpen(true);
  };

  const closeResetModal = () => {
    setIsResetModalOpen(false);
  };
  
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-screen">
      <FaSpinner className="animate-spin text-black text-4xl" />
    </div>
  );


  useEffect(() => {
    setLoading(true);
    try{
      if ('webkitSpeechRecognition' in window) {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
    
        let interimTranscript = '';
    
        recognition.onresult = (event) => {
          let finalTranscript = '';
          interimTranscript = '';
    
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.trim();
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript + ' ';
            }
          }
          setNote((prevNote) => prevNote.trim() + ' ' + finalTranscript.trim());
        };
    
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          toast.error('Speech recognition error occurred.');
          setIsRecording(false);
        };
    
        recognition.onend = () => {
          setIsRecording(false);
        };
    
        recognitionRef.current = recognition;
      } else {
        console.error('Web Speech API not supported in this browser.');
        toast.error('Speech recognition not supported in this browser.');
      }
    }finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchCategories = async () => {
      try {
        const response = await apiCallWithToken('http://52.7.128.221:8000/categories', { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setCategories(data); 
        } else {
          console.error('Token expired, logging out...');
          logout();
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (noteId) {
      setLoading(true);
      const fetchNote = async () => {
        try {
          const response = await apiCallWithToken(`http://52.7.128.221:8000/notes/${noteId}`, { method: 'GET' });
          if (response.ok) {
            const data = await response.json();
            console.log("data", data);
            setTitle(data.title);
            setCategory(data.category);
            setNote(data.content);
            setFontSize(data.font_size || 16);
            setFontStyle(data.font_style || 'Calibri Body');
          } else {
            console.error('Failed to fetch note');
          }
        } catch (error) {
          console.error('Error fetching note:', error);
        }finally {
          setLoading(false);
        }
      };
      fetchNote();
    }
  }, [noteId]);

  const handleNewCategory = async () => {
    try {
      const response = await apiCallWithToken('http://52.7.128.221:8000/categories/create/', {
        method: 'POST',
        body: JSON.stringify({ title: newCategory }),
      });

      if (response.ok) {
        const categoryData = await response.json();
        setCategories([...categories, categoryData]); 
        setCategory(categoryData.id); 
        setNewCategory('');
        setIsModalOpen(false);
      } else {
        console.error('Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleReset = () => {
    setIsResetModalOpen(false);
    setNote('');
    setUndo(false);
  };

  const handleSave = async () => {
    if (!title) {
      toast.info("Please fill in the title for the note." ,{
        style: {
          backgroundColor: '#2196F3',  
          color: 'white',               
          borderRadius: '8px',          
          padding: '10px',             
        },
          position: "top-center",
          autoClose: 2000 , 
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
    });
      return;
    } else if (!category) {
      toast.info("Please select a category." , {
        style: {
          backgroundColor: '#2196F3',  
          color: 'white',               
          borderRadius: '8px',          
          padding: '10px',             
        },
          position: "top-center",
          autoClose: 2000 , 
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
    });
      return;
    } else if (!note) {
      toast.info("Please fill in the content for the note.", {
        style: {
          backgroundColor: '#2196F3',  
          color: 'white',               
          borderRadius: '8px',          
          padding: '10px',             
        },
          position: "top-center",
          autoClose: 2000 , 
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
    });
      return;
    }

    try {
      console.log("font size", fontStyle);
      const response = await apiCallWithToken(noteId ? `http://52.7.128.221:8000/notes/update/${noteId}/` 
                                                      : 'http://52.7.128.221:8000/notes/create/', {
        method: noteId ? 'PUT' : 'POST',
        body: JSON.stringify({ title, category, content: note, font_size: parseInt(fontSize), font_style: fontStyle, font_style: fontStyle }),  // Pass font style in the request
      });

      if (response.ok) {
        const savedNote = await response.json();
        console.log('Note saved:', savedNote);
        handleReset(); 
        navigate('/home');
      } else {
        console.error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDelete = async () => {
    if (noteId) {
      try {
        const response = await apiCallWithToken(`http://52.7.128.221:8000/notes/delete/${noteId}/`, { method: 'DELETE' });
        if (response.ok) {
          console.log('Note deleted successfully');
          toast.success('Note deleted successfully');
          navigate('/home'); 
        } else {
          console.error('Failed to delete note');
        }
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleCheckGrammar = async () => {
    try {
      toast.info("Checking spelling and grammar...", {
        position: "top-center",
        autoClose: 2000,
      });
  
      const response = await apiCallWithToken('http://52.7.128.221:8000/check_grammar/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: note }),
      });
  
      if (response.ok) {
        const data = await response.json();
  
        if (data.message === "No fix required!") {
          toast.info("No fix required!!!", {
            position: "top-center",
            autoClose: 2000,
          });
        } else if (data.correctedText) {
          setPrevNote(note);
          setUndo(true);
          setNote(data.correctedText);
          toast.success("Spelling and grammar fixed successfully.", {
            position: "top-center",
            autoClose: 2000,
          });
        } else {
          toast.error("Unexpected response from the server.", {
            position: "top-center",
            autoClose: 2000,
          });
        }
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.message || "Failed to fix spelling and grammar. Please try again!!!",
          {
            position: "top-center",
            autoClose: 2000,
          }
        );
      }
    } catch (error) {
      console.error('Error fixing spelling and grammar:', error);
      toast.error("An error occurred while fixing grammar. Please try again later.", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };
  
  
  const handleSummarize = async () => {
    try {
      
      toast.info("Summarizing text...", {
        position: "top-center",
        autoClose: 1500,
      });
  
      
      const response = await apiCallWithToken('http://52.7.128.221:8000/summarize/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: note }),
      });
  
      
      if (response.ok) {
        const data = await response.json();
        if (data.summary) {
          setPrevNote(note);
          setUndo(true);
          setNote(data.summary);
          toast.success("Text summarized successfully.", {
            position: "top-center",
            autoClose: 2000,
          });
        } else {
          
          toast.error("Unexpected response from the server.", {
            position: "top-center",
            autoClose: 2000,
          });
        }
      } else {
        
        const errorData = await response.json();
        toast.error(
          errorData.message || "Failed to summarize text. Please try again.",
          {
            position: "top-center",
            autoClose: 2000,
          }
        );
      }
    } catch (error) {
      
      console.error('Error summarizing text:', error);
      toast.error("An error occurred while summarizing. Please try again later.", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };
  

  const startTranscription = () => {
    if (recognitionRef.current) {
      toast.info("Recording in progress...", {
        position: "top-center",
        autoClose: 1500,
      });
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopTranscription = () => {
    if (recognitionRef.current) {
      toast.info("Recording Stopped!!!", {
        position: "top-center",
        autoClose: 1500,
      });
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-white flex flex-col items-center p-4">
      {loading && <LoadingSpinner />}
      <div className="w-full bg-white pt-2 pb-2">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-black">{noteId ? 'Edit Note' : 'Create Note'}</h2>
          <div>
            {noteId && (
              <button
                onClick={openDeleteModal}
                className=" text-gray-600 hover:text-black py-2 px-4 rounded"
                title='Delete'
              >
                <FaTrashAlt className="text-2xl" /> 
              </button>
            )}
            <button
              onClick={openResetModal}
              className=" text-gray-600 hover:text-black py-2 px-4 rounded font-extrabold"
              title='Reset'
            >
              <GiAnticlockwiseRotation className="text-2xl font-extrabold" />
            </button>
            <button
              onClick={() => navigate('/')}
              className=" text-gray-600 hover:text-black py-2 px-4 rounded"
              title='Close'
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>
        </div>

        <div className="mb-4 flex space-x-4">
          <div className="flex-1 flex items-center space-x-2">
            <label className="text-black text-lg" htmlFor="title">
              Title:
            </label>
            <input
              type="text"
              id="title"
              className="w-full p-1 bg-white border text-black border-black rounded outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              required
            />
          </div>

          <div className="flex-1 flex items-center space-x-2">
            <label className="text-black text-lg" htmlFor="category">
              Category:
            </label>
            <div className="flex items-center space-x-2 w-full">
              <select
                id="category"
                className="w-full p-[0.4rem] bg-white border text-black border-black rounded-md outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-black hover:bg-gray-600 border border-black text-white p-[0.35rem] px-4 rounded-md"
              >
                New
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4 flex gap-3">
          <label className="text-black text-lg mt-1" htmlFor="font-size">
            Font Size:
          </label>
          <select
            id="font-size"
            className="w-[80px] p-2 border border-black rounded-md text-black"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
          >
            <option value="12">12px</option>
            <option value="14">14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
            <option value="20">20px</option>
            <option value="22">22px</option>
            <option value="24">24px</option>
          </select>
          <div className= "ml-3">
          <label className="text-black text-lg mt-1 mr-3" htmlFor="font-style">
            Font Style:
          </label>
          <select
            id="font-style"
            className="w-[200px] p-2 border border-black rounded-md text-black "
            value={fontStyle}
            onChange={(e) => setFontStyle(e.target.value)}
          >
            <option value="Calibri Body">Calibri Body</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Tahoma">Tahoma</option>
            <option value="Impact">Impact</option>
            <option value="cursive">Cursive</option>
          </select>
          </div>
        </div>

        <div className="mt-6 mb-4 relative">
          <textarea
            id="note"
            className="w-full px-2 bg-white text-black border border-black rounded-md h-96 outline-none"
            value={note}
            onChange={(e) => {setNote(e.target.value); setUndo(false)}}
            placeholder="Type your note here..."
            required
            style={{
              backgroundImage: `linear-gradient(to bottom, #d3d3d3 1px, transparent 1px)`,
              backgroundSize: `100% 2rem`, 
              lineHeight: `2rem`, 
              fontFamily: 
                          fontStyle === 'Times New Roman' ? '"Times New Roman", Times, serif' :
                          fontStyle === 'Calibri Body' ? '"Calibri", sans-serif' :
                          fontStyle === 'Georgia' ? 'Georgia, serif' :
                          fontStyle === 'Tahoma' ? 'Tahoma, Geneva, sans-serif' :
                          fontStyle === 'Impact' ? 'Impact, Charcoal, sans-serif' :
                          fontStyle === 'cursive' ? 'cursive' :
                          'Arial, sans-serif',
              fontSize: `${fontSize}px`,
              paddingTop: '0.3rem',
            }}
          />
          {/* <button
            onClick={isRecording ? stopTranscription : startTranscription}
            className={`absolute bottom-5 right-4 p-2 rounded-full hover:bg-gray-600 ${
              isRecording ? 'bg-black' : 'bg-black'
            }`}
          >
            {isRecording ? <FaStop className="text-white text-xl" /> : <FaMicrophone className="text-white text-xl" />}
          </button> */}
        </div>

        <div className="flex justify-end">
          {undo && (
            <button
              onClick={handleUndo}
              className="bg-red-500 hover:bg-red-600 border border-red-500 text-white py-2 px-4 rounded mr-4"
            >
              Undo AI Effect
            </button>
          )}
          <button
            onClick={handleCheckGrammar}
            className="bg-black hover:bg-gray-600 border border-black text-white py-2 px-4 rounded mr-4"
          >
            Fix Spelling and Grammar
          </button>
          <button
            onClick={handleSummarize}
            className="bg-black hover:bg-gray-600 border border-black text-white py-2 px-4 rounded mr-4"
          >
            Summarize with AI
          </button>
          <button
            onClick={handleSave}
            className="bg-black hover:bg-gray-700 border border-black text-white py-2 px-4 rounded"
          >
            {noteId ? 'Update Note' : 'Save'}
          </button>
          <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-white p-6 rounded-md w-1/3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-xl text-black hover:text-gray-600 p-2"
              aria-label="Close"
            >
              <IoClose />
            </button>
            <h3 className="text-2xl mb-4 text-black">Create New Category</h3>
            <input
              type="text"
              className="w-full p-2 mb-4 bg-white border border-gray-600 text-black placeholder-gray-400 rounded"
              placeholder="Enter category title"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-black hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleNewCategory} 
                className="bg-black hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="relative bg-white p-8 rounded-md w-1/3 text-black border border-black">
        
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-2 right-2 text-xl text-black hover:text-gray-600 p-2"
              aria-label="Close"
            >
              <IoClose />
            </button>
            <h3 className="text-2xl  mb-6 text-black">
              Are you sure you want to delete this note?
            </h3>

            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className="bg-black hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                No
              </button>
              <button
                onClick={() => handleDelete()}
                className="bg-black hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      {isResetModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="relative bg-white p-8 rounded-md w-1/3 text-black border border-black">
        
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="absolute top-2 right-2 text-xl text-black hover:text-gray-600 p-2"
              aria-label="Close"
            >
              <IoClose />
            </button>
            <h3 className="text-2xl  mb-6 text-black">
              Are you sure you want to clear this note?
            </h3>

            <div className="flex justify-end space-x-4">
              <button
                onClick={closeResetModal}
                className="bg-black hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                No
              </button>
              <button
                onClick={handleReset}
                className="bg-black hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;