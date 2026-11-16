import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../services/authService', () => ({
  authService: { login: vi.fn(), registro: vi.fn() },
}));

import { authService } from '../services/authService';
import Registro from './Registro.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';

function renderRegistro() {
  return render(
    <MemoryRouter initialEntries={['/registro']}>
      <AuthProvider>
        <Routes>
          <Route path="/registro" element={<Registro />} />
          <Route path="/login" element={<p>Pantalla login</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

function llenarCampo(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

function llenarFormularioValido() {
  llenarCampo('Nombre completo', 'Ana Pérez');
  llenarCampo('Correo', 'ana@gmail.com');
  llenarCampo('Confirmar correo', 'ana@gmail.com');
  llenarCampo(/^contraseña$/i, 'Clave123!');
  llenarCampo('Confirmar contraseña', 'Clave123!');
}

describe('Registro', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('muestra errores si se envía el formulario vacío', () => {
    renderRegistro();
    fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

    expect(screen.getByText(/ingresa tu nombre completo/i)).toBeInTheDocument();
    expect(screen.getByText(/ingresa un correo electrónico/i)).toBeInTheDocument();
    expect(authService.registro).not.toHaveBeenCalled();
  });

  it('valida que la contraseña cumpla el formato exigido', () => {
    renderRegistro();
    llenarCampo(/^contraseña$/i, '1234');
    fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

    expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
  });

  it('valida que ambos correos coincidan', () => {
    renderRegistro();
    llenarCampo('Correo', 'ana@gmail.com');
    llenarCampo('Confirmar correo', 'otro@gmail.com');
    fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

    expect(screen.getByText(/los correos no coinciden/i)).toBeInTheDocument();
  });

  it('valida que ambas contraseñas coincidan', () => {
    renderRegistro();
    llenarCampo(/^contraseña$/i, 'Clave123!');
    llenarCampo('Confirmar contraseña', 'OtraClave123!');
    fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

    expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
  });

  it('registra en la API con datos válidos y lleva al login', async () => {
    authService.registro.mockResolvedValue({ id: 2 });
    renderRegistro();
    llenarFormularioValido();
    fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

    expect(await screen.findByText('Pantalla login')).toBeInTheDocument();
    expect(authService.registro).toHaveBeenCalledWith('Ana Pérez', 'ana@gmail.com', 'Clave123!');
  });

  it('muestra el error de la API (por ejemplo, correo duplicado)', async () => {
    authService.registro.mockRejectedValue(new Error('Ese correo ya está registrado'));
    renderRegistro();
    llenarFormularioValido();
    fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/ya está registrado/i);
    await waitFor(() => expect(screen.getByRole('button', { name: /registrar/i })).not.toBeDisabled());
  });
});
