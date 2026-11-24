/**
 * Lee la fecha de expiración (claim "exp") de un JWT, en milisegundos.
 * Solo decodifica el payload para planificar la renovación: la firma la valida el backend.
 * Devuelve null si el token no existe o no tiene un formato válido.
 */
export function expiracionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const partes = token.split('.');
  if (partes.length !== 3) return null;
  try {
    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const relleno = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(relleno));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Milisegundos antes del vencimiento en que se pide un token nuevo (5 minutos). */
export const MARGEN_RENOVACION_MS = 5 * 60 * 1000;

/** Cuánto esperar antes de renovar: nunca negativo. */
export function msHastaRenovar(expMs, ahoraMs = Date.now()) {
  return Math.max(expMs - MARGEN_RENOVACION_MS - ahoraMs, 0);
}
