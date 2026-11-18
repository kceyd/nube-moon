import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Carrito from './Carrito.jsx';
import { CartProvider } from '../context/CartContext.jsx';

const ITEM = { id: 1, nombre: 'Mouse gamer', precio: 10000, imagen: '', cantidad: 2 };

function renderCarrito(items = [ITEM]) {
  localStorage.setItem('moonsoon_carrito', JSON.stringify(items));
  return render(
    <MemoryRouter>
      <CartProvider>
        <Carrito />
      </CartProvider>
    </MemoryRouter>
  );
}

const total = () => screen.getByText(/^TOTAL:/).textContent.replace(/\D/g, '');

describe('Carrito', () => {
  beforeEach(() => localStorage.clear());

  it('vacío invita a ver el catálogo', () => {
    renderCarrito([]);
    expect(screen.getByText(/carrito está vacío por ahora/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver catálogo/i })).toBeInTheDocument();
  });

  it('calcula el total según las cantidades', () => {
    renderCarrito();
    expect(total()).toBe('20000');
    fireEvent.click(screen.getByRole('button', { name: /aumentar cantidad/i }));
    expect(total()).toBe('30000');
  });

  it('aplica un cupón válido y rechaza uno inválido', () => {
    renderCarrito();
    fireEvent.change(screen.getByLabelText(/cupón de descuento/i), { target: { value: 'MOONSOON10' } });
    fireEvent.click(screen.getByRole('button', { name: /aplicar/i }));
    expect(total()).toBe('18000');

    fireEvent.change(screen.getByLabelText(/cupón de descuento/i), { target: { value: 'FALSO' } });
    fireEvent.click(screen.getByRole('button', { name: /aplicar/i }));
    expect(screen.getByText(/cupón inválido/i)).toBeInTheDocument();
    expect(total()).toBe('20000');
  });

  it('pagar vacía el carrito', () => {
    renderCarrito();
    fireEvent.click(screen.getByRole('button', { name: /pagar/i }));
    expect(screen.getByText(/pago simulado con éxito/i)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('moonsoon_carrito'))).toEqual([]);
  });

  it('pagar con el carrito vacío avisa', () => {
    renderCarrito([]);
    fireEvent.click(screen.getByRole('button', { name: /pagar/i }));
    expect(screen.getByText(/carrito está vacío: agrega productos/i)).toBeInTheDocument();
  });
});
