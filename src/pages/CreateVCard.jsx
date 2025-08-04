import { useState } from 'react';
import axios from '../services/api';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

function CreateVCard() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');

  const navigate = useNavigate();

  const handleLogoUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoBase64(reader.result.split(',')[1]); // sadece base64
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/vcards', {
        firstName,
        lastName,
        email,
        phone,
        company,
        title,
        website,
        address,
        foregroundColor,
        backgroundColor,
        logoBase64,
      });
      alert('vCard QR created');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to create vCard QR');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Create vCard QR</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="First Name"
            className="w-1/2 p-2 border rounded"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            className="w-1/2 p-2 border rounded"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="tel"
          placeholder="Phone"
          className="w-full p-2 border rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="text"
          placeholder="Company"
          className="w-full p-2 border rounded"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="url"
          placeholder="Website"
          className="w-full p-2 border rounded"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />

        <input
          type="text"
          placeholder="Address"
          className="w-full p-2 border rounded"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="flex flex-col space-y-2">
          <label className="font-semibold">Upload Logo (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleLogoUpload(e.target.files[0])}
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex flex-col space-y-1">
            <label className="font-semibold">Foreground Color</label>
            <input
              type="color"
              value={foregroundColor}
              onChange={(e) => setForegroundColor(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-semibold">Background Color</label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Create vCard QR
        </button>
      </form>
    </DashboardLayout>
  );
}

export default CreateVCard;
