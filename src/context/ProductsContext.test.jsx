import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('../services/productosService', () => ({
  productosService: { listar: vi.fn() },
}));

import { productosService } from '../services/productosService';
import { ProductsProvider, useProducts } from './ProductsContext.jsx';

const wrapper = ({ children }) => <ProductsProvider>{children}</ProductsProvider>;

describe('ProductsContext', () => {
  beforeEach(() => vi.clearAllMocks());

  it('carga el catálogo desde la API', async () => {
    productosService.listar.mockResolvedValue([{ id: 1, nombre: 'Mouse', precio: 9990, stock: 3 }]);
    const { result } = renderHook(() => useProducts(), { wrapper });

    expect(result.current.cargando).toBe(true);
    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.productos).toHaveLength(1);
    expect(result.current.error).toBe('');
  });

  it('expone el mensaje de error si la API falla', async () => {
    productosService.listar.mockRejectedValue(new Error('No se pudo conectar con el servidor'));
    const { result } = renderHook(() => useProducts(), { wrapper });

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.error).toMatch(/no se pudo conectar/i);
    expect(result.current.productos).toEqual([]);
  });
});
