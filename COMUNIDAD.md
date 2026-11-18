# Comunidad estudiantil

Las seis funciones están en `/comunidad`, con accesos desde la portada, el menú y el pie de página.

| Área | Ruta | Funciones |
|---|---|---|
| Me sumo | /comunidad/planes | Proponer planes, fecha, lugar público, costo, cupos e inscripción/cancelación |
| Estudiamos juntos | /comunidad/estudio | Buscar por universidad, carrera, materia y categoría; publicar mesas y sumarse |
| Acabo de llegar | /comunidad/bienvenida | Guía por necesidades, checklist y avance guardado en este dispositivo |
| Con poca plata | /comunidad/presupuesto | Guías gratuitas y beneficios moderados con precio, condiciones y vencimiento |
| De dónde venís | /comunidad/origenes | Grupos por provincia, interés y ciudad; reglas e invitación a WhatsApp |
| De estudiante a estudiante | /comunidad/intercambio | Venta, donación e intercambio por categoría, foto opcional y cierre como resuelto |

## Uso y moderación

Consultar es público. Para publicar, inscribirse o reportar se necesita una cuenta en `/comunidad/cuenta`. El correo permanece privado; el nombre elegido se muestra como autor. El WhatsApp se comparte solo tras autorización explícita y aprobación. La afiliación académica y la identidad no se presentan como verificadas.

Las nuevas publicaciones y las ediciones ingresan como pendientes. El titular puede consultar su estado y el motivo de revisión en `/comunidad/mis-publicaciones`. Puede editar mientras no haya inscripciones, o cerrar la publicación. Los planes con participantes deben cerrarse y recrearse para modificar los datos. Las inscripciones cerradas siguen siendo visibles para sus participantes y pueden cancelarse.

No hay contraseña administrativa predeterminada ni elevación de rol desde el navegador. Para habilitar a una persona del equipo:

1. Crear su cuenta normalmente.
2. Desde el entorno que apunta a la base correcta ejecutar:

   ```powershell
   npm run comunidad:admin -- correo-de-la-cuenta
   ```

3. Entrar a `/comunidad/moderacion`. La persona moderadora abre cada ficha y registra una aprobación, pedido de cambios o cierre con motivo. La revisión resuelve los reportes pendientes de esa ficha.

Los planes duran hasta su finalización; las inscripciones cierran al comenzar. Los beneficios tienen vencimiento explícito. Mesas y avisos duran 30 días; grupos, 90. Los vencidos desaparecen del catálogo público.

## Configuración

- Se conserva Next.js, Prisma y PostgreSQL. La migración `20261118120000_comunidad_estudiantil` es aditiva: crea las tablas comunitarias sin reemplazar el catálogo.
- El cliente se genera en `src/generated/prisma` (ignorado por Git). Ejecutar `npm run prisma:deploy` para migrar/generar en otros entornos.
- En esta máquina se aplicó la migración a la base local real mediante el puente existente `localhost:5435`. Solo se corrigió ese puerto en `.env`; las credenciales se preservaron.
- Para fotos se usa el `CLOUDINARY_URL` ya existente. Se aceptan JPG/PNG/WebP de hasta 2 MB. La carga requiere sesión, valida la firma del archivo, limita solicitudes y verifica titularidad del activo al publicar. Se revierte el archivo externo si falla su registro local. No se hacen cargas de prueba al servicio externo.
- En producción, servir por HTTPS: las cookies llevan `Secure`, `HttpOnly`, `SameSite=Lax` y prefijo `__Host-`.
- Contraseñas: scrypt con sal aleatoria, formato versionado y perfil N=32768, r=8, p=3, uno de los perfiles de [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). Se usa la [API nativa de Node](https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback), con comparación constante y actualización del formato inicial al ingresar.
- Opcional: `COMMUNITY_ORIGIN` fija el origen externo exacto (sin barra final) detrás de un proxy. Si falta, se compara el encabezado Origin con el Host y protocolo de la petición.
- Solo si el proxy confiable reemplaza `X-Forwarded-For`, establecer `COMMUNITY_TRUST_PROXY=1` para limitar accesos por IP. De lo contrario hay un límite compartido, además del límite por correo/cuenta.
- `NEXT_DIST_DIR` permite aislar la salida de un servidor/build adicional; por defecto sigue siendo `.next`.
- No se agregaron eventos, asistentes, descuentos ni comerciantes ficticios a la base real. Para empezar, el equipo debe cargar y aprobar propuestas reales.

## Verificación

TypeScript, ESLint y una compilación de producción se verificaron. Las pruebas HTTP integrales usan una base separada, datos ficticios únicos por ejecución y limpieza limitada a esos datos.

Para repetirlas: generar el cliente, preparar una base aislada llamada `vecinos_community_test` o `vecinos_community_dev` en `127.0.0.1:55432`, aplicar migraciones e iniciar un servidor apuntando a esa misma base. No utilizar la base real. Luego:

```powershell
$env:DATABASE_URL='postgresql://postgres@127.0.0.1:55432/vecinos_community_test?schema=public&connection_limit=5'
$env:COMMUNITY_TEST_URL='http://127.0.0.1:3100'
$env:COMMUNITY_TEST_RUN='1'
npm run test:comunidad
```

El ejemplo supone una base local aislada ya provisionada; la autenticación depende de su configuración local. El test rechaza otras ubicaciones/nombres. Cubre origen/CSRF, sesiones, roles, propiedad, moderación e historial, consentimiento, URLs/fotos/fechas inválidas, búsqueda global y filtros, cupos simultáneos, idempotencia, revisión obsoleta, cierre, vencimiento y cambio de contraseña.

La carga exitosa a Cloudinary no se verificó contra el servicio real. No hay recuperación de contraseña por correo ni envío de notificaciones: el contacto es externo y voluntario. Los scripts de seed antiguos eliminan registros del catálogo; no son necesarios para activar la comunidad.
