import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../services/productosService', () => ({
  productosService: { listar: vi.fn() },
}));

import { productosService } from '../services/productosService';
import Home from './Home.jsx';
import Productos from './Productos.jsx';
import { ProductsProvider } from '../context/ProductsContext.jsx';
import { CartProvider } from '../context/CartContext.jsx';

function renderConCatalogo(pagina) {
  return render(
    <MemoryRouter>
      <ProductsProvider>
        <CartProvider>{pagina}</CartProvider>
      </ProductsProvider>
    </MemoryRouter>
  );
}

const LISTA = [
  { id: 1, nombre: 'Mouse gamer', precio: 29990, stock: 4, imagen: '' },
  { id: 2, nombre: 'Teclado mecánico', precio: 49990, stock: 2, imagen: '' },
];

describe('Productos', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('muestra "Cargando…" y luego los productos de la API', async () => {
    productosService.listar.mockResolvedValue(LISTA);
    renderConCatalogo(<Productos />);
    expect(screen.getByText('Cargando productos…')).toBeInTheDocument();
    expect(await screen.findByText('Mouse gamer')).toBeInTheDocument();
    expect(screen.getByText('Teclado mecánico')).toBeInTheDocument();
  });

  it('avisa si no hay productos', async () => {
    productosService.listar.mockResolvedValue([]);
    renderConCatalogo(<Productos />);
    expect(await screen.findByText(/aún no hay productos/i)).toBeInTheDocument();
  });

  it('muestra el error cuando la API no responde', async () => {
    productosService.listar.mockRejectedValue(new Error('No se pudo conectar con el servidor'));
    renderConCatalogo(<Productos />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo conectar/i);
  });
});

describe('Home', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('muestra la cantidad de productos del catálogo', async () => {
    productosService.listar.mockResolvedValue(LISTA);
    renderConCatalogo(<Home />);
    expect(await screen.findByText(/2 productos, disponibles/i)).toBeInTheDocument();
    expect(screen.getByText('Mouse gamer')).toBeInTheDocument();
  });

  it('muestra el error cuando la API falla', async () => {
    productosService.listar.mockRejectedValue(new Error('Error 500'));
    renderConCatalogo(<Home />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Error 500');
  });
});
