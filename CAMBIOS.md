# Cambios de esta versión (mejoras sobre la versión desplegada)

Nada de esto está desplegado todavía: la versión en AWS sigue igual hasta que hagas `git pull` y vuelvas a desplegar.

## 1. Renovación del token JWT (pauta IE3.3.1 b: "generación, verificación y renovación")
**Backend (ms-usuarios)**
- `POST /api/auth/refresh`: recibe el token vigente en `Authorization: Bearer …` y devuelve `{ token, usuario }` nuevos.
- Vuelve a leer el usuario desde MySQL: si fue desactivado → 403; si ya no existe → 401. Así un token nuevo siempre refleja el rol actual.
- `SecurityConfig`: `/api/auth/refresh` exige autenticación; el resto de `/api/auth/**` sigue público.
- Archivos: `UsuarioService.java` (`renovar`), `AuthController.java` (`refresh`), `SecurityConfig.java`.

**Frontend**
- `src/utils/jwt.js`: lee el `exp` del token y calcula cuándo renovar (5 minutos antes).
- `AuthContext.jsx`: programa la renovación automática; si al recargar el token ya venció, cierra la sesión al instante; si la renovación falla, cierra la sesión.
- `authService.refresh()`.

## 2. Vista de detalle de producto (`/productos/:id`)
- `src/pages/ProductoDetalle.jsx`: usa `GET /api/productos/{id}`, muestra descripción, categoría, stock, precio y botón para agregar al carrito; maneja carga, 404 y sin stock.
- El nombre en cada `ProductCard` ahora enlaza al detalle.

## 3. Pruebas nuevas (+15)
| Archivo | Nuevas | Qué prueban |
|---|---|---|
| `UsuarioServiceTest.java` | 3 | renovar OK, usuario desactivado (403), usuario inexistente (401) |
| `UsuariosApiIntegrationTest.java` | 2 | refresh con token (200) y sin token / token inválido (401) |
| `jwt.test.js` | 3 | lectura de `exp`, tokens inválidos, cálculo del momento de renovación |
| `AuthContext.test.jsx` | 3 | token vencido al recargar, renovación automática, falla de renovación |
| `services.test.js` | 1 | `authService.refresh` |
| `ProductoDetalle.test.jsx` | 4 | carga por id, agregar al carrito, 404, sin stock |

Total: 126 → 141 pruebas (frontend 82 → 93, backend 44 → 49).

**Antes de desplegar, ejecuta las pruebas** (no se pudieron correr en el entorno donde se prepararon estos cambios):
```bash
npm install && npm test
cd backend/ms-usuarios && mvn verify
```

## 4. Documentación
- Colección Postman: "Renovar token CLIENTE (refresh)" y "Renovar token sin token (401)".
- README: URLs públicas, configuración de CORS y del error document de S3, explicación de la renovación.
- `docs/ERS.md`: endpoint `/api/auth/refresh`.

## Cómo desplegar estos cambios (cuando quieras)
1. Copia estos archivos al repo, `git commit` y `git push`.
2. En la EC2: `git pull && docker compose up -d --build` (solo cambia ms-usuarios).
3. En tu PC: `npm run build` y sube `dist/` al bucket S3.
