import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { getToken, setToken } from '../services/http';
import { expiracionToken, msHastaRenovar } from '../utils/jwt';

const USER_KEY = 'moonsoon_usuario';
const AuthContext = createContext(null);

function leerUsuario() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerUsuario);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    setUsuario(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, usuario: u } = await authService.login(email, password);
    setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUsuario(u);
    return u;
  }, []);

  const registrar = useCallback(
    (nombre, email, password) => authService.registro(nombre, email, password),
    []
  );

  // Si el backend responde 401 con un token guardado (expiró), se cierra la sesión.
  useEffect(() => {
    window.addEventListener('moonsoon:unauthorized', logout);
    return () => window.removeEventListener('moonsoon:unauthorized', logout);
  }, [logout]);

  // Renovación del token: 5 minutos antes de que venza se pide uno nuevo a /api/auth/refresh.
  // Si al recargar la página el token guardado ya venció, la sesión se cierra de inmediato.
  useEffect(() => {
    if (!usuario) return undefined;
    const exp = expiracionToken(getToken());
    if (exp === null) return undefined; // sin token legible: lo resuelve el 401 del backend
    if (exp <= Date.now()) {
      logout();
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        const { token, usuario: u } = await authService.refresh();
        setToken(token);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        setUsuario(u);
      } catch {
        logout();
      }
    }, msHastaRenovar(exp));
    return () => clearTimeout(timer);
  }, [usuario, logout]);

  const value = useMemo(
    () => ({ usuario, esAdmin: usuario?.rol === 'ADMIN', login, logout, registrar }),
    [usuario, login, logout, registrar]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
