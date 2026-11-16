import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../services/authService', () => ({
  authService: { login: vi.fn(), registro: vi.fn() },
}));

import { authService } from '../services/authService';
import Login from './Login.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<p>Inicio</p>} />
          <Route path="/admin" element={<p>Panel admin</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

function completar(correo, clave) {
  fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: correo } });
  fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: clave } });
  fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
}

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('muestra errores si se envía el formulario vacío', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(screen.getByText(/ingresa tu correo/i)).toBeInTheDocument();
    expect(screen.getByText(/ingresa tu contraseña/i)).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('muestra error si el correo tiene un formato inválido', () => {
    renderLogin();
    completar('correo-no-valido', 'algo');

    expect(screen.getByText(/formato del correo no es válido/i)).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('muestra el error que devuelve la API si las credenciales son incorrectas', async () => {
    authService.login.mockRejectedValue(new Error('Correo o clave incorrectos'));
    renderLogin();
    completar('nadie@gmail.com', 'Clave123!');

    expect(await screen.findByText(/correo o clave incorrectos/i)).toBeInTheDocument();
    expect(localStorage.getItem('moonsoon_token')).toBeNull();
  });

  it('un ADMIN entra y es llevado al panel', async () => {
    authService.login.mockResolvedValue({
      token: 'tok',
      usuario: { id: 1, nombre: 'Admin', email: 'admin@moonsoon.cl', rol: 'ADMIN' },
    });
    renderLogin();
    completar('admin@moonsoon.cl', 'Admin123!');

    expect(await screen.findByText('Panel admin')).toBeInTheDocument();
    expect(authService.login).toHaveBeenCalledWith('admin@moonsoon.cl', 'Admin123!');
    expect(localStorage.getItem('moonsoon_token')).toBe('tok');
  });

  it('un CLIENTE entra y es llevado al inicio', async () => {
    authService.login.mockResolvedValue({
      token: 'tok',
      usuario: { id: 2, nombre: 'Ana', email: 'ana@gmail.com', rol: 'CLIENTE' },
    });
    renderLogin();
    completar('ana@gmail.com', 'Clave123!');

    await waitFor(() => expect(screen.getByText('Inicio')).toBeInTheDocument());
  });
});
