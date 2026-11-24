import { describe, expect, it } from 'vitest';
import { expiracionToken, MARGEN_RENOVACION_MS, msHastaRenovar } from './jwt';

// Arma un JWT de prueba (la firma no importa: el frontend solo lee el payload).
const tokenCon = (payload) => `h.${btoa(JSON.stringify(payload)).replace(/=+$/, '')}.firma`;

describe('utils/jwt', () => {
  it('lee el claim exp y lo devuelve en milisegundos', () => {
    expect(expiracionToken(tokenCon({ sub: 'a@a.cl', exp: 1700000000 }))).toBe(1700000000000);
  });

  it('devuelve null con token vacío, mal formado o sin exp', () => {
    expect(expiracionToken(null)).toBeNull();
    expect(expiracionToken('no-es-un-jwt')).toBeNull();
    expect(expiracionToken('a.%%%.c')).toBeNull();
    expect(expiracionToken(tokenCon({ sub: 'a@a.cl' }))).toBeNull();
  });

  it('planifica la renovación 5 minutos antes y nunca con espera negativa', () => {
    const ahora = 1_000_000;
    expect(msHastaRenovar(ahora + MARGEN_RENOVACION_MS + 60_000, ahora)).toBe(60_000);
    expect(msHastaRenovar(ahora + 1000, ahora)).toBe(0);
  });
});
