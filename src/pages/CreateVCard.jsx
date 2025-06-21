import { useState } from 'react';
import axios from '../services/api';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

function CreateVCard() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    company: '',
    website: '',
    address: '',
    titleText: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/qrcodes/vcard', form);
      alert('vCard QR created');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to create vCard QR');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Create vCard QR Code</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input name="firstName" type="text" placeholder="First Name" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input name="lastName" type="text" placeholder="Last Name" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" className="w-full p-2 border rounded" onChange={handleChange} />
        <input name="phone" type="text" placeholder="Phone" className="w-full p-2 border rounded" onChange={handleChange} />
        <input name="title" type="text" placeholder="Job Title" className="w-full p-2 border rounded" onChange={handleChange} />
        <input name="company" type="text" placeholder="Company" className="w-full p-2 border rounded" onChange={handleChange} />
        <input name="website" type="text" placeholder="Website" className="w-full p-2 border rounded" onChange={handleChange} />
        <input name="address" type="text" placeholder="Address" className="w-full p-2 border rounded" onChange={handleChange} />
        <input name="titleText" type="text" placeholder="QR Title" className="w-full p-2 border rounded" onChange={handleChange} />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Create vCard QR
        </button>
      </form>
    </DashboardLayout>
  );
}

export default CreateVCard;
