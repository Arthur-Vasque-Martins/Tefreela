// Mini-framework HTTP: roteamento, JSON, CORS, autenticação e tratamento de erros.
import http from 'node:http';
import { verifyToken } from './auth.js';
import { db } from './db.js';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export const bad = (msg) => new HttpError(400, msg);
export const notFound = (msg = 'Recurso não encontrado.') => new HttpError(404, msg);
export const forbidden = (msg = 'Você não tem permissão para isso.') => new HttpError(403, msg);

const routes = [];
export function route(method, path, handler, opts = {}) {
  const keys = [];
  const re = new RegExp('^' + path.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '/?$');
  routes.push({ method, re, keys, handler, auth: opts.auth !== false, role: opts.role || null });
}

const MAX_BODY = 1_000_000;
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new HttpError(413, 'Corpo da requisição muito grande.')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(bad('JSON inválido.')); }
    });
    req.on('error', reject);
  });
}

const hits = new Map(); // limitador simples por IP para rotas de autenticação
export function rateLimit(ip, limit = 30, windowMs = 60_000) {
  const t = Date.now();
  const arr = (hits.get(ip) || []).filter((x) => t - x < windowMs);
  arr.push(t);
  hits.set(ip, arr);
  if (arr.length > limit) throw new HttpError(429, 'Muitas tentativas. Aguarde um minuto e tente novamente.');
}

function send(res, status, data) {
  const body = data === undefined ? '' : JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  });
  res.end(body);
}

export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      if (req.method === 'OPTIONS') return send(res, 204);
      const url = new URL(req.url, 'http://localhost');
      const pathname = url.pathname;
      let matched = null;
      let pathExists = false;
      for (const r of routes) {
        const m = pathname.match(r.re);
        if (!m) continue;
        pathExists = true;
        if (r.method === req.method) { matched = { r, m }; break; }
      }
      if (!matched) throw pathExists ? new HttpError(405, 'Método não permitido.') : notFound('Rota não encontrada.');

      const { r, m } = matched;
      const params = {};
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));

      let user = null;
      if (r.auth) {
        const header = req.headers.authorization || '';
        const payload = verifyToken(header.startsWith('Bearer ') ? header.slice(7) : '');
        user = payload && db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
        if (!user) throw new HttpError(401, 'Sessão inválida ou expirada. Faça login novamente.');
        if (r.role && user.role !== r.role) throw forbidden(`Apenas ${r.role === 'cliente' ? 'clientes' : 'freelancers'} podem fazer isso.`);
      }
      const body = ['POST', 'PATCH', 'PUT'].includes(req.method) ? await readBody(req) : {};
      const ctx = { params, query: Object.fromEntries(url.searchParams), body, user, ip: req.socket.remoteAddress };
      const out = await r.handler(ctx);
      if (out && out.__status) return send(res, out.__status, out.data);
      send(res, 200, out ?? { ok: true });
    } catch (err) {
      if (err instanceof HttpError) return send(res, err.status, { error: err.message });
      console.error(err);
      send(res, 500, { error: 'Erro interno do servidor.' });
    }
  });
}
export const created = (data) => ({ __status: 201, data });
