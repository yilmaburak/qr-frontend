import { deleteQRCode } from '../services/qr';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const QrCard = ({ data: qr }: any) => {
    const navigate = useNavigate();

    const handleDelete = async (publicId: any) => {
        if (window.confirm('Are you sure you want to delete this QR Code?')) {
            try {
                await deleteQRCode(publicId);
            } catch (err) {
                console.error(err);
                toast.error('Failed to delete QR code');
            }
        }
    };

    const handleCopyLink = (id: any) => {
        const publicUrl = `http://localhost:5173/qrcodes/public/${id}`;
        navigator.clipboard.writeText(publicUrl).then(() => {
            toast.success('Public link copied to clipboard!');
        });
    };

    return (
        <div key={qr.id} className="p-4 rounded-lg bg-[#171717] ">
            <h2 className="font-bold text-lg mb-2">{qr.title}</h2>
            <p className="text-sm mb-2">{qr.description}</p>
            <img
                src={`http://localhost:8080/api/qrcodes/public/image/${qr.publicId}`}
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
                    onClick={() => handleDelete(qr.publicId)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                >
                    Delete
                </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">Scans: {qr.scanCount}</p>
        </div>
    )
}

export default QrCard