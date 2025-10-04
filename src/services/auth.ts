// =========================
// src/api/auth.js

import api from "../utils/axiosInstance";
import { LoginProps, RegisterProps } from "../Models/Auth";

// =========================
export async function forgotPassword(email: any) {
  const res = await fetch(`/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || 'İstek başarısız');
  return text;
}

export async function resetPassword(token: any, newPassword: any) {
  const res = await fetch(`/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || 'İstek başarısız');
  return text;
}

export const login = async ({ username, password }: LoginProps) => {
  const res = await api.post('/auth/login', { username, password });
  return res.data;
}

export const logout = async () => {
  const res = await api.post('/auth/logout',{});
  return res.data;
}

export const register = async ({ username, password, email }: RegisterProps) => {
  const res = await api.post('/auth/register', { username, password, email });
  return res.data;
}