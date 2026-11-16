# moonsoon (React + Vite + Spring Boot)

Tienda con frontend en React y dos microservicios Spring Boot (usuarios y productos) con JWT.

## Estructura
```
src/        frontend (React + Vite)
backend/    ms-usuarios (8082) y ms-productos (8081)
docs/       ERS, guía de defensa, colección Postman, script SQL
```

## Cómo correrlo

### Backend (requiere Java 17+, Maven y MySQL)
```bash
cd backend/ms-usuarios  && mvn spring-boot:run   # http://localhost:8082
cd backend/ms-productos && mvn spring-boot:run   # http://localhost:8081
```
Ambos deben compartir el mismo `JWT_SECRET`. Variables: `DB_URL`, `DB_USER`, `DB_PASS`, `JWT_SECRET`, `CORS_ORIGINS`.

### Frontend
```bash
cp .env.example .env     # URLs de los microservicios (opcional: ya hay valores por defecto)
npm install
npm run dev              # servidor de desarrollo (http://localhost:5173)
npm test                 # pruebas unitarias (Vitest)
npm run test:coverage    # cobertura
npm run build            # build de producción
```

## Rutas
`/` Home · `/productos` · `/login` · `/registro` · `/carrito` (requiere sesión) · `/admin` (solo ADMIN)

## Usuario administrador de prueba
Lo crea ms-usuarios al arrancar (`DataInitializer`):
- Correo: `admin@moonsoon.cl`
- Clave: `Admin123!`

## Datos y sesión
- Usuarios y productos viven en MySQL, expuestos por la API; el frontend los consume con `src/services/*`.
- La sesión (token JWT + usuario) se guarda en `localStorage` (`moonsoon_token`, `moonsoon_usuario`).
- El carrito se guarda en `localStorage` (`moonsoon_carrito`).
