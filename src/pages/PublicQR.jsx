import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

function PublicQR() {
  const { publicId } = useParams();
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (publicId) {
      setQrUrl(`http://localhost:8080/api/public/qr/image/${publicId}`);
    }
  }, [publicId]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Public QR Code</h1>
      {qrUrl ? (
        <img src={qrUrl} alt="Public QR Code" className="w-64 h-64 border p-2 bg-white shadow" />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default PublicQR;
