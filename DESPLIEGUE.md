# Publicar la página real y la de muestra

Un solo código, dos sitios en Vercel. Cada uno tiene su propia base de datos en Neon y sus propias variables de entorno.

| | Página real | Página de muestra |
|---|---|---|
| Proyecto de Vercel | el que ya tenés | uno nuevo, importando el mismo repositorio |
| Base de datos | tu base Neon actual | una base nueva con "demo" en el nombre |
| `DEMO_MODE` | no definir | `1` |
| Datos | los reales | ficticios (`npm run demo:seed`) |

## 1. Antes de tocar nada (página real)

1. **Copia de seguridad de la base real.** En Neon, creá una rama de tu base ("branch"): es instantánea y gratuita, y te deja volver atrás.
2. **Rotá los secretos.** El archivo `.env` está guardado en Git, y en el historial quedó la clave de Cloudinary. Generá una nueva en Cloudinary y cargala en Vercel como `CLOUDINARY_URL`. Si querés dejar de versionar el archivo, hacelo recién cuando Vercel tenga todas las variables cargadas a mano: si hoy el build depende del `.env` del repositorio, quitarlo antes rompe el build.
3. **Variables de Vercel de la página real** (Settings > Environment Variables, entorno Production):
   - `DATABASE_URL`: la de tu base Neon real.
   - `CLOUDINARY_URL`: la nueva.
   - `NEXT_PUBLIC_SITE_URL` y `COMMUNITY_ORIGIN`: la dirección pública, sin barra final.
   - `COMMUNITY_TRUST_PROXY=1`.
   - No definas `DEMO_MODE`.

## 2. Subir los cambios a la página real

1. El trabajo está en la rama local `rediseno-y-comunidad`. Revisalo y subila a GitHub: Vercel crea una vista previa ("Preview") de esa rama sin tocar producción.
2. Si la vista previa usa la base real, tené en cuenta que el build corre `prisma migrate deploy`. Esa migración (`20261118120000_comunidad_estudiantil`) solo agrega tablas de la comunidad, no modifica ni borra el catálogo. Aun así, probá primero con una rama de Neon (paso 1) en el entorno Preview.
3. Cuando la vista previa se vea bien, hacé el merge a la rama que Vercel publica como producción.
4. Para tener moderadores: creá tu cuenta en `/comunidad/cuenta` y, desde tu computadora, con `DATABASE_URL` apuntando a la base real: `npm run comunidad:admin -- tu-correo`.

**Nunca corras `npm run seed` contra la base real:** borra el catálogo. Tampoco corras `demo:seed` contra ella: se niega, porque el nombre no contiene "demo".

## 3. Crear la página de muestra

1. **Base de muestra.** En Neon creá un proyecto nuevo (o una base nueva) llamado, por ejemplo, `vecinos_demo`. El nombre debe contener "demo". Copiá su cadena de conexión.
2. **Proyecto nuevo en Vercel.** "Add New Project", elegí el mismo repositorio y la misma rama de producción. Variables:
   - `DATABASE_URL`: la de la base de muestra.
   - `DEMO_MODE=1`: pone el cartel de muestra, impide que los buscadores la indexen, bloquea la subida de fotos y obliga a que la base se llame "demo". Si algún día `DATABASE_URL` apuntara a la base real, el sitio se niega a arrancar.
   - `NEXT_PUBLIC_SITE_URL` y `COMMUNITY_ORIGIN`: la dirección de la muestra (por ejemplo `https://muestra-vecinos.vercel.app`).
   - `COMMUNITY_TRUST_PROXY=1`.
   - No cargues `CLOUDINARY_URL`.
3. **Desplegá.** El build crea las tablas en la base de muestra.
4. **Cargá los datos ficticios** desde tu computadora, con la cadena de la base de muestra:

   ```powershell
   $env:DEMO_DATABASE_URL = 'postgresql://USUARIO:CLAVE@HOST/vecinos_demo?sslmode=require'
   $env:DEMO_ALLOW_REMOTE = '1'
   npm run demo:seed
   ```

   La portada lee la base en cada visita, así que los datos aparecen enseguida, sin redesplegar.
5. **Mantenerla viva.** Los planes y beneficios usan fechas relativas al día del seed y vencen. Repetí `npm run demo:seed` cada una o dos semanas.

## 4. Qué verificar después

- Página real: portada, `/grupos`, `/profesionales`, `/lugares` y `/comunidad`. Una prueba de crear cuenta y ver que el correo no aparece en pantalla.
- Página de muestra: cartel amarillo "Sitio de muestra", 14 grupos, 14 profesionales, 14 lugares y publicaciones en cada área de Comunidad.
- Que la página real **no** muestre el cartel y la de muestra **no** aparezca en buscadores.

## Qué no incluye este paquete

- Las fotos originales pesadas (PNG de 3 MB y un JPG de 5.7 MB en `public/`) y la carpeta `design/` con los maestros del logo quedaron fuera del commit para no engordar el repositorio. Las versiones livianas ya están dentro (`hero-avenida.jpg`, `esquina-atardecer.jpg`, etc. y `public/brand/`).
- Si en tu base de producción existen los mismos registros de prueba que tenías en la local (Pepe Saez, Alberto Forty, Pedro Alvares y los lugares "Pedro" y "Parque Sarmiento"), repetí allá el cambio de sus fotos: en la base local ya se reemplazaron, en la real de producción no. Además, la caché de imágenes de Vercel puede conservar copias de esas fotos aunque Cloudinary ya no las tenga; después de corregir la base, purgá esa caché desde el panel de Vercel (Settings > Data Cache o el aviso de la imagen) o redesplegá.
