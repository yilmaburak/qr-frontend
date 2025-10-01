// =========================
// src/components/PasswordField.jsx
// =========================
import { useState } from 'react';

export default function PasswordField({ label = 'Şifre', value, onChange, placeholder = 'Şifre', id, required = true }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1">{label}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full border rounded px-3 py-2"
        />
        <button type="button" onClick={() => setShow(s => !s)} className="border rounded px-3 py-2">
          {show ? 'Gizle' : 'Göster'}
        </button>
      </div>
    </div>
  );
}
