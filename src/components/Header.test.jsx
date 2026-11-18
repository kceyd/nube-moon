import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { CartProvider } from '../context/CartContext.jsx';

function renderHeader() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>
          <Header />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

const sesion = (rol) =>
  localStorage.setItem('moonsoon_usuario', JSON.stringify({ id: 1, nombre: 'Ana', email: 'a@a.cl', rol }));

describe('Header', () => {
  beforeEach(() => localStorage.clear());

  it('sin sesión ofrece iniciar sesión y registrarse', () => {
    renderHeader();
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
    expect(screen.getByText('Registrar usuario')).toBeInTheDocument();
    expect(screen.queryByText('Panel admin')).not.toBeInTheDocument();
  });

  it('un CLIENTE ve su nombre y no el panel admin', () => {
    sesion('CLIENTE');
    renderHeader();
    expect(screen.getByText('Hola, Ana')).toBeInTheDocument();
    expect(screen.queryByText('Panel admin')).not.toBeInTheDocument();
  });

  it('un ADMIN ve el enlace al panel admin', () => {
    sesion('ADMIN');
    renderHeader();
    expect(screen.getByText('Panel admin')).toBeInTheDocument();
  });

  it('cerrar sesión limpia el usuario guardado', () => {
    sesion('CLIENTE');
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));
    expect(localStorage.getItem('moonsoon_usuario')).toBeNull();
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
  });
});
