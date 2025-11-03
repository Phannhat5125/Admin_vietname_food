// DEPRECATED: Use imports from '../api/auth' instead of this file.
export { AuthAPI, AuthAPI as default } from '../api/auth';

// Simple placeholder auth service; replace with real backend integration later.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function login(email, password) {
  const resp = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Login failed: ${txt}`);
  }
  const data = await resp.json();
  saveToken(data.token, data.user);
  return data;
}

export async function register(username, email, password) {
  const resp = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Register failed: ${txt}`);
  }
  return await resp.json();
}

export function saveToken(token, user) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem('auth_token');
}

export function getCurrentUser() {
  const raw = localStorage.getItem('auth_user');
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

export function isAuthenticated() {
  return !!getToken();
}
