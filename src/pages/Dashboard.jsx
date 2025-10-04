import { useEffect, useState } from 'react';
// import axios from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [qrcodes, setQRCodes] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  const fetchQRCodes = async () => {
    // try {
    //   const res = await axios.get('/qrcodes', {
    //     params: {
    //       page,
    //       size,
    //       filter,
    //     },
    //   });
    //   setQRCodes(res.data.content);
    //   setTotalPages(res.data.totalPages);
    // } catch (err) {
    //   console.error(err);
    //   alert('Failed to load QR codes');
    // }
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

  const handleCopyLink = (id) => {
    const publicUrl = `http://localhost:5173/public/qr/${id}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      alert('Public link copied to clipboard!');
    });
  };

  useEffect(() => {
    fetchQRCodes();
  }, [page, size, filter]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">My QR Codes</h1>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Filter by title or description"
          className="p-2 border rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        >
          {[6, 12, 24].map((s) => (
            <option key={s} value={s}>
              {s} per page
            </option>
          ))}
        </select>
      </div>

      {qrcodes.length === 0 ? (
        <p>No QR Codes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {qrcodes.map((qr) => (
            <div key={qr.id} className="border p-4 rounded bg-white shadow">
              <h2 className="font-bold text-lg mb-2">{qr.title}</h2>
              <p className="text-sm mb-2">{qr.description}</p>
              <img
  src={`http://localhost:8080/api/public/qr/image/${qr.publicId}`}
  alt={qr.title}
  className="w-32 h-32"
/>
              <div className="flex flex-wrap space-x-2 mt-2">
                <button
                  onClick={() => navigate(`/dashboard/edit/${qr.id}`)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleCopyLink(qr.publicId)}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                >
                  Copy Public Link
                </button>
                <a
                  href={`http://localhost:8080/api/qrcodes/${qr.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-indigo-500 text-white px-2 py-1 rounded text-sm"
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
              <p className="text-sm text-gray-600 mt-2">Scans: {qr.scanCount}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-6 space-x-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-1 bg-gray-100 rounded">
          Page {page + 1} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
          disabled={page + 1 >= totalPages}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
