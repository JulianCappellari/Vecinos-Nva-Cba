// Sitio de muestra: base de datos aparte, datos ficticios y fotos ilustradas.
//
//   node scripts/demo.cjs migrate   crea las tablas en la base de muestra
//   node scripts/demo.cjs seed      vacía la base de muestra y la llena con datos ficticios
//   node scripts/demo.cjs dev       levanta Next en http://localhost:3200 contra esa base
//
// La base se toma de DEMO_DATABASE_URL (variable de entorno o archivo .env.demo.local).
// Por seguridad NUNCA lee DATABASE_URL ni .env, y se niega a correr si el nombre de la base
// no contiene "demo" o si el servidor no es local (salvo DEMO_ALLOW_REMOTE=1). El seed real (src/seed) no se toca.
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync, spawn } = require("node:child_process");

const ROOT = path.join(__dirname, "..");

function loadDemoUrl() {
  if (process.env.DEMO_DATABASE_URL) return process.env.DEMO_DATABASE_URL;
  const file = path.join(ROOT, ".env.demo.local");
  if (fs.existsSync(file)) {
    const line = fs.readFileSync(file, "utf8").split(/\r?\n/).find((l) => l.startsWith("DEMO_DATABASE_URL="));
    if (line) return line.slice("DEMO_DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
  }
  throw new Error("Falta DEMO_DATABASE_URL (variable de entorno o .env.demo.local).");
}

function assertDemoUrl(url) {
  const u = new URL(url);
  const db = decodeURIComponent(u.pathname.replace(/^\//, ""));
  if (!/demo/i.test(db)) throw new Error(`La base "${db}" no parece de muestra: su nombre debe contener "demo".`);
  const local = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(u.hostname);
  // Una base de muestra publicada (p. ej. en Neon) exige confirmarlo: DEMO_ALLOW_REMOTE=1.
  if (!local && process.env.DEMO_ALLOW_REMOTE !== "1") throw new Error("La base de muestra no es local. Si es la base de muestra publicada, repetí con DEMO_ALLOW_REMOTE=1.");
  return db;
}

// ---------------------------------------------------------------- datos ficticios
const GRUPOS = [
  ["Libros y café", "Cultura", "Nos juntamos a leer y a comentar un libro por mes. Hay lectores de novela, ensayo y poesía."],
  ["Corredores de la Cañada", "Deportes", "Salidas de running los martes y sábados por la mañana. Todos los ritmos, nadie se queda atrás."],
  ["Fotografía urbana", "Arte", "Recorremos el barrio con la cámara o el celular y después compartimos las mejores tomas."],
  ["Noche de juegos de mesa", "Juegos", "Un jueves por medio, juegos de cartas y de tablero. Sumamos gente nueva todo el tiempo."],
  ["Mates en el Parque Sarmiento", "Social", "Tarde de mates, charla y algún picadito. Ideal para quien recién llega y busca compañía."],
  ["Excursionistas de las Sierras", "Aire libre", "Salidas de un día a las sierras cercanas. Organizamos el transporte entre los que se anotan."],
  ["Coro y guitarreadas", "Música", "Ensayamos canciones populares y armamos guitarreadas abiertas. No hace falta saber música."],
  ["Huerta en balcón", "Hogar", "Intercambiamos plantines, semillas y trucos para cultivar en espacios chicos."],
  ["Cocina para estudiantes", "Gastronomía", "Recetas baratas y rápidas para cocinar en un departamento chico. Se arman cenas compartidas."],
  ["Intercambio de idiomas", "Idiomas", "Practicamos inglés, portugués, francés e italiano en charlas cortas con café de por medio."],
  ["Fútbol 5 de los jueves", "Deportes", "Partido semanal en cancha de la zona. Se reparte el costo entre los que juegan."],
  ["Cine club de barrio", "Cultura", "Vemos una película por semana y la charlamos después. Elegimos entre todos."],
  ["Bici por la ciudad", "Deportes", "Paseos en bici de ritmo tranquilo, con pausa para el mate. Casco obligatorio."],
  ["Voluntariado barrial", "Social", "Juntamos ropa, libros y alimentos y los llevamos a comedores y bibliotecas populares."],
];

const PROFESIONALES = [
  ["Martín", "Olmedo", ["Electricista"]],
  ["Camila", "Bustos", ["Diseñadora gráfica"]],
  ["Joaquín", "Paredes", ["Plomero", "Gasista"]],
  ["Valentina", "Roldán", ["Psicóloga"]],
  ["Nicolás", "Aguirre", ["Técnico en computadoras"]],
  ["Florencia", "Medina", ["Nutricionista"]],
  ["Tomás", "Villarreal", ["Pintor", "Albañil"]],
  ["Julieta", "Sosa", ["Profesora de matemática"]],
  ["Ezequiel", "Cabrera", ["Cerrajero"]],
  ["Agustina", "Luna", ["Fotógrafa"]],
  ["Bruno", "Herrera", ["Personal trainer"]],
  ["Mariana", "Quiroga", ["Contadora"]],
  ["Facundo", "Ledesma", ["Carpintero"]],
  ["Sofía", "Brizuela", ["Profesora de inglés"]],
];

const MAPS = "https://www.google.com/maps/search/?api=1&query=Nueva+C%C3%B3rdoba+C%C3%B3rdoba";
const LUGARES = [
  ["Café del Reloj", "Nueva Córdoba", ["Café", "Estudio"], [["Rondeau", 310]]],
  ["Plaza de los Estudiantes", "Nueva Córdoba", ["Plaza", "Aire libre"], [["Bv. Chacabuco", 0]]],
  ["Librería Cuaderno Abierto", "Nueva Córdoba", ["Librería", "Estudio"], [["Obispo Trejo", 612]]],
  ["Panadería La Masa Madre", "Nueva Córdoba", ["Panadería", "Café"], [["Fructuoso Rivera", 245]]],
  ["Bar Los Faroles", "Nueva Córdoba", ["Bar", "Música"], [["Av. Hipólito Yrigoyen", 480]]],
  ["Mirador de la Cañada", "Centro", ["Mirador", "Paseo"], [["Av. Marcelo T. de Alvear", 0]]],
  ["Cine Teatro Nuevo Sur", "Nueva Córdoba", ["Cine", "Cultura"], [["27 de Abril", 390]]],
  ["Heladería Dulce Esquina", "Nueva Córdoba", ["Heladería", "Postres"], [["Ituzaingó", 140]]],
  ["Coworking La Mesa Grande", "Nueva Córdoba", ["Coworking", "Estudio"], [["Humberto Primo", 520]]],
  ["Feria de los Sábados", "Güemes", ["Feria", "Artesanías"], [["Belgrano", 1100]]],
  ["Parque de las Tipas", "Nueva Córdoba", ["Parque", "Aire libre"], [["Av. Vélez Sarsfield", 0]]],
  ["Galería Taller Abierto", "Nueva Córdoba", ["Arte", "Cultura"], [["Caseros", 380]]],
  ["Gimnasio Barrio Fit", "Alberdi", ["Gimnasio", "Deportes"], [["Av. Colón", 1850]]],
  ["Lavadero Burbuja", "Nueva Córdoba", ["Lavadero", "Servicios"], [["Laprida", 215]]],
];

const USERS = [
  ["Mica R.", "Salta"], ["Tomi G.", "Tucumán"], ["Lau P.", "Santiago del Estero"], ["Nacho B.", "Mendoza"],
  ["Cande S.", "Santa Fe"], ["Fede L.", "Buenos Aires"], ["Rocío M.", "Jujuy"], ["Santi A.", "Córdoba"], ["Pau V.", "Catamarca"],
];

// ---------------------------------------------------------------- helpers
const pad = (n) => String(n).padStart(2, "0");
const norm = (v) => String(v).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const DAY = 86400000;
const at = (days, hourUtc, minutes = 0) => {
  const d = new Date(Date.now() + days * DAY);
  d.setUTCHours(hourUtc, minutes, 0, 0);
  return d;
};
const phone = (n) => "5493515550" + String(100 + n);

async function seed() {
  const url = loadDemoUrl();
  const db = assertDemoUrl(url);
  process.env.DATABASE_URL = url;
  const { PrismaClient } = require("../src/generated/prisma");
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  console.log(`Base de muestra: ${db}`);
  try {
    // Vacía SOLO esta base de muestra (la guarda de arriba impide apuntar a la real).
    await prisma.$transaction([
      prisma.communityRateLimit.deleteMany(), prisma.communityReview.deleteMany(), prisma.communityReport.deleteMany(),
      prisma.communityParticipation.deleteMany(), prisma.communityPost.deleteMany(), prisma.communityAsset.deleteMany(),
      prisma.communitySession.deleteMany(), prisma.communityUser.deleteMany(),
      prisma.redSocial.deleteMany(), prisma.imagen.deleteMany(), prisma.direccion.deleteMany(),
      prisma.lugar.deleteMany(), prisma.profesional.deleteMany(), prisma.grupo.deleteMany(),
    ]);

    // Los ids de la portada están fijos en src/app/(panel)/page.tsx: se reutilizan para que se vea completa.
    const GRUPO_IDS = ["96b33d16-c4ad-49a0-b612-7b6e419ffa88", "1bcdb26a-f27d-42a1-a914-b9ec29014ff9", "a85d87d7-2045-4f0a-9efd-bb7f52f04dd1"];
    const LUGAR_IDS = ["34b71c82-a584-427f-98af-568536e3c3d4", "c2bfb6bd-4d45-4985-ad06-a38b88c18294", "c80b8630-3a32-423a-b9b7-a2026cb0f929"];

    await prisma.grupo.createMany({
      data: GRUPOS.map(([nombre, tipo, descripcion], i) => ({
        ...(GRUPO_IDS[i] ? { id: GRUPO_IDS[i] } : {}),
        nombre, tipo, descripcion, imagen: `/demo/grupos/g${pad(i + 1)}.svg`,
        url: `https://chat.whatsapp.com/MUESTRA${pad(i + 1)}`,
      })),
    });

    for (let i = 0; i < PROFESIONALES.length; i++) {
      const [nombre, apellido, trabajo] = PROFESIONALES[i];
      const slug = norm(nombre + "." + apellido).replace(/\s+/g, "");
      await prisma.profesional.create({
        data: {
          nombre, apellido, trabajo, numero: "5493515550" + String(200 + i),
          imagen: { create: [{ url: `/demo/profesionales/p${pad(i + 1)}.svg` }] },
          redesSociales: { create: [
            { tipo: "Instagram", url: `https://instagram.com/muestra.${slug}` },
            ...(i % 3 === 0 ? [{ tipo: "Web", url: `https://example.com/${slug}` }] : []),
            ...(i % 4 === 1 ? [{ tipo: "Linkedin", url: `https://linkedin.com/in/muestra-${slug}` }] : []),
          ] },
        },
      });
    }

    for (let i = 0; i < LUGARES.length; i++) {
      const [nombre, barrio, tipo, dirs] = LUGARES[i];
      const slug = norm(nombre).replace(/[^a-z0-9]+/g, "-");
      await prisma.lugar.create({
        data: {
          ...(LUGAR_IDS[i] ? { id: LUGAR_IDS[i] } : {}),
          nombre, barrio, tipo, localizacion: i % 2 === 0 ? MAPS : null,
          imagenes: { create: ["a", "b", "c"].map((v) => ({ url: `/demo/lugares/l${pad(i + 1)}-${v}.svg` })) },
          direccion: { create: dirs.map(([calle, altura]) => ({ calle, altura })) },
          redes: { create: [{ tipo: "Instagram", url: `https://instagram.com/muestra.${slug}` }] },
        },
      });
    }

    // ------------------------------------------------------------ comunidad
    const users = [];
    for (let i = 0; i < USERS.length; i++) {
      users.push(await prisma.communityUser.create({
        // Hash inválido a propósito: las cuentas de muestra no sirven para iniciar sesión.
        data: { email: `muestra${i + 1}@muestra.invalid`, name: USERS[i][0], province: USERS[i][1], passwordHash: "cuenta-de-muestra-sin-acceso" },
      }));
    }

    const posts = [];
    let n = 0, img = 0;
    const add = async (kind, title, description, category, data, extra = {}) => {
      n += 1;
      const author = users[n % users.length];
      let imageId = null;
      if (extra.image !== false) {
        img += 1;
        const asset = await prisma.communityAsset.create({ data: { ownerId: author.id, publicId: `demo/c${pad(img)}`, url: `/demo/comunidad/c${pad(img)}.svg` } });
        imageId = asset.id;
      }
      const eventAt = kind === "PLAN" ? new Date(data.startsAt) : null;
      const expiresAt = kind === "PLAN" ? new Date(data.endsAt) : kind === "BENEFIT" ? new Date(data.expiresAt) : new Date(Date.now() + (kind === "GROUP" ? 90 : 30) * DAY);
      const post = await prisma.communityPost.create({
        data: {
          kind, title, description, category, data, contact: phone(n), authorId: author.id,
          status: extra.status || "APPROVED", submissionKey: `demo-${pad(n)}`, imageId, expiresAt, eventAt,
          createdAt: new Date(Date.now() - ((n % 9) + 1) * DAY),
          searchText: norm([title, description, category, ...Object.values(data)].join(" ")),
          university: kind === "STUDY" ? norm(data.university) : null, career: kind === "STUDY" ? norm(data.career) : null,
          subject: kind === "STUDY" ? norm(data.subject) : null, province: kind === "GROUP" ? data.province : null,
          cost: kind === "PLAN" || kind === "BENEFIT" ? data.cost : kind === "EXCHANGE" ? data.price : null,
        },
      });
      posts.push({ ...post, author });
      return post;
    };

    const plan = (days, hour, dur, capacity, location, cost) => ({
      startsAt: at(days, hour).toISOString(), endsAt: at(days, hour + dur).toISOString(), capacity, location, cost, welcomeSolo: true,
    });
    await add("PLAN", "Mates y charla en el Parque Sarmiento", "Nos juntamos a tomar mate y a conocernos. Podés venir solo: vamos a recibir al grupo en la entrada. Llevá tu mate si tenés.", "Mates y charlas", plan(3, 21, 2, 10, "Entrada principal del Parque Sarmiento, frente a la fuente", 0));
    await add("PLAN", "Picado de fútbol 5 para ingresantes", "Partido amistoso para gente que recién llega a la ciudad. No importa el nivel. Se reparte el costo de la cancha.", "Deportes", plan(5, 22, 2, 10, "Cancha de fútbol 5 sobre Obispo Trejo, hall de entrada", 3000));
    await add("PLAN", "Recorrido fotográfico por Nueva Córdoba", "Caminata de dos horas sacando fotos de fachadas, murales y rincones. Sirve cualquier cámara, incluido el celular.", "Cultura", plan(7, 20, 2, 12, "Plaza España, junto al monumento", 0));
    await add("PLAN", "Noche de juegos de mesa", "Llevamos juegos de cartas y de tablero. Si tenés uno que te guste, traelo. Hay mesa para quien llega sin grupo.", "Juegos", plan(9, 23, 3, 8, "Café del Reloj, Rondeau 310", 2500));
    await add("PLAN", "Intercambio de idiomas inglés y español", "Charlas de diez minutos por pareja y después rotamos. Buscamos gente que quiera practicar inglés y quien lo hable como lengua materna.", "Idiomas", plan(11, 22, 2, 16, "Patio del Café del Reloj, Rondeau 310", 0));
    await add("PLAN", "Caminata al atardecer por la Cañada", "Paseo tranquilo de una hora hasta el mirador. Ideal para despejarse después de una semana de parciales.", "Paseos", plan(14, 21, 1, 15, "Esquina de Bv. Chacabuco y Av. Hipólito Yrigoyen", 0));

    const study = (university, career, subject, availability, modality, location, capacity) => ({ university, career, subject, availability, modality, location, capacity });
    await add("STUDY", "Mesa de estudio para Anatomía", "Armamos una mesa para repasar los parciales con preguntas cruzadas. Nos juntamos con apuntes y modelos.", "Parcial", study("Universidad Nacional de Córdoba", "Medicina", "Anatomía", "Martes y jueves por la tarde", "Presencial", "Biblioteca de la facultad, sala de estudio grupal", 5));
    await add("STUDY", "Compañeros para Análisis Matemático I", "Resolvemos guías de ejercicios en conjunto y nos explicamos entre todos los temas que cuestan.", "Cursada", study("Universidad Tecnológica Nacional", "Ingeniería en Sistemas", "Análisis Matemático I", "Lunes y miércoles de 18 a 20", "Mixto", "Café del Reloj o videollamada", 6));
    await add("STUDY", "Preparamos el final de Derecho Civil", "Grupo chico para repasar el programa completo en cuatro semanas, con simulacros orales.", "Final", study("Universidad Católica de Córdoba", "Abogacía", "Derecho Civil", "Sábados por la mañana", "Presencial", "Sala de estudio de Coworking La Mesa Grande", 4));
    await add("STUDY", "Curso de ingreso: matemática básica", "Repasamos las unidades del cuadernillo de ingreso para quienes empiezan este año y nunca estudiaron en grupo.", "Ingreso", study("Universidad Nacional de Córdoba", "Ciencias Económicas", "Matemática", "Lunes a viernes a la mañana", "Virtual", "Videollamada, el enlace se acuerda por WhatsApp", 10));
    await add("STUDY", "Contabilidad: repaso de balances", "Practicamos asientos y armado de balances con ejercicios de parciales anteriores.", "Parcial", study("Universidad Nacional de Córdoba", "Ciencias Económicas", "Contabilidad", "Domingos por la tarde", "Virtual", "Videollamada, enlace por WhatsApp", 6));

    const benefit = (merchant, location, cost, terms, days) => ({ merchant, location, cost, terms, expiresAt: at(days, 2).toISOString() });
    await add("BENEFIT", "Menú universitario de panadería", "Un sándwich, una bebida y una porción dulce a precio fijo para estudiantes. Ejemplo de muestra.", "Comida", benefit("Panadería La Masa Madre", "Fructuoso Rivera 245", 4500, "Presentar credencial de estudiante. Válido de lunes a viernes hasta las 17. Un menú por persona.", 60));
    await add("BENEFIT", "Fotocopias a precio estudiante", "Precio reducido en fotocopias y anillados para apuntes y trabajos prácticos. Ejemplo de muestra.", "Estudio", benefit("Librería Cuaderno Abierto", "Obispo Trejo 612", 30, "Precio por hoja A4 simple faz. Hasta 200 hojas por visita. Presentar credencial.", 90));
    await add("BENEFIT", "Pase mensual de gimnasio para estudiantes", "Acceso a sala de musculación y clases grupales. Ejemplo de muestra.", "Actividad física", benefit("Gimnasio Barrio Fit", "Av. Colón 1850", 18000, "Precio final por mes. Requiere credencial vigente y apto médico. No incluye matrícula.", 45));
    await add("BENEFIT", "Entrada de cine los martes", "Entrada a precio reducido para funciones de martes. Ejemplo de muestra.", "Cultura", benefit("Cine Teatro Nuevo Sur", "27 de Abril 390", 3500, "Válido en funciones de martes. Una entrada por credencial. Sujeto a disponibilidad.", 30));

    const group = (province, city, rules, i) => ({ province, city, rules, url: `https://chat.whatsapp.com/MUESTRA-ORIGEN${pad(i)}` });
    await add("GROUP", "Salteños en Córdoba", "Grupo de gente de Salta que estudia o trabaja en la ciudad. Hablamos de comidas, viajes de regreso y planes.", "Amistad", group("Salta", "Salta Capital", "Respeto entre todos, sin spam ni ventas. Presentate al entrar y contá qué estudiás.", 1));
    await add("GROUP", "Tucumanos en Nueva Córdoba", "Nos juntamos a comer empanadas y a compartir trucos para vivir lejos de casa.", "Amistad", group("Tucumán", "San Miguel de Tucumán", "Un grupo para ayudarnos: sin mensajes de cadena, sin publicidad.", 2));
    await add("GROUP", "Mendocinos que estudian en Córdoba", "Compartimos horarios de micros, alquileres y planes del fin de semana.", "Estudio", group("Mendoza", "", "Buen trato y respeto. Las ofertas de alquiler deben incluir precio y zona.", 3));
    await add("GROUP", "Santafesinos en la ciudad", "Gente de Santa Fe que busca compañía para ver partidos y salir a caminar.", "Deportes", group("Santa Fe", "Rosario", "Sin discusiones de política. Entre todos cuidamos el grupo.", 4));
    await add("GROUP", "Bonaerenses en Córdoba", "Para quienes vinimos desde el conurbano o el interior de Buenos Aires. Hablamos de todo.", "Amistad", group("Buenos Aires", "La Plata", "Un solo tema por conversación y respeto en todo momento.", 5));
    await add("GROUP", "Santiagueños y amigos", "Peñas, folklore y guitarreadas. Abierto a quien quiera sumarse.", "Cultura", group("Santiago del Estero", "", "Compartimos eventos culturales. Sin spam.", 6));

    const ex = (operation, condition, price, zone) => ({ operation, condition, price, zone });
    await add("EXCHANGE", "Escritorio de madera con cajonera", "Escritorio de 120 cm en buen estado, con dos cajones. Lo retiro yo o coordinamos la entrega.", "Muebles", ex("Vendo", "Usado", 45000, "Nueva Córdoba, cerca de Plaza España"));
    await add("EXCHANGE", "Apuntes de Química Orgánica", "Apuntes impresos y anillados de toda la materia. Los dono a quien los necesite.", "Libros", ex("Dono", "Muy bueno", 0, "Nueva Córdoba"));
    await add("EXCHANGE", "Silla de estudio por lámpara de escritorio", "Cambio una silla con apoyabrazos por una lámpara de escritorio con brazo articulado.", "Hogar", ex("Intercambio", "Usado", 0, "Alberdi"));
    await add("EXCHANGE", "Calculadora científica", "Calculadora con pantalla de varias líneas, funciona perfecto y trae su tapa.", "Tecnología", ex("Vendo", "Muy bueno", 18000, "Centro"));
    await add("EXCHANGE", "Ventilador de pie", "Ventilador de pie con tres velocidades. Ideal para el verano en un departamento chico.", "Hogar", ex("Dono", "Usado", 0, "Nueva Córdoba"));
    await add("EXCHANGE", "Colección de libros de Derecho", "Seis libros de Derecho Civil y Constitucional, con subrayados leves.", "Libros", ex("Vendo", "Usado", 30000, "Güemes"));

    // Pendientes de revisión: se ven al entrar como moderación (ver COMUNIDAD.md).
    await add("STUDY", "Mesa de estudio para Psicología Evolutiva", "Nos juntamos a repasar autores y a armar cuadros comparativos para el parcial.", "Parcial", study("Universidad Nacional de Córdoba", "Psicología", "Psicología Evolutiva", "Viernes por la tarde", "Presencial", "Sala de estudio de la facultad", 5), { status: "PENDING" });
    await add("EXCHANGE", "Bicicleta rodado 26", "Bicicleta de paseo en buen estado, con luces y candado.", "Otros", ex("Vendo", "Usado", 60000, "Nueva Córdoba"), { status: "PENDING" });

    // Inscripciones: respetan el cupo y nunca incluyen a la persona que organiza.
    let joined = 0;
    for (const p of posts) {
      if (p.status !== "APPROVED" || !["PLAN", "STUDY"].includes(p.kind)) continue;
      const cap = Number(p.data.capacity);
      const target = Math.min(cap - 1, 2 + (joined % 4));
      const candidates = users.filter((u) => u.id !== p.authorId).slice(0, target);
      for (const u of candidates) {
        await prisma.communityParticipation.create({ data: { postId: p.id, userId: u.id } });
        joined += 1;
      }
    }

    const counts = {
      grupos: await prisma.grupo.count(), profesionales: await prisma.profesional.count(), lugares: await prisma.lugar.count(),
      cuentas: await prisma.communityUser.count(), publicaciones: await prisma.communityPost.count(), inscripciones: await prisma.communityParticipation.count(),
    };
    console.log("Seed de muestra listo:", counts);
  } finally {
    await prisma.$disconnect();
  }
}

function migrate() {
  const url = loadDemoUrl();
  assertDemoUrl(url);
  const r = spawnSync("npx", ["prisma", "migrate", "deploy"], { cwd: ROOT, stdio: "inherit", shell: true, env: { ...process.env, DATABASE_URL: url } });
  process.exitCode = r.status ?? 1;
}

function dev() {
  const url = loadDemoUrl();
  assertDemoUrl(url);
  console.log("Sitio de muestra en http://localhost:3200 (datos ficticios, base aparte)");
  const child = spawn("npx", ["next", "dev", "-p", "3200"], {
    cwd: ROOT, stdio: "inherit", shell: true,
    env: { ...process.env, DATABASE_URL: url, NEXT_DIST_DIR: ".next-demo", DEMO_MODE: "1" },
  });
  child.on("exit", (code) => process.exit(code ?? 0));
}

const command = process.argv[2];
const actions = { seed, migrate, dev };
if (!actions[command]) {
  console.error("Uso: node scripts/demo.cjs <migrate|seed|dev>");
  process.exit(1);
}
Promise.resolve(actions[command]()).catch((error) => { console.error(error.message); process.exitCode = 1; });
