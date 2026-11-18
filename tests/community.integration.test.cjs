const { test } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID, randomBytes, scryptSync, createHash } = require("node:crypto");
const { PrismaClient } = require("../src/generated/prisma");
const base = process.env.COMMUNITY_TEST_URL || "http://127.0.0.1:3100";
const dbUrl = process.env.DATABASE_URL || "";
if (process.env.COMMUNITY_TEST_RUN !== "1" || !/^postgresql:\/\/[^@]*@127\.0\.0\.1:55432\/vecinos_community_(dev|test)(?:\?|$)/.test(dbUrl) || !/^http:\/\/127\.0\.0\.1:\d+$/.test(base)) throw new Error("Use COMMUNITY_TEST_RUN=1 and the isolated local community test database on 55432. Never run against the project database.");
const db = new PrismaClient();
const prefix = "qa-" + randomUUID().slice(0, 8);
const password = randomBytes(20).toString("hex");
const users = [], ids = [];
const email = tag => prefix + "-" + tag + "@example.invalid";
const payload = (kind, overrides = {}) => {
  const types = {
    PLAN: { category: "Mates y charlas", data: { startsAt: new Date(Date.now() + 86400000).toISOString(), endsAt: new Date(Date.now() + 90000000).toISOString(), capacity: 2, location: "Plaza de prueba, punto público", cost: 0, welcomeSolo: true } },
    STUDY: { category: "Final", data: { university: "Universidad de prueba", career: "Ingeniería", subject: "Álgebra", availability: "Martes por la tarde", modality: "Presencial", location: "Biblioteca de prueba", capacity: 3 } },
    BENEFIT: { category: "Comida", data: { merchant: "Comercio de prueba", location: "Local de prueba en el barrio", cost: 1200, terms: "Beneficio ficticio exclusivo de prueba, no válido para canjes.", expiresAt: new Date(Date.now() + 86400000).toISOString() } },
    GROUP: { category: "Amistad", data: { province: "Mendoza", city: "Ciudad de prueba", rules: "Respetar a las personas. Grupo ficticio de prueba automatizada.", url: "https://chat.whatsapp.com/QAOnlyNotARealInvitation" } },
    EXCHANGE: { category: "Libros", data: { operation: "Dono", condition: "Usado", price: 0, zone: "Zona de prueba" } },
  };
  return { kind, title: prefix + " " + kind, description: "Publicación ficticia creada únicamente para verificar el sistema.", contact: "5493510000000", contactConsent: true, ...types[kind], ...overrides };
};
async function request(path, { cookie = "", action, payload, origin = base, raw, type = "application/json" } = {}) {
  const response = await fetch(base + path, action || raw ? { method: "POST", headers: { "Content-Type": type, ...(origin ? { Origin: origin } : {}), ...(cookie ? { Cookie: cookie } : {}) }, body: raw || JSON.stringify({ action, payload }) } : { headers: cookie ? { Cookie: cookie } : {} });
  const contentType = response.headers.get("content-type");
  const body = contentType?.includes("application/json") ? await response.json() : await response.text();
  return { status: response.status, body, cookie: response.headers.get("set-cookie")?.split(";")[0], headers: response.headers };
}
async function auth(tag, register = true) {
  const res = await request("/api/comunidad", { action: register ? "register" : "login", payload: { name: "Prueba " + tag, email: email(tag), password, role: "ADMIN" } });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const user = await db.communityUser.findUniqueOrThrow({ where: { email: email(tag) } });
  if (!users.includes(user.id)) users.push(user.id);
  return { ...user, cookie: res.cookie, cookieHeader: res.headers.get("set-cookie") };
}
async function create(user, post, submissionKey = randomUUID()) {
  const res = await request("/api/comunidad", { cookie: user.cookie, action: "save", payload: { post, submissionKey } });
  assert.equal(res.status, 200, JSON.stringify(res.body)); ids.push(res.body.id); return res.body.id;
}
async function approve(admin, id, decision = "APPROVED") {
  const post = await db.communityPost.findUniqueOrThrow({ where: { id } });
  return request("/api/comunidad", { cookie: admin.cookie, action: "review", payload: { id, decision, version: post.updatedAt.toISOString(), note: "Revisión de prueba automatizada." } });
}

test("community: end-to-end ownership, moderation, discovery and concurrency", { timeout: 240000 }, async t => {
  let owner, admin, peers, posts = {};
  try {
    // Prove the HTTP server points to THIS isolated DB before sending any write over HTTP.
    const probeData = payload("GROUP"), salt = randomBytes(16).toString("hex");
    const probeUser = await db.communityUser.create({ data: { email: email("probe"), name: "Comprobación aislada", passwordHash: salt + ":" + scryptSync(password, salt, 64).toString("hex") } });
    users.push(probeUser.id);
    const probePost = await db.communityPost.create({ data: { kind: "GROUP", title: prefix + " sonda", description: probeData.description, category: probeData.category, data: probeData.data, contact: probeData.contact, authorId: probeUser.id, submissionKey: randomUUID(), status: "APPROVED", expiresAt: new Date(Date.now() + 60000) } });
    const probe = await request("/api/comunidad?id=" + probePost.id);
    assert.equal(probe.status, 200, "HTTP server must point to the same isolated DB. No HTTP writes have been made.");
    assert.equal(probe.body.post.id, probePost.id);
    await db.communityPost.delete({ where: { id: probePost.id } });
    await db.communityUser.delete({ where: { id: probeUser.id } });
    await t.test("all six student routes render and expose useful content", async () => {
      for (const route of ["planes", "estudio", "bienvenida", "presupuesto", "origenes", "intercambio"]) {
        const r = await request("/comunidad/" + route);
        assert.equal(r.status, 200, route); assert.match(r.body, /comunidad/);
        assert.doesNotMatch(r.body, /Este rincón necesita un momento|No pudimos cargar las publicaciones/);
      }
    });
    await t.test("sessions are hashed; signup cannot self-assign admin; CSRF rejected", async () => {
      owner = await auth("owner"); admin = await auth("moderator");
      assert.equal(owner.role, "MEMBER"); assert.equal(admin.role, "MEMBER");
      assert.ok(owner.passwordHash.startsWith("scrypt-v1:32768:8:3:"));
      assert.match(owner.cookieHeader, /HttpOnly/i); assert.match(owner.cookieHeader, /SameSite=lax/i);
      await db.communityUser.update({ where: { id: admin.id }, data: { role: "ADMIN" } });
      const session = await db.communitySession.findFirstOrThrow({ where: { userId: owner.id } });
      const token = owner.cookie.split("=")[1];
      assert.notEqual(session.tokenHash, token); assert.equal(session.tokenHash, createHash("sha256").update(token).digest("hex"));
      const csrf = await request("/api/comunidad", { cookie: owner.cookie, action: "close", origin: "https://other.example", payload: { id: "c0000000000000000000000000" } });
      assert.equal(csrf.status, 403);
      assert.equal((await request("/api/comunidad", { action: "save", payload: {} })).status, 401);
      assert.equal((await request("/api/comunidad", { action: "login", payload: { email: email("owner"), password: "incorrecta123" } })).status, 401);
      const initialSalt = randomBytes(16).toString("hex");
      await db.communityUser.update({ where: { id: owner.id }, data: { passwordHash: initialSalt + ":" + scryptSync(password, initialSalt, 64).toString("hex") } });
      await auth("owner", false);
      assert.ok((await db.communityUser.findUniqueOrThrow({ where: { id: owner.id } })).passwordHash.startsWith("scrypt-v1:32768:8:3:"));
    });
    await t.test("five publication types persist pending, hidden from others, idempotent submit", async () => {
      for (const kind of ["PLAN", "STUDY", "BENEFIT", "GROUP", "EXCHANGE"]) posts[kind] = await create(owner, payload(kind));
      const key = randomUUID(), post = payload("GROUP", { title: prefix + " repetida" });
      const id = await create(owner, post, key), repeat = await create(owner, post, key);
      assert.equal(repeat, id); assert.equal(await db.communityPost.count({ where: { submissionKey: key } }), 1);
      assert.equal((await request("/api/comunidad?id=" + posts.PLAN)).status, 404);
      assert.equal((await request("/api/comunidad?id=" + posts.PLAN, { cookie: admin.cookie })).status, 200);
      assert.equal((await request("/api/comunidad?kind=PLAN&q=" + prefix)).body.total, 0);
      assert.equal((await request("/api/comunidad?scope=mine", { cookie: owner.cookie })).body.total, 6);
      const r = await request("/api/comunidad", { cookie: owner.cookie, action: "review", payload: { id: posts.PLAN, decision: "APPROVED", version: new Date().toISOString(), note: "No autorizado" } });
      assert.equal(r.status, 403);
      const stranger = await request("/api/comunidad", { cookie: admin.cookie, action: "close", payload: { id: posts.PLAN } });
      assert.equal(stranger.status, 403); // Admin reviews through audited path, not ownership bypass.
    });
    await t.test("server validates consent, link protocols, dates and upload content", async () => {
      for (const bad of [payload("GROUP", { data: { ...payload("GROUP").data, url: "javascript:alert(1)" } }), payload("PLAN", { contactConsent: false }), payload("PLAN", { data: { ...payload("PLAN").data, endsAt: new Date(0).toISOString() } }), payload("EXCHANGE", { data: { ...payload("EXCHANGE").data, operation: "Vendo", price: 0 } })]) {
        const r = await request("/api/comunidad", { cookie: owner.cookie, action: "save", payload: { post: bad, submissionKey: randomUUID() } }); assert.equal(r.status, 400);
      }
      const oversized = await request("/api/comunidad", { cookie: owner.cookie, raw: " ".repeat(49000) }); assert.equal(oversized.status, 413);
      const form = new FormData(); form.append("image", new Blob(["fake image"], { type: "image/png" }), "fake.png");
      const upload = await fetch(base + "/api/comunidad/imagen", { method: "POST", headers: { Origin: base, Cookie: owner.cookie }, body: form }); assert.equal(upload.status, 400);
      const stolen = payload("GROUP", { imageId: "c0000000000000000000000000" });
      const r = await request("/api/comunidad", { cookie: owner.cookie, action: "save", payload: { post: stolen, submissionKey: randomUUID() } }); assert.equal(r.status, 403);
    });
    await t.test("approval is audited, public DTO omits private fields, filters match", async () => {
      for (const id of Object.values(posts)) assert.equal((await approve(admin, id)).status, 200);
      assert.equal(await db.communityReview.count({ where: { postId: { in: Object.values(posts) } } }), 5);
      for (const [kind, route] of Object.entries({ PLAN: "planes", STUDY: "estudio", BENEFIT: "presupuesto", GROUP: "origenes", EXCHANGE: "intercambio" })) {
        const html = await request("/comunidad/" + route);
        assert.equal(html.status, 200); assert.ok(html.body.includes(prefix + " " + kind), route + " must render the approved publication");
        assert.doesNotMatch(html.body, /Este rincón necesita un momento|No pudimos cargar las publicaciones/);
      }
      const publicPost = (await request("/api/comunidad?id=" + posts.STUDY)).body.post;
      assert.equal(publicPost.contact, undefined); assert.equal(publicPost.authorId, undefined); assert.equal(publicPost.reviewNote, undefined);
      assert.ok(publicPost.contactUrl.startsWith("https://wa.me/")); assert.ok(!JSON.stringify(publicPost).includes(email("owner")));
      const filters = await request("/api/comunidad?kind=STUDY&university=universidad&subject=algebra&career=INGENIERIA");
      assert.ok(filters.body.posts.some(p => p.id === posts.STUDY));
      assert.equal((await request("/api/comunidad?kind=GROUP&province=Mendoza&q=" + prefix)).body.total, 1);
      assert.equal((await request("/api/comunidad?kind=GROUP&province=Salta&q=" + prefix)).body.total, 0);
      assert.equal((await request("/api/comunidad?kind=BENEFIT&maxCost=0&q=" + prefix)).body.total, 0);
      assert.equal((await request("/api/comunidad?kind=EXCHANGE&operation=Dono&q=" + prefix)).body.total, 1);
      assert.equal((await request("/api/comunidad?kind=EXCHANGE&operation=Vendo&q=" + prefix)).body.total, 0);
      assert.equal((await request("/api/comunidad?page=-1")).status, 400);
      const invalid = await request("/api/comunidad", { cookie: owner.cookie, action: "review", payload: { id: posts.PLAN, decision: "APPROVED", note: "No autorizado", version: new Date().toISOString() } }); assert.equal(invalid.status, 403);
    });
    await t.test("search runs across pages and count uses the same filters", async () => {
      for (let i = 0; i < 14; i++) {
        const p = payload("EXCHANGE"), id = await db.communityPost.create({ data: { kind: p.kind, title: prefix + " paginado " + i, description: p.description, category: p.category, data: p.data, contact: p.contact, authorId: owner.id, submissionKey: randomUUID(), status: "APPROVED", expiresAt: new Date(Date.now() + 86400000), searchText: prefix + " paginado " + (i === 13 ? "objetivo" : i), createdAt: new Date(Date.now() - i * 1000) } }); ids.push(id.id);
      }
      const first = (await request("/api/comunidad?kind=EXCHANGE&q=" + prefix)).body;
      assert.equal(first.posts.length, 12); assert.equal(first.total, 15); assert.equal(first.pages, 2);
      const second = (await request("/api/comunidad?kind=EXCHANGE&q=" + prefix + "&page=2")).body; assert.equal(second.posts.length, 3);
      const found = (await request("/api/comunidad?kind=EXCHANGE&q=" + prefix + "%20objetivo")).body; assert.equal(found.total, 1); assert.equal(found.posts.length, 1);
    });
    await t.test("parallel RSVPs cannot overbook; repeats are idempotent; edits cannot surprise attendees", async () => {
      peers = await Promise.all(["a", "b", "c", "d"].map(tag => auth(tag)));
      const results = await Promise.all(peers.map(p => request("/api/comunidad", { cookie: p.cookie, action: "participate", payload: { id: posts.PLAN, join: true } })));
      assert.equal(results.filter(r => r.status === 200).length, 2);
      assert.equal(results.filter(r => r.status === 409).length, 2);
      assert.equal(await db.communityParticipation.count({ where: { postId: posts.PLAN } }), 2);
      const winner = peers[results.findIndex(r => r.status === 200)];
      assert.equal((await request("/api/comunidad", { cookie: winner.cookie, action: "participate", payload: { id: posts.PLAN, join: true } })).status, 200);
      assert.equal(await db.communityParticipation.count({ where: { postId: posts.PLAN } }), 2);
      const row = await db.communityPost.findUniqueOrThrow({ where: { id: posts.PLAN } });
      assert.equal((await request("/api/comunidad", { cookie: owner.cookie, action: "save", payload: { id: posts.PLAN, version: row.updatedAt.toISOString(), post: payload("PLAN") } })).status, 409);
      const html = await request("/comunidad/aviso/" + posts.PLAN, { cookie: owner.cookie }); assert.equal(html.status, 200); assert.match(html.body, /Quienes se sumaron/);
      assert.equal((await request("/api/comunidad", { cookie: winner.cookie, action: "close", payload: { id: posts.PLAN } })).status, 403);
    });
    await t.test("reports deduplicate and review resolves them; edits return to pending with stale-review protection", async () => {
      for (let i = 0; i < 2; i++) assert.equal((await request("/api/comunidad", { cookie: peers[0].cookie, action: "report", payload: { id: posts.GROUP, reason: "Reporte ficticio de prueba automatizada." } })).status, 200);
      assert.equal(await db.communityReport.count({ where: { postId: posts.GROUP } }), 1);
      assert.ok((await request("/api/comunidad?scope=reports", { cookie: admin.cookie })).body.posts.some(p => p.id === posts.GROUP));
      assert.equal((await approve(admin, posts.GROUP, "REJECTED")).status, 200);
      assert.equal(await db.communityReport.count({ where: { postId: posts.GROUP, resolvedAt: null } }), 0);
      const row = await db.communityPost.findUniqueOrThrow({ where: { id: posts.GROUP } });
      assert.equal((await request("/api/comunidad", { cookie: owner.cookie, action: "save", payload: { id: posts.GROUP, version: row.updatedAt.toISOString(), post: payload("GROUP") } })).status, 200);
      assert.equal((await request("/api/comunidad", { cookie: admin.cookie, action: "review", payload: { id: posts.GROUP, version: row.updatedAt.toISOString(), decision: "APPROVED", note: "Revisión de una versión vieja" } })).status, 409);
      assert.equal((await request("/api/comunidad?id=" + posts.GROUP)).status, 404);
    });
    await t.test("closing preserves attendee visibility, hides public listing, allows leaving; expiry is enforced", async () => {
      assert.equal((await request("/api/comunidad", { cookie: owner.cookie, action: "close", payload: { id: posts.PLAN } })).status, 200);
      assert.equal((await request("/api/comunidad?id=" + posts.PLAN)).status, 404);
      const participant = await db.communityParticipation.findFirstOrThrow({ where: { postId: posts.PLAN } });
      const peer = peers.find(p => p.id === participant.userId);
      assert.equal((await request("/api/comunidad?id=" + posts.PLAN, { cookie: peer.cookie })).status, 200);
      assert.equal((await request("/api/comunidad", { cookie: peer.cookie, action: "participate", payload: { id: posts.PLAN, join: false } })).status, 200);
      await db.communityPost.update({ where: { id: posts.BENEFIT }, data: { expiresAt: new Date(0) } });
      assert.equal((await request("/api/comunidad?id=" + posts.BENEFIT)).status, 404);
      assert.equal((await request("/api/comunidad?kind=BENEFIT&q=" + prefix)).body.total, 0);
      assert.equal((await request("/api/comunidad", { cookie: peers[3].cookie, action: "participate", payload: { id: posts.PLAN, join: true } })).status, 409);
    });
    await t.test("logout revokes session; failed password change preserves current session", async () => {
      const bad = await request("/api/comunidad", { cookie: owner.cookie, action: "password", payload: { current: "incorrecta123", password: randomBytes(20).toString("hex") } }); assert.equal(bad.status, 400);
      assert.ok((await request("/api/comunidad?view=session", { cookie: owner.cookie })).body.user);
      assert.equal((await request("/api/comunidad", { cookie: owner.cookie, action: "logout" })).status, 200);
      assert.equal((await request("/api/comunidad?view=session", { cookie: owner.cookie })).body.user, null);
    });
    await t.test("password change revokes previous sessions and prevents login with the old password", async () => {
      const first = await auth("owner", false), second = await auth("owner", false);
      const nextPassword = randomBytes(20).toString("hex");
      const change = await request("/api/comunidad", { cookie: first.cookie, action: "password", payload: { current: password, password: nextPassword } });
      assert.equal(change.status, 200);
      assert.equal((await request("/api/comunidad?view=session", { cookie: first.cookie })).body.user, null);
      assert.equal((await request("/api/comunidad?view=session", { cookie: second.cookie })).body.user, null);
      assert.ok((await request("/api/comunidad?view=session", { cookie: change.cookie })).body.user);
      assert.equal((await request("/api/comunidad", { action: "login", payload: { email: email("owner"), password } })).status, 401);
      assert.equal((await request("/api/comunidad", { action: "login", payload: { email: email("owner"), password: nextPassword } })).status, 200);
    });
    await t.test("repeated failed login attempts are throttled on the server", async () => {
      for (let i = 0; i < 12; i++) assert.equal((await request("/api/comunidad", { action: "login", payload: { email: email("throttle"), password } })).status, 401);
      assert.equal((await request("/api/comunidad", { action: "login", payload: { email: email("throttle"), password } })).status, 429);
    });
  } finally {
    // Only fixtures belonging to this unique run in the explicitly isolated DB are removed.
    await db.communityReview.deleteMany({ where: { reviewerId: { in: users } } });
    await db.communityPost.deleteMany({ where: { authorId: { in: users } } });
    await db.communityUser.deleteMany({ where: { id: { in: users } } });
    await db.$disconnect();
  }
});
