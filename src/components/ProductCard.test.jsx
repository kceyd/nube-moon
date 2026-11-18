import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard.jsx';
import { CartProvider } from '../context/CartContext.jsx';

function renderCard(producto) {
  return render(
    <CartProvider>
      <ProductCard producto={producto} />
    </CartProvider>
  );
}

describe('ProductCard', () => {
  beforeEach(() => localStorage.clear());

  it('muestra nombre, precio e imagen', () => {
    renderCard({ id: 1, nombre: 'Mouse gamer', precio: 29990, imagen: '/img/mouse.jpg', stock: 5 });
    expect(screen.getByText('Mouse gamer')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Mouse gamer' })).toHaveAttribute('src', '/img/mouse.jpg');
  });

  it('sin imagen no rompe y muestra la inicial', () => {
    renderCard({ id: 2, nombre: 'Teclado', precio: 49990, imagen: '', stock: 5 });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('agregar al carrito lo guarda y confirma', () => {
    renderCard({ id: 3, nombre: 'Audífonos', precio: 29990, imagen: '', stock: 5 });
    fireEvent.click(screen.getByRole('button', { name: /agregar al carrito/i }));
    expect(screen.getByRole('button', { name: /agregado/i })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('moonsoon_carrito'))).toHaveLength(1);
  });

  it('sin stock deshabilita el botón', () => {
    renderCard({ id: 4, nombre: 'Agotado', precio: 1000, imagen: '', stock: 0 });
    expect(screen.getByRole('button', { name: /sin stock/i })).toBeDisabled();
  });
});
