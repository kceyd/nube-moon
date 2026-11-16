import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { productosService } from '../services/productosService';

const ProductsContext = createContext(null);

/** Catálogo público: se carga desde ms-productos (GET /api/productos), sin datos quemados. */
export function ProductsProvider({ children }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const recargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setProductos(await productosService.listar());
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const value = useMemo(
    () => ({ productos, cargando, error, recargar }),
    [productos, cargando, error, recargar]
  );
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts debe usarse dentro de <ProductsProvider>');
  return ctx;
}
