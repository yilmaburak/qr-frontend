export function PasswordStrength({ password }) {
  const tests = [
    /.{8,}/.test(password),           // Minimum 8 characters
    /[A-ZÇĞİÖŞÜ]/.test(password),     // Uppercase letter
    /[a-zçğıöşü]/.test(password),     // Lowercase letter
    /\d/.test(password),              // Number
    /[^A-Za-z0-9]/.test(password)     // Special character
  ];

  const score = tests.filter(Boolean).length;
  const labels = ['Very Weak', 'Weak', 'Medium', 'Good', 'Strong'];
  const pct = (score / 5) * 100;

  const colors = [
    'bg-red-500',
    'bg-orange-400',
    'bg-yellow-400',
    'bg-blue-400',
    'bg-green-500'
  ];

  const barColor = score === 0 ? 'bg-gray-300' : colors[score - 1];

  return (
    <div className="text-sm">
      <div className="w-full h-2 bg-gray-200 rounded mb-1">
        <div className={`h-2 rounded ${barColor} transition-all duration-300`} style={{ width: pct + '%' }} />
      </div>
      <span>{labels[Math.max(0, score - 1)]}</span>
    </div>
  );
}
