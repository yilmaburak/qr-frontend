import { useState, useEffect } from 'react';
// import axios from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

function EditQR() {
  const { id } = useParams();
  const [qrData, setQRData] = useState({
    title: '',
    description: '',
    content: '',
  });
  const navigate = useNavigate();

  const fetchQR = async () => {
    // try {
    //   const res = await axios.get(`/qrcodes`);
    //   const foundQR = res.data.find((qr) => qr.id === parseInt(id));
    //   if (foundQR) {
    //     setQRData({
    //       title: foundQR.title,
    //       description: foundQR.description,
    //       content: foundQR.content,
    //     });
    //   } else {
    //     alert('QR Code not found');
    //     navigate('/dashboard');
    //   }
    // } catch (err) {
    //   console.error(err);
    //   alert('Failed to load QR code');
    // }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/qrcodes/${id}`, qrData);
      alert('QR Code updated');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to update QR code');
    }
  };

  useEffect(() => {
    fetchQR();
  }, [id]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Edit QR Code</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border rounded"
          value={qrData.title}
          onChange={(e) => setQRData({ ...qrData, title: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Description"
          className="w-full p-2 border rounded"
          value={qrData.description}
          onChange={(e) =>
            setQRData({ ...qrData, description: e.target.value })
          }
        />
        <textarea
          placeholder="Content (URL, Text, etc)"
          className="w-full p-2 border rounded"
          value={qrData.content}
          onChange={(e) => setQRData({ ...qrData, content: e.target.value })}
          required
        ></textarea>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Update QR
        </button>
      </form>
    </DashboardLayout>
  );
}

export default EditQR;
