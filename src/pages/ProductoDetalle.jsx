import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { productosService } from '../services/productosService';
import { formatearCLP } from '../utils/format.js';

/** Detalle de un producto: GET /api/productos/{id} (público). */
export default function ProductoDetalle() {
  const { id } = useParams();
  const { agregar } = useCart();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError('');
    productosService
      .obtener(id)
      .then((p) => { if (activo) setProducto(p); })
      .catch((e) => { if (activo) setError(e.status === 404 ? 'Producto no encontrado' : e.message); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [id]);

  function agregarAlCarrito() {
    agregar(producto);
    setAgregado(true);
  }

  if (cargando) {
    return <main className="detalle-producto"><p className="catalogo__intro">Cargando producto…</p></main>;
  }

  if (error) {
    return (
      <main className="detalle-producto">
        <p className="error-msg" role="alert">{error}</p>
        <Link to="/productos" className="boton boton-primario">Volver al catálogo</Link>
      </main>
    );
  }

  const sinStock = producto.stock !== undefined && producto.stock <= 0;

  return (
    <main className="detalle-producto">
      <Link to="/productos" className="detalle-producto__volver">← Volver al catálogo</Link>
      <div className="detalle-producto__layout">
        <div className="detalle-producto__imagen">
          {producto.imagen ? (
            <img src={producto.imagen} alt={producto.nombre} />
          ) : (
            <span aria-hidden="true">{producto.nombre?.charAt(0)}</span>
          )}
        </div>
        <section className="detalle-producto__info">
          {producto.categoria && <p className="detalle-producto__categoria">{producto.categoria}</p>}
          <h1>{producto.nombre}</h1>
          <p className="detalle-producto__precio">{formatearCLP(producto.precio)}</p>
          {producto.descripcion && <p className="detalle-producto__descripcion">{producto.descripcion}</p>}
          <p className="detalle-producto__stock">
            {sinStock ? 'Sin stock' : `Stock disponible: ${producto.stock}`}
          </p>
          <button type="button" className="boton boton-primario" onClick={agregarAlCarrito} disabled={sinStock}>
            {sinStock ? 'Sin stock' : agregado ? 'Agregado ✓' : 'Agregar al carrito'}
          </button>
        </section>
      </div>
    </main>
  );
}
