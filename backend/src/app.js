import { db, now, tx } from './db.js';
import { config } from './config.js';
import { hashPassword, verifyPassword, signToken } from './auth.js';
import { route, createServer, bad, notFound, forbidden, created, rateLimit, HttpError } from './http.js';
import { SERVICE_SELECT, serviceOut, HIRING_SELECT, hiringOut, userOut, fmtDate } from './serializers.js';
import { seedDemo } from './seed.js';

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const int = (v) => (Number.isInteger(v) ? v : Number.isInteger(Number(v)) && v !== '' && v !== null ? Number(v) : NaN);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Saúde ----------
route('GET', '/api/health', () => ({ status: 'ok', time: now() }), { auth: false });

// ---------- Autenticação ----------
route('POST', '/api/auth/register', ({ body, ip }) => {
  rateLimit(ip);
  const name = str(body.name), email = str(body.email).toLowerCase(), password = String(body.password || '');
  const role = body.role;
  if (name.length < 2) throw bad('Informe seu nome.');
  if (!EMAIL_RE.test(email)) throw bad('Informe um e-mail válido.');
  if (password.length < 4) throw bad('A senha deve ter no mínimo 4 caracteres.');
  if (!['cliente', 'freelancer'].includes(role)) throw bad('Escolha entre cliente e freelancer.');
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) throw new HttpError(409, 'Este e-mail já está cadastrado.');
  const id = db.prepare(
    'INSERT INTO users (name,email,password_hash,role,headline,city,credits,created_at) VALUES (?,?,?,?,?,?,?,?)'
  ).run(name, email, hashPassword(password), role, str(body.headline) || null, str(body.city) || null, config.initialCredits, now()).lastInsertRowid;
  db.prepare('INSERT INTO transactions (user_id,value,description,created_at) VALUES (?,?,?,?)')
    .run(id, config.initialCredits, 'Créditos iniciais (simulação)', now());
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return created({ token: signToken(id), user: userOut(user) });
}, { auth: false });

route('POST', '/api/auth/login', ({ body, ip }) => {
  rateLimit(ip);
  const email = str(body.email).toLowerCase(), password = String(body.password || '');
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !verifyPassword(password, user.password_hash)) throw new HttpError(401, 'E-mail ou senha incorretos.');
  return { token: signToken(user.id), user: userOut(user) };
}, { auth: false });

route('GET', '/api/me', ({ user }) => userOut(user));

route('PATCH', '/api/me', ({ user, body }) => {
  const name = body.name === undefined ? user.name : str(body.name);
  if (name.length < 2) throw bad('Informe seu nome.');
  db.prepare('UPDATE users SET name=?, headline=?, city=? WHERE id=?').run(
    name,
    body.headline === undefined ? user.headline : str(body.headline) || null,
    body.city === undefined ? user.city : str(body.city) || null,
    user.id
  );
  return userOut(db.prepare('SELECT * FROM users WHERE id = ?').get(user.id));
});

// ---------- Categorias e serviços ----------
route('GET', '/api/categories', () => db.prepare('SELECT id, icon, name FROM categories ORDER BY rowid').all(), { auth: false });

route('GET', '/api/services', ({ query }) => {
  const where = ['s.active = 1'], args = [];
  if (query.q) { where.push('(s.title LIKE ? OR s.description LIKE ?)'); args.push(`%${query.q}%`, `%${query.q}%`); }
  if (query.category) { where.push('(c.name = ? OR c.id = ?)'); args.push(query.category, query.category); }
  if (query.maxPrice && Number.isFinite(Number(query.maxPrice))) { where.push('s.price <= ?'); args.push(Number(query.maxPrice)); }
  const rows = db.prepare(`${SERVICE_SELECT} WHERE ${where.join(' AND ')} ORDER BY s.rating_avg DESC, s.id`).all(...args);
  return rows.map(serviceOut);
}, { auth: false });

route('GET', '/api/services/mine', ({ user }) =>
  db.prepare(`${SERVICE_SELECT} WHERE s.freelancer_id = ? ORDER BY s.id DESC`).all(user.id).map(serviceOut),
  { role: 'freelancer' });

route('GET', '/api/services/:id', ({ params }) => {
  const row = db.prepare(`${SERVICE_SELECT} WHERE s.id = ? AND s.active = 1`).get(params.id);
  if (!row) throw notFound('Serviço não encontrado.');
  return serviceOut(row);
}, { auth: false });

function validateService(body, partial = false) {
  const out = {};
  if (!partial || body.title !== undefined) { out.title = str(body.title); if (out.title.length < 5) throw bad('O título deve ter ao menos 5 caracteres.'); }
  if (!partial || body.description !== undefined) out.description = str(body.description);
  if (!partial || body.price !== undefined) { out.price = int(body.price); if (!(out.price > 0)) throw bad('Informe um valor em créditos maior que zero.'); }
  if (!partial || body.days !== undefined) { out.days = int(body.days); if (!(out.days > 0)) throw bad('Informe um prazo em dias maior que zero.'); }
  if (!partial || body.categoryId !== undefined) {
    out.category_id = str(body.categoryId);
    if (!db.prepare('SELECT 1 FROM categories WHERE id = ?').get(out.category_id)) throw bad('Categoria inválida.');
  }
  if (body.emoji !== undefined) out.emoji = str(body.emoji) || '🛠️';
  return out;
}

route('POST', '/api/services', ({ user, body }) => {
  const v = validateService(body);
  const id = db.prepare(
    'INSERT INTO services (freelancer_id,category_id,title,description,emoji,price,days,created_at) VALUES (?,?,?,?,?,?,?,?)'
  ).run(user.id, v.category_id, v.title, v.description || '', v.emoji || '🛠️', v.price, v.days, now()).lastInsertRowid;
  return created(serviceOut(db.prepare(`${SERVICE_SELECT} WHERE s.id = ?`).get(id)));
}, { role: 'freelancer' });

function ownService(user, id) {
  const s = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  if (!s) throw notFound('Serviço não encontrado.');
  if (s.freelancer_id !== user.id) throw forbidden('Este serviço pertence a outro freelancer.');
  return s;
}

route('PATCH', '/api/services/:id', ({ user, params, body }) => {
  ownService(user, params.id);
  const v = validateService(body, true);
  const keys = Object.keys(v);
  if (keys.length) db.prepare(`UPDATE services SET ${keys.map((k) => `${k}=?`).join(', ')} WHERE id=?`).run(...keys.map((k) => v[k]), params.id);
  return serviceOut(db.prepare(`${SERVICE_SELECT} WHERE s.id = ?`).get(params.id));
}, { role: 'freelancer' });

// "Excluir" apenas desativa, para preservar o histórico de contratações.
route('DELETE', '/api/services/:id', ({ user, params }) => {
  ownService(user, params.id);
  db.prepare('UPDATE services SET active = 0 WHERE id = ?').run(params.id);
  return { ok: true };
}, { role: 'freelancer' });

// ---------- Contratações ----------
const STEP = { aguardando: 1, aceita: 2, andamento: 3, concluida: 4 };
const FLOW = {
  freelancer: { aguardando: ['aceita', 'recusada'], aceita: ['andamento'], andamento: ['concluida'] },
  cliente: { aguardando: ['cancelada'], aceita: ['cancelada'] },
};

const getHiring = (id) => db.prepare(`${HIRING_SELECT} WHERE h.id = ?`).get(id);
function accessHiring(user, id) {
  const h = getHiring(id);
  if (!h) throw notFound('Contratação não encontrada.');
  if (h.client_id !== user.id && h.freelancer_id !== user.id) throw forbidden();
  return h;
}
const addTx = (userId, hiringId, value, description) =>
  db.prepare('INSERT INTO transactions (user_id,hiring_id,value,description,created_at) VALUES (?,?,?,?,?)').run(userId, hiringId, value, description, now());
const addCredits = (userId, delta) => db.prepare('UPDATE users SET credits = credits + ? WHERE id = ?').run(delta, userId);

route('POST', '/api/hirings', ({ user, body }) => {
  const description = str(body.description);
  if (description.length < 10) throw bad('Descreva o que você precisa com pelo menos 10 caracteres.');
  const service = db.prepare('SELECT * FROM services WHERE id = ? AND active = 1').get(int(body.serviceId));
  if (!service) throw notFound('Serviço não encontrado.');
  const id = tx(() => {
    const fresh = db.prepare('SELECT credits FROM users WHERE id = ?').get(user.id);
    if (fresh.credits < service.price) throw new HttpError(402, `Saldo insuficiente: o serviço custa ${service.price} créditos e você tem ${fresh.credits}.`);
    const hid = db.prepare(
      'INSERT INTO hirings (service_id,client_id,freelancer_id,price,days,description,status,step,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)'
    ).run(service.id, user.id, service.freelancer_id, service.price, service.days, description, 'aguardando', 1, now(), now()).lastInsertRowid;
    addCredits(user.id, -service.price); // valor fica retido até a conclusão
    addTx(user.id, hid, -service.price, 'Contratação de serviço');
    db.prepare('INSERT INTO messages (hiring_id,sender_id,text,created_at) VALUES (?,?,?,?)').run(hid, user.id, description, now());
    return hid;
  });
  return created(hiringOut(getHiring(id)));
}, { role: 'cliente' });

route('GET', '/api/hirings', ({ user, query }) => {
  const col = user.role === 'cliente' ? 'h.client_id' : 'h.freelancer_id';
  const args = [user.id];
  let sql = `${HIRING_SELECT} WHERE ${col} = ?`;
  if (query.status) { sql += ' AND h.status = ?'; args.push(query.status); }
  return db.prepare(`${sql} ORDER BY h.created_at DESC, h.id DESC`).all(...args).map(hiringOut);
});

route('GET', '/api/hirings/:id', ({ user, params }) => hiringOut(accessHiring(user, params.id)));

route('PATCH', '/api/hirings/:id/status', ({ user, params, body }) => {
  const next = body.status;
  const h = accessHiring(user, params.id);
  const actor = h.freelancer_id === user.id ? 'freelancer' : 'cliente';
  if (!(FLOW[actor][h.status] || []).includes(next)) {
    throw new HttpError(409, `Não é possível mudar de "${h.status}" para "${next}" como ${actor}.`);
  }
  tx(() => {
    const step = STEP[next] ?? h.step;
    db.prepare('UPDATE hirings SET status=?, step=?, updated_at=? WHERE id=?').run(next, step, now(), h.id);
    if (next === 'recusada' || next === 'cancelada') {
      addCredits(h.client_id, h.price);
      addTx(h.client_id, h.id, h.price, 'Reembolso da contratação');
    }
    if (next === 'concluida') {
      const fee = Math.min(config.platformFee, h.price);
      addCredits(h.freelancer_id, h.price - fee);
      addTx(h.freelancer_id, h.id, h.price, 'Serviço concluído');
      if (fee) addTx(h.freelancer_id, h.id, -fee, 'Taxa da plataforma');
    }
  });
  return hiringOut(getHiring(h.id));
});

route('POST', '/api/hirings/:id/review', ({ user, params, body }) => {
  const h = accessHiring(user, params.id);
  if (h.client_id !== user.id) throw forbidden('Somente o cliente pode avaliar.');
  if (h.status !== 'concluida') throw new HttpError(409, 'Só é possível avaliar serviços concluídos.');
  const rating = int(body.rating);
  if (!(rating >= 1 && rating <= 5)) throw bad('Escolha de 1 a 5 estrelas.');
  if (db.prepare('SELECT 1 FROM reviews WHERE hiring_id = ?').get(h.id)) throw new HttpError(409, 'Esta contratação já foi avaliada.');
  tx(() => {
    db.prepare('INSERT INTO reviews (hiring_id,service_id,rating,comment,created_at) VALUES (?,?,?,?,?)').run(h.id, h.service_id, rating, str(body.comment), now());
    const s = db.prepare('SELECT rating_avg, rating_count FROM services WHERE id = ?').get(h.service_id);
    const count = s.rating_count + 1;
    db.prepare('UPDATE services SET rating_avg=?, rating_count=? WHERE id=?').run((s.rating_avg * s.rating_count + rating) / count, count, h.service_id);
  });
  return created(hiringOut(getHiring(h.id)));
});

// ---------- Mensagens ----------
route('GET', '/api/conversations', ({ user }) => {
  const col = user.role === 'cliente' ? 'h.client_id' : 'h.freelancer_id';
  const rows = db.prepare(`
    SELECT h.id AS hiring_id, s.title AS service, h.status,
           CASE WHEN h.client_id = ? THEN fu.name ELSE cu.name END AS other,
           (SELECT text FROM messages WHERE hiring_id = h.id ORDER BY id DESC LIMIT 1) AS last_text,
           (SELECT created_at FROM messages WHERE hiring_id = h.id ORDER BY id DESC LIMIT 1) AS last_at
    FROM hirings h
    JOIN services s ON s.id = h.service_id
    JOIN users cu ON cu.id = h.client_id
    JOIN users fu ON fu.id = h.freelancer_id
    WHERE ${col} = ?
    ORDER BY COALESCE(last_at, h.created_at) DESC`).all(user.id, user.id);
  return rows.map((r) => ({ hiringId: r.hiring_id, service: r.service, status: r.status, other: r.other, lastText: r.last_text, lastAt: r.last_at }));
});

route('GET', '/api/hirings/:id/messages', ({ user, params }) => {
  const h = accessHiring(user, params.id);
  const other = h.client_id === user.id ? h.freelancer : h.client;
  const msgs = db.prepare('SELECT id, sender_id, text, created_at FROM messages WHERE hiring_id = ? ORDER BY id').all(h.id)
    .map((m) => ({ id: m.id, mine: m.sender_id === user.id, text: m.text, createdAt: m.created_at }));
  return { hiringId: h.id, service: h.service, other, messages: msgs };
});

route('POST', '/api/hirings/:id/messages', ({ user, params, body }) => {
  const h = accessHiring(user, params.id);
  const text = str(body.text);
  if (!text) throw bad('Digite uma mensagem.');
  if (text.length > 2000) throw bad('A mensagem pode ter no máximo 2000 caracteres.');
  const id = db.prepare('INSERT INTO messages (hiring_id,sender_id,text,created_at) VALUES (?,?,?,?)').run(h.id, user.id, text, now()).lastInsertRowid;
  return created({ id, mine: true, text, createdAt: now() });
});

// ---------- Créditos (simulação acadêmica) ----------
route('GET', '/api/credits', ({ user }) => {
  const txs = db.prepare('SELECT id, value, description, created_at FROM transactions WHERE user_id = ? ORDER BY id DESC LIMIT 100').all(user.id);
  return {
    balance: db.prepare('SELECT credits FROM users WHERE id = ?').get(user.id).credits,
    platformFee: config.platformFee,
    transactions: txs.map((t) => ({ id: t.id, value: t.value, desc: t.description, date: fmtDate(t.created_at) })),
  };
});

route('POST', '/api/credits/topup', ({ user, body }) => {
  const amount = int(body.amount);
  if (!(amount >= 1 && amount <= 1000)) throw bad('Informe de 1 a 1000 créditos.');
  tx(() => { addCredits(user.id, amount); addTx(user.id, null, amount, 'Recarga de créditos (simulação)'); });
  return { balance: db.prepare('SELECT credits FROM users WHERE id = ?').get(user.id).credits };
});

// ---------- Painel do freelancer ----------
route('GET', '/api/dashboard', ({ user }) => {
  const count = (statuses) => db.prepare(
    `SELECT COUNT(*) n FROM hirings WHERE freelancer_id = ? AND status IN (${statuses.map(() => '?').join(',')})`
  ).get(user.id, ...statuses).n;
  return {
    name: user.name, balance: user.credits,
    pending: count(['aguardando']), active: count(['aceita', 'andamento']), completed: count(['concluida']),
  };
}, { role: 'freelancer' });

export function buildServer() {
  seedDemo(); // garante categorias e, no primeiro uso, dados de demonstração
  return createServer();
}
