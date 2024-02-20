import React, { useState, useEffect } from 'react';
import axios from 'axios';  
import { Link } from 'react-router-dom';

const AllImages = () => {
  const [images, setImages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://localhost:5555/images');
        setImages(response.data);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  const handleText = () => {
    const data = {
      text,
    };

    axios.post('http://localhost:5555/text', data);

  }

  const handleDelete = async (imageId) => {
    try {
      await axios.delete(`http://localhost:5555/images/${imageId}`);
      setImages((prevImages) => prevImages.filter((image) => image._id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };


  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-red-100 shadow-md rounded-md">
      <h2 className="text-2xl text-center font-bold mb-4">All Images</h2>
      <div className="grid grid-cols-2 gap-4">
        {images.map((image) => (
          <div key={image._id} className="flex flex-col items-center">
            <img
              src={`http://localhost:5555/uploads/${image.filename}`}
              alt={image.filename}
              className="w-80 h-100 object-cover mb-2"
            />
            <input type='text' value={text} onChange={(e) => setText(e.target.value)} className='input-field-outline w-full border border-gray-300 p-2 rounded' />
            <button onClick={handleText} className='flex items-center bg-blue-500 text-white px-6 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-gray-700 focus:outline-none focus:shadow-outline-blue'>
              Add
            </button>
            <button
              onClick={() => handleDelete(image._id)}
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">
              Delete
            </button> 
          </div>
        ))}
      </div>

      <Link to="/" className="text-blue-500 hover:underline mt-4 block">
        Home
      </Link>

    </div>
  );
  };




export default AllImages;