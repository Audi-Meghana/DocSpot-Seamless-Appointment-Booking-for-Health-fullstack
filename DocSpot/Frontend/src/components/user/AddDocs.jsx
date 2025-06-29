import React, { useState } from 'react';
import axios from 'axios';

const AddDocs = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('userId', localStorage.getItem('userId')); // use auth data accordingly

    try {
      const res = await axios.post('/api/v1/doctor/uploaddoc', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (res.data.success) {
        setMessage('File uploaded successfully.');
      } else {
        setMessage('Upload failed. Try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h3>Upload Document</h3>
      <input type="file" onChange={handleFileChange} className="form-control mb-3" />
      <button className="btn btn-primary" onClick={handleUpload}>Upload</button>
      {message && <p className="mt-3">{message}</p>}
    </div>
  );
};

export default AddDocs;
