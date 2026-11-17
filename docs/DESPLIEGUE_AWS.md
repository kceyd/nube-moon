# Despliegue de moonsoon en AWS EC2 con Docker

Levanta **MySQL + ms-usuarios (8082) + ms-productos (8081)** con un solo comando.
El frontend se construye aparte (ver Parte E) y apunta a la IP pública del servidor.

## Archivos del repo
```
docker-compose.yml
.env.docker.example          <- plantilla de variables (se copia como .env)
backend/ms-usuarios/Dockerfile
backend/ms-productos/Dockerfile
```

## Parte A: probar en tu PC (con Docker Desktop)
1. Detén los servicios que corras con `mvnw` (puertos 8081/8082 libres). Laragon puede seguir encendido: Docker usa su propio MySQL.
2. En la raíz del repo, copia la plantilla y edítala:
   ```powershell
   copy .env.docker.example .env
   ```
   Si ya tienes un `.env` del frontend, agrega al final las variables de la plantilla: Vite ignora las que no empiezan con `VITE_`.
3. Construye y levanta:
   ```powershell
   docker compose up -d --build
   docker compose ps
   docker compose logs -f ms-usuarios
   ```
   La primera vez tarda varios minutos (descarga imágenes y dependencias).
4. Prueba `http://localhost:8081/api/productos` (debe responder una lista) y el login en Postman.
5. Para detener: `docker compose down` (conserva los datos). `docker compose down -v` borra también la base.

## Parte B: crear la EC2
| Campo | Valor |
|---|---|
| AMI | Amazon Linux 2023 |
| Tipo | **t2.small o t3.small** (con t2.micro, 1 GB, se queda sin memoria; si es lo único que hay, agrega swap, ver abajo) |
| Key pair | `vockey` (AWS Academy) |
| Disco | 20 GB |

Security Group, entrada:
| Tipo | Puerto | Origen |
|---|---|---|
| SSH | 22 | My IP |
| Custom TCP | 8081 | Anywhere |
| Custom TCP | 8082 | Anywhere |

**No abras el 3306**: MySQL solo se usa dentro de Docker.

Luego asigna una **Elastic IP** (EC2 → Elastic IPs → Allocate → Associate) y anótala: `<ELASTIC_IP>`.

Conéctate:
```bash
chmod 400 labsuser.pem
ssh -i "labsuser.pem" ec2-user@<ELASTIC_IP>
```
(usa el nombre de tu archivo `.pem`)

## Parte C: instalar Docker en la EC2
```bash
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user

sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL "https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```
Cierra la sesión y vuelve a entrar (para que aplique el grupo `docker`):
```bash
exit
ssh -i "labsuser.pem" ec2-user@<ELASTIC_IP>
docker --version && docker compose version
```

**Solo si usas t2.micro: crea 2 GB de swap**
```bash
sudo dd if=/dev/zero of=/swapfile bs=128M count=16
sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
free -h
```

## Parte D: clonar y levantar
```bash
cd ~
git clone https://github.com/TU-USUARIO/TU-REPO.git
cd TU-REPO
cp .env.docker.example .env
nano .env
```
En el `.env` del servidor define:
- `DB_PASS` y `JWT_SECRET` (valores propios, no los de ejemplo),
- `ADMIN_PASSWORD`,
- `CORS_ORIGINS` = la URL exacta donde se abre tu frontend (con `http://`, sin `/` final).

Levanta:
```bash
docker compose up -d --build
docker compose ps
docker compose logs -f
```
Espera a ver `Started ... Application` en ambos servicios (`Ctrl + C` para salir de los logs; los contenedores siguen corriendo).

Prueba desde tu PC:
```
http://<ELASTIC_IP>:8081/api/productos
http://<ELASTIC_IP>:8082/swagger-ui/index.html
```

## Parte E: frontend apuntando al servidor
El frontend fija las URLs de la API **al compilar**. En tu PC, en el `.env` de la raíz del frontend:
```
VITE_API_USUARIOS_URL=http://<ELASTIC_IP>:8082
VITE_API_PRODUCTOS_URL=http://<ELASTIC_IP>:8081
```
Luego `npm run build` y publica la carpeta `dist/` donde tengas alojado el frontend.
Si el frontend se sirve por **HTTPS**, el navegador bloqueará llamadas HTTP a la API (mixed content): ambos deben usar el mismo protocolo.

## Parte F: Postman contra la nube
En la colección **moonsoon API**, cambia las variables:
- `usuariosUrl` = `http://<ELASTIC_IP>:8082`
- `productosUrl` = `http://<ELASTIC_IP>:8081`

y ejecuta **Run collection**.

## Parte G: actualizar tras un cambio
```bash
cd ~/TU-REPO
git pull
docker compose up -d --build
```
Si solo cambiaste `.env`: `docker compose up -d` (recrea los contenedores con los valores nuevos).

| Acción | Comando |
|---|---|
| Ver contenedores | `docker compose ps` |
| Ver logs | `docker compose logs -f ms-productos` |
| Reiniciar uno | `docker compose restart ms-productos` |
| Bajar todo (conserva datos) | `docker compose down` |
| Bajar y borrar la base (cuidado) | `docker compose down -v` |
| Uso de RAM | `docker stats` |

## Parte H: cerrar el laboratorio
```bash
cd ~/TU-REPO && docker compose down
```
Luego detén la instancia en la consola de AWS. Al reiniciar el laboratorio, ejecuta `docker compose up -d` (arrancan solos si Docker inicia con la máquina).

## Problemas frecuentes
| Síntoma | Qué revisar |
|---|---|
| `Cannot connect to the Docker daemon` | `sudo systemctl start docker` y volver a entrar tras `usermod` |
| `required variable ... is missing` | Falta `DB_PASS` o `JWT_SECRET` en `.env` |
| Contenedor reiniciándose | `docker compose logs ms-usuarios`: suele ser la base de datos o la clave |
| `Connection refused` desde Postman | Security Group (8081/8082) o contenedor caído (`docker compose ps`) |
| Error de CORS en el navegador | `CORS_ORIGINS` no coincide exacto con la URL del frontend |
| Build muy lento o se cuelga | Poca RAM: usa t2.small o agrega swap |
| Disco lleno | `docker system prune -af` |
| Cambié la clave de MySQL y no entra | La clave se fija al crear el volumen: `docker compose down -v` y volver a levantar |

## Checklist de demo
- [ ] `docker compose ps` muestra mysql, ms-usuarios y ms-productos en `Up`
- [ ] `http://<ELASTIC_IP>:8081/api/productos` responde
- [ ] Login ADMIN y CLIENTE desde el frontend público
- [ ] Postman contra la IP pública, con las pruebas en verde
