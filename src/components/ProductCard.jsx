import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatearCLP } from '../utils/format.js';

export default function ProductCard({ producto }) {
  const { agregar } = useCart();
  const [agregado, setAgregado] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function manejarClick() {
    agregar(producto);
    setAgregado(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAgregado(false), 1200);
  }

  const sinStock = producto.stock !== undefined && producto.stock <= 0;

  return (
    <article className="tarjeta-producto">
      <div className="tarjeta-producto__imagen">
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre} />
        ) : (
          <span aria-hidden="true">{producto.nombre?.charAt(0)}</span>
        )}
      </div>
      <div className="tarjeta-producto__contenido">
        <h3><Link to={`/productos/${producto.id}`}>{producto.nombre}</Link></h3>
        <p className="tarjeta-producto__precio">{formatearCLP(producto.precio)}</p>
        <button type="button" className="boton boton-primario" onClick={manejarClick} disabled={sinStock}>
          {sinStock ? 'Sin stock' : agregado ? 'Agregado ✓' : 'Agregar al carrito'}
        </button>
      </div>
    </article>
  );
}
