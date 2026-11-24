import { API_USUARIOS, request } from './http';

export const authService = {
  login: (email, password) =>
    request(API_USUARIOS, '/api/auth/login', { method: 'POST', body: { email, password } }),
  registro: (nombre, email, password) =>
    request(API_USUARIOS, '/api/auth/registro', { method: 'POST', body: { nombre, email, password } }),
  // Usa el token vigente (lo agrega http.js) y devuelve { token, usuario } nuevos.
  refresh: () => request(API_USUARIOS, '/api/auth/refresh', { method: 'POST' }),
};
