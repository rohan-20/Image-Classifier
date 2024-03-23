import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const UploadImage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await axios.post('http://localhost:5555/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Image uploaded successfully!');
      const data = response.data;
      const predictedClass = data.prediction;
      setPrediction(predictedClass);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-8 p-6 bg-red-100 shadow-md rounded-md">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Upload Images for Image Classification</h1>

      <div>
        <label className="relative cursor-pointer bg-pink-400 hover:bg-pink-600 text-white py-2 px-4 rounded-md w-full text-center inline-block">
          Choose Image
          <input type="file" onChange={handleFileChange} className="absolute top-0 left-0 h-full w-full opacity-0 cursor-pointer" />
        </label>
      </div>
      
      {selectedFile && (
        <div>
          <br />
          <img
            src={URL.createObjectURL(selectedFile)}
            alt='Preview'
            style={{width: '60%', marginTop: '10px'}}
          />
        </div>
      )}

      <div className="mt-4">
        {selectedFile && (
          <p className="text-sm text-gray-700">Selected File: {selectedFile.name}</p>
        )}
        <button onClick={handleUpload} className="bg-pink-400 text-white py-2 px-4 rounded-md mt-2 hover:bg-pink-600 focus:outline-none focus:shadow-outline-blue">
          Upload
        </button>
      </div>

      <Link to="/all-images" className="text-blue-500 hover:underline mt-4 block">
        View All Images
      </Link>
      
      {prediction !== null && (
        <div>
          <br />
          <h3>Prediction Result</h3>
          <p>{`Predicted class is a ${prediction}`}</p>
        </div>
      )}
    </div>
  );
};

export default UploadImage;

