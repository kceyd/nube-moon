import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{1,50}$/;
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_CLAVE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%!.*]).{8,}$/;

const FORM_VACIO = { nombre: '', correo: '', correoConfirmar: '', password: '', passwordConfirmar: '' };

export default function Registro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(FORM_VACIO);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  function cambiar(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validar() {
    const e = {};
    if (form.nombre.trim() === '') e.nombre = 'Ingresa tu nombre completo.';
    else if (!REGEX_NOMBRE.test(form.nombre)) e.nombre = 'Solo letras y espacios, máximo 50 caracteres.';

    if (form.correo.trim() === '') e.correo = 'Ingresa un correo electrónico.';
    else if (!REGEX_CORREO.test(form.correo.trim())) e.correo = 'El formato del correo no es válido.';

    if (form.correoConfirmar !== form.correo) e.correoConfirmar = 'Los correos no coinciden.';
    if (!REGEX_CLAVE.test(form.password)) e.password = 'Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo (@#$%!.*).';
    if (form.passwordConfirmar !== form.password) e.passwordConfirmar = 'Las contraseñas no coinciden.';
    return e;
  }

  async function manejarSubmit(ev) {
    ev.preventDefault();
    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setEnviando(true);
    try {
      await registrar(form.nombre.trim(), form.correo.trim(), form.password);
      navigate('/login');
    } catch (err) {
      setErrores({ general: err.message });
      setEnviando(false);
    }
  }

  function renderCampo(id, label, tipo = 'text', auto) {
    return (
      <div className="campo">
        <label htmlFor={id}>{label}</label>
        <input type={tipo} id={id} name={id} autoComplete={auto} value={form[id]} onChange={cambiar} />
        {errores[id] && <p className="error-msg">{errores[id]}</p>}
      </div>
    );
  }

  return (
    <main className="pagina-centrada">
      <section className="caja-form caja-form--ancha">
        <h2>Registro de usuario</h2>
        <form onSubmit={manejarSubmit} noValidate>
          {renderCampo('nombre', 'Nombre completo', 'text', 'name')}
          {renderCampo('correo', 'Correo', 'email', 'email')}
          {renderCampo('correoConfirmar', 'Confirmar correo', 'email', 'email')}
          {renderCampo('password', 'Contraseña', 'password', 'new-password')}
          {renderCampo('passwordConfirmar', 'Confirmar contraseña', 'password', 'new-password')}

          {errores.general && <p className="error-msg" role="alert">{errores.general}</p>}

          <button type="submit" className="btn-form btn-form--primario" disabled={enviando}>
            {enviando ? 'Registrando…' : 'Registrar'}
          </button>
        </form>
      </section>
    </main>
  );
}
