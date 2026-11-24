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

## URLs públicas (AWS)
| Recurso | URL |
|---|---|
| Frontend (S3) | http://nube-monnnn-498605208964-us-east-1-an.s3-website-us-east-1.amazonaws.com |
| API productos | http://18.233.56.97:8081/api/productos |
| Swagger usuarios | http://18.233.56.97:8082/swagger-ui/index.html |
| Swagger productos | http://18.233.56.97:8081/swagger-ui/index.html |

Para que el frontend en S3 pueda llamar a la API:
- En el `.env` de la EC2, `CORS_ORIGINS` debe incluir la URL de S3 (sin `/` final) y luego `docker compose up -d`.
- En S3 → Static website hosting, **Error document = `index.html`**: así, recargar `/login`, `/admin` o `/productos/3` no da 404.

## Rutas
`/` Home · `/productos` · `/productos/:id` (detalle) · `/login` · `/registro` · `/carrito` (requiere sesión) · `/admin` (solo ADMIN)

## Sesión y renovación del token (JWT)
- Login → `POST /api/auth/login` entrega un JWT de 24 h (correo, id y rol).
- **Renovación:** 5 minutos antes de vencer, el frontend llama a `POST /api/auth/refresh` con el token vigente y recibe uno nuevo. El backend vuelve a leer el usuario: si fue desactivado responde 403 y el frontend cierra la sesión.
- Al recargar la página con un token ya vencido, la sesión se cierra de inmediato.

## Usuario administrador de prueba
Lo crea ms-usuarios al arrancar (`DataInitializer`):
- Correo: `admin@moonsoon.cl`
- Clave: `Admin123!`

## Datos y sesión
- Usuarios y productos viven en MySQL, expuestos por la API; el frontend los consume con `src/services/*`.
- La sesión (token JWT + usuario) se guarda en `localStorage` (`moonsoon_token`, `moonsoon_usuario`).
- El carrito se guarda en `localStorage` (`moonsoon_carrito`).
