import { useState, useEffect, useRef } from 'react';
import axios from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import QRCodeStyling from 'qr-code-styling';
import { HexColorPicker } from 'react-colorful';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CreateQR() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [style, setStyle] = useState('square');
  const canvasRef = useRef(null);
  const qrCodeRef = useRef(null);

  const navigate = useNavigate();

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      setLogoBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const generateQR = () => {
    if (!content || !canvasRef.current) return;

    canvasRef.current.innerHTML = '';

    const qrCode = new QRCodeStyling({
      width: 240,
      height: 240,
      data: content,
      image: logoPreview || '',
      dotsOptions: {
        color: foregroundColor,
        type: style,
      },
      backgroundOptions: {
        color: backgroundColor,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10,
        imageSize: 0.5, // Logo boyutu optimize
      },
    });

    qrCodeRef.current = qrCode;
    qrCode.append(canvasRef.current);
  };

  useEffect(() => {
    if (content) {
      generateQR();
    }
  }, [content, foregroundColor, backgroundColor, logoPreview, style]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/qrcodes', {
        content,
        title,
        description,
        logoBase64,
        foregroundColor,
        backgroundColor,
      });
      toast.success('QR Code başarıyla oluşturuldu!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (err) {
      console.error(err);
      toast.error('QR Code oluşturulamadı!');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Create QR Code</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="flex flex-wrap gap-8 mb-4">
            <div className="flex flex-col">
              <label className="font-medium mb-1">Foreground Color</label>
              <HexColorPicker color={foregroundColor} onChange={setForegroundColor} className="mb-2" />
              <input
                type="text"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="w-28 p-1 border rounded"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1">Background Color</label>
              <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} className="mb-2" />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-28 p-1 border rounded"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">QR Style</label>
            <div className="flex gap-4 flex-wrap">
              {['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded'].map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="qrstyle"
                    value={opt}
                    checked={style === opt}
                    onChange={(e) => setStyle(e.target.value)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Logo (optional)</label>
            <input type="file" accept="image/*" onChange={handleLogoChange} />
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="mt-2 w-24 h-24 object-contain border rounded"
              />
            )}
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create QR
          </button>
        </form>

        <div className="flex flex-col items-center justify-center">
          <label className="block mb-2 font-semibold">QR Preview</label>
          <div
            ref={canvasRef}
            className="w-60 h-60 border rounded shadow flex items-center justify-center"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CreateQR;
