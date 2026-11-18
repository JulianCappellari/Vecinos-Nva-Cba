# Sitio de muestra

Una copia completa del sitio con datos y fotos ficticios, en una base de datos aparte. No toca el seed real (`src/seed`) ni la base real.

## Qué incluye

- 14 grupos, 14 profesionales y 14 lugares (con tres fotos cada uno), suficientes para ver la paginación.
- Comunidad: 9 cuentas ficticias, 27 publicaciones aprobadas (planes, mesas de estudio, beneficios, grupos por origen y avisos), 2 pendientes de revisión y 38 inscripciones.
- Fotos ilustradas en `public/demo/` (SVG con la marca "Imagen de muestra"). Se regeneran con `npm run demo:images`.
- Los tres grupos y los tres lugares de la portada usan los ids fijos que ya espera `src/app/(panel)/page.tsx`, así que la portada se ve completa.

## Cómo usarlo

1. Crear una base vacía cuyo nombre contenga `demo` (por ejemplo `vecinosnvacba_demo`) en el mismo Postgres que ya usás.
2. Guardar su URL en `.env.demo.local` (archivo ignorado por Git):

   ```
   DEMO_DATABASE_URL="postgresql://USUARIO:CLAVE@localhost:PUERTO/vecinosnvacba_demo?schema=public"
   ```

3. Preparar y cargar:

   ```powershell
   npm run demo:migrate
   npm run demo:seed
   npm run demo:dev
   ```

   El sitio queda en http://localhost:3200 con un cartel "Sitio de muestra". Usa la carpeta `.next-demo`, así que puede correr junto al servidor normal.

`npm run demo:seed` se puede repetir: vacía la base de muestra y la vuelve a llenar. Los planes y beneficios se generan con fechas relativas a hoy, así que conviene repetirlo cada tanto para que no venzan.

## Seguridad

- Los comandos leen solo `DEMO_DATABASE_URL`. Nunca usan `DATABASE_URL` ni `.env`.
- Se niegan a correr si el nombre de la base no contiene `demo` o si el servidor no es local.
- Las cuentas de muestra (`muestraN@muestra.invalid`) tienen un hash inválido: no sirven para iniciar sesión.
- Para probar la moderación en la muestra, creá una cuenta en `/comunidad/cuenta` y promovela con `DATABASE_URL` apuntando a la base de muestra (`npm run comunidad:admin -- correo`).
- Los enlaces de grupos de WhatsApp y los teléfonos son ficticios.
