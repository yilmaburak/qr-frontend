// =========================
// src/api/auth.js
// =========================
export async function forgotPassword(email) {
  const res = await fetch(`/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || 'İstek başarısız');
  return text;
}

export async function resetPassword(token, newPassword) {
  const res = await fetch(`/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || 'İstek başarısız');
  return text;
}

