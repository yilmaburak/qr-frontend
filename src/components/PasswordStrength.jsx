// =========================
// src/components/PasswordStrength.jsx (hafifçe bilgilendirici)
// =========================
export function PasswordStrength({ password }) {
  const tests = [
    /.{8,}/.test(password),           // min 8
    /[A-ZÇĞİÖŞÜ]/.test(password),     // büyük harf
    /[a-zçğıöşü]/.test(password),     // küçük harf
    /\d/.test(password),              // rakam
    /[^A-Za-z0-9]/.test(password)     // özel karakter
  ];
  const score = tests.filter(Boolean).length;
  const labels = ['Çok zayıf', 'Zayıf', 'Orta', 'İyi', 'Güçlü'];
  const pct = (score / 5) * 100;
  return (
    <div className="text-sm">
      <div className="w-full h-2 bg-gray-200 rounded mb-1">
        <div className="h-2 bg-green-500 rounded" style={{ width: pct + '%' }} />
      </div>
      <span>{labels[Math.max(0, score - 1)] || labels[0]}</span>
    </div>
  );
}
