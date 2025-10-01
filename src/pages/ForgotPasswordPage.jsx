// =========================
// src/pages/ForgotPasswordPage.jsx
// =========================
import { useState } from 'react';
import { forgotPassword } from '../services/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // {type:'success'|'error', msg:string}
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const msg = await forgotPassword(email.trim());
      setStatus({ type: 'success', msg });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message || 'Bir şeyler ters gitti' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Şifremi Unuttum</h1>
      <p className="text-sm text-gray-600 mb-4">
        E-posta adresini gir. Kayıtlı ise kısa süre içinde bir sıfırlama bağlantısı gönderilecek.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="ornek@mail.com"
          />
        </div>
        <button disabled={loading} className="w-full border rounded px-3 py-2">
          {loading ? 'Gönderiliyor…' : 'E-posta Gönder'}
        </button>
        {status && (
          <div className={status.type === 'success' ? 'text-green-600' : 'text-red-600'}>
            {status.msg}
          </div>
        )}
      </form>
    </div>
  );
}
