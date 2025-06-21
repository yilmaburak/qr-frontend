import { useState } from 'react';
import axios from '../services/api';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

function CreateQR() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/qrcodes', { content, title, description });
      alert('QR Code created');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to create QR code');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Create QR Code</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          className="w-full p-2 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <textarea
          placeholder="Content (URL, Text, etc)"
          className="w-full p-2 border rounded"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Create QR
        </button>
      </form>
    </DashboardLayout>
  );
}

export default CreateQR;
