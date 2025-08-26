// =========================
// src/pages/ResetPasswordPage.jsx
// =========================
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/auth';
import PasswordField from '../components/PasswordField';
import { PasswordStrength } from '../components/PasswordStrength';

export default function ResetPasswordPage() {
  const [sp] = useSearchParams();
  const token = sp.get('token');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) setStatus({ type: 'error', msg: 'Geçersiz bağlantı (token bulunamadı)' });
  }, [token]);

  const validPolicy = (p) => /(?=.{8,})(?=.*[A-ZÇĞİÖŞÜ])(?=.*[a-zçğıöşü])(?=.*\d)/.test(p);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (pw1 !== pw2) {
      setStatus({ type: 'error', msg: 'Şifreler eşleşmiyor' });
      return;
    }
    if (!validPolicy(pw1)) {
      setStatus({ type: 'error', msg: 'Şifre en az 8 karakter, büyük/küçük harf ve rakam içermeli' });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const msg = await resetPassword(token, pw1);
      setStatus({ type: 'success', msg });
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      // Backend 400 için metin/JSON gelebilir: devrede metin döndürüyoruz.
      setStatus({ type: 'error', msg: err.message || 'Token geçersiz/süresi dolmuş/önceden kullanılmış olabilir' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Yeni Şifre Oluştur</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <PasswordField id="pw1" label="Yeni şifre" value={pw1} onChange={(e) => setPw1(e.target.value)} />
        <PasswordStrength password={pw1} />
        <PasswordField id="pw2" label="Yeni şifre (tekrar)" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        <button disabled={loading || !token} className="w-full border rounded px-3 py-2">
          {loading ? 'Güncelleniyor…' : 'Şifreyi Sıfırla'}
        </button>
        {status && (
          <div className={status.type === 'success' ? 'text-green-600' : 'text-red-600'}>
            {status.msg}
          </div>
        )}
      </form>
      <p className="text-xs text-gray-600 mt-4">
        Politika: En az 8 karakter, büyük/küçük harf ve rakam içermeli. Örn: <code>QrApp2025</code>
      </p>
    </div>
  );
}