import { useEffect, useState } from 'react';
import axios from '../services/api';
import DashboardLayout from '../components/DashboardLayout';

function Dashboard() {
  const [qrcodes, setQRCodes] = useState([]);

  const fetchQRCodes = async () => {
    try {
      const res = await axios.get('/qrcodes');
      setQRCodes(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load QR codes');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this QR Code?')) {
      try {
        await axios.delete(`/qrcodes/${id}`);
        fetchQRCodes();
      } catch (err) {
        console.error(err);
        alert('Failed to delete QR code');
      }
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">My QR Codes</h1>
      {qrcodes.length === 0 ? (
        <p>No QR Codes yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {qrcodes.map((qr) => (
            <div key={qr.id} className="border p-4 rounded bg-white shadow">
              <h2 className="font-bold text-lg mb-2">{qr.title}</h2>
              <p className="text-sm mb-2">{qr.description}</p>
              <img
                src={qr.base64Image}
                alt={qr.title}
                className="w-32 h-32 mb-2"
              />
              <div className="flex flex-wrap space-x-2 mt-2">
                <a
                  href={`http://localhost:8080/api/qrcodes/${qr.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                >
                  Download PDF
                </a>
                <button
                  onClick={() => handleDelete(qr.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Dashboard;
