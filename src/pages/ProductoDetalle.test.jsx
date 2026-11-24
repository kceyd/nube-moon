import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../services/productosService', () => ({
  productosService: { obtener: vi.fn() },
}));

import { productosService } from '../services/productosService';
import ProductoDetalle from './ProductoDetalle.jsx';
import { CartProvider } from '../context/CartContext.jsx';

function renderDetalle(id = '7') {
  return render(
    <MemoryRouter initialEntries={[`/productos/${id}`]}>
      <CartProvider>
        <Routes>
          <Route path="/productos/:id" element={<ProductoDetalle />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>
  );
}

const PRODUCTO = {
  id: 7, nombre: 'Audífonos KD', descripcion: 'Bluetooth 5.3', precio: 39990,
  stock: 3, categoria: 'Audio', imagen: '/img/kdaudifono.jpg',
};

describe('ProductoDetalle', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('pide el producto por id a la API y muestra sus datos', async () => {
    productosService.obtener.mockResolvedValue(PRODUCTO);
    renderDetalle('7');
    expect(screen.getByText('Cargando producto…')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Audífonos KD' })).toBeInTheDocument();
    expect(productosService.obtener).toHaveBeenCalledWith('7');
    expect(screen.getByText('Bluetooth 5.3')).toBeInTheDocument();
    expect(screen.getByText('Stock disponible: 3')).toBeInTheDocument();
  });

  it('agrega el producto al carrito', async () => {
    productosService.obtener.mockResolvedValue(PRODUCTO);
    renderDetalle();
    fireEvent.click(await screen.findByRole('button', { name: 'Agregar al carrito' }));
    expect(screen.getByRole('button', { name: 'Agregado ✓' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('moonsoon_carrito'))[0].id).toBe(7);
  });

  it('muestra "Producto no encontrado" cuando la API responde 404', async () => {
    productosService.obtener.mockRejectedValue(Object.assign(new Error('x'), { status: 404 }));
    renderDetalle('999');
    expect(await screen.findByRole('alert')).toHaveTextContent('Producto no encontrado');
    expect(screen.getByRole('link', { name: 'Volver al catálogo' })).toBeInTheDocument();
  });

  it('deshabilita la compra si no hay stock', async () => {
    productosService.obtener.mockResolvedValue({ ...PRODUCTO, stock: 0 });
    renderDetalle();
    const botones = await screen.findAllByText('Sin stock');
    expect(botones.at(-1).closest('button')).toBeDisabled();
  });
});
