import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test-secret';
const { buildServer } = await import('../src/app.js');

let server, base;
before(async () => {
  server = buildServer();
  await new Promise((r) => server.listen(0, r));
  base = `http://localhost:${server.address().port}/api`;
});
after(() => server.close());

async function call(method, path, body, token) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => null) };
}
const login = async (email) => (await call('POST', '/auth/login', { email, password: '1234' })).data.token;

test('health e categorias são públicos', async () => {
  assert.equal((await call('GET', '/health')).data.status, 'ok');
  assert.equal((await call('GET', '/categories')).data.length, 8);
});

test('login: sucesso, erro e rota protegida', async () => {
  const ok = await call('POST', '/auth/login', { email: 'daniel@tefreela.com', password: '1234' });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.user.role, 'cliente');
  assert.equal((await call('POST', '/auth/login', { email: 'daniel@tefreela.com', password: 'errada' })).status, 401);
  assert.equal((await call('GET', '/me')).status, 401);
  assert.equal((await call('GET', '/me', null, ok.data.token)).data.name, 'Daniel');
});

test('cadastro valida dados e bloqueia e-mail duplicado', async () => {
  assert.equal((await call('POST', '/auth/register', { name: 'A', email: 'x', password: '1', role: 'x' })).status, 400);
  const r = await call('POST', '/auth/register', { name: 'Ana Lima', email: 'ana@teste.com', password: 'abcd', role: 'cliente' });
  assert.equal(r.status, 201);
  assert.equal(r.data.user.credits, 350);
  assert.equal((await call('POST', '/auth/register', { name: 'Ana Lima', email: 'ANA@teste.com', password: 'abcd', role: 'cliente' })).status, 409);
});

test('busca de serviços com filtros', async () => {
  assert.equal((await call('GET', '/services')).data.length, 3);
  assert.equal((await call('GET', '/services?category=Design')).data[0].freelancer, 'Mariana Santos');
  assert.equal((await call('GET', '/services?maxPrice=100')).data.length, 2);
  assert.equal((await call('GET', '/services?q=site')).data.length, 1);
  assert.equal((await call('GET', '/services?q=inexistente')).data.length, 0);
  assert.equal((await call('GET', '/services/999')).status, 404);
});

test('fluxo completo: contratar, aceitar, executar, concluir, avaliar', async () => {
  const cliente = await login('daniel@tefreela.com');
  const freela = await login('carlos@tefreela.com');

  assert.equal((await call('POST', '/hirings', { serviceId: 1, description: 'curto' }, cliente)).status, 400);
  assert.equal((await call('POST', '/hirings', { serviceId: 1, description: 'Preciso de um site para minha loja' }, freela)).status, 403);

  const h = await call('POST', '/hirings', { serviceId: 1, description: 'Preciso de um site para minha loja' }, cliente);
  assert.equal(h.status, 201);
  assert.equal(h.data.status, 'aguardando');
  assert.equal((await call('GET', '/credits', null, cliente)).data.balance, 230); // 350 - 120

  // cliente não pode aceitar; freelancer de outro serviço não acessa
  assert.equal((await call('PATCH', `/hirings/${h.data.id}/status`, { status: 'aceita' }, cliente)).status, 409);
  assert.equal((await call('GET', `/hirings/${h.data.id}`, null, await login('joao@tefreela.com'))).status, 403);

  // transições na ordem certa
  assert.equal((await call('PATCH', `/hirings/${h.data.id}/status`, { status: 'concluida' }, freela)).status, 409);
  assert.equal((await call('PATCH', `/hirings/${h.data.id}/status`, { status: 'aceita' }, freela)).data.step, 2);
  assert.equal((await call('PATCH', `/hirings/${h.data.id}/status`, { status: 'andamento' }, freela)).data.step, 3);

  // chat
  assert.equal((await call('POST', `/hirings/${h.data.id}/messages`, { text: 'Olá!' }, freela)).status, 201);
  const thread = await call('GET', `/hirings/${h.data.id}/messages`, null, cliente);
  assert.equal(thread.data.messages.length, 2);
  assert.equal(thread.data.messages[1].mine, false);

  // não avalia antes de concluir
  assert.equal((await call('POST', `/hirings/${h.data.id}/review`, { rating: 5 }, cliente)).status, 409);

  const before = (await call('GET', '/credits', null, freela)).data.balance;
  assert.equal((await call('PATCH', `/hirings/${h.data.id}/status`, { status: 'concluida' }, freela)).data.status, 'concluida');
  assert.equal((await call('GET', '/credits', null, freela)).data.balance, before + 110); // 120 - taxa 10

  const rv = await call('POST', `/hirings/${h.data.id}/review`, { rating: 5, comment: 'Ótimo!' }, cliente);
  assert.equal(rv.status, 201);
  assert.equal(rv.data.reviewed, true);
  assert.equal((await call('POST', `/hirings/${h.data.id}/review`, { rating: 4 }, cliente)).status, 409);
  assert.equal((await call('GET', '/services/1')).data.reviews, 33);
});

test('recusar uma solicitação reembolsa o cliente', async () => {
  const cliente = await login('maria@tefreela.com');
  const freela = await login('mariana@tefreela.com');
  const antes = (await call('GET', '/credits', null, cliente)).data.balance;
  const h = await call('POST', '/hirings', { serviceId: 2, description: 'Logo e paleta para minha loja' }, cliente);
  assert.equal((await call('GET', '/credits', null, cliente)).data.balance, antes - 80);
  await call('PATCH', `/hirings/${h.data.id}/status`, { status: 'recusada' }, freela);
  assert.equal((await call('GET', '/credits', null, cliente)).data.balance, antes);
});

test('freelancer gerencia seus serviços; painel mostra números', async () => {
  const freela = await login('carlos@tefreela.com');
  const cliente = await login('daniel@tefreela.com');
  assert.equal((await call('POST', '/services', { title: 'Logo', price: 10, days: 1, categoryId: 'des' }, freela)).status, 400);
  const s = await call('POST', '/services', { title: 'Aplicativo mobile sob medida', price: 9999, days: 30, categoryId: 'tec' }, freela);
  assert.equal(s.status, 201);
  assert.equal((await call('POST', '/services', { title: 'Aplicativo mobile', price: 10, days: 1, categoryId: 'tec' }, cliente)).status, 403);
  assert.equal((await call('PATCH', `/services/${s.data.id}`, { price: 8888 }, freela)).data.price, 8888);
  assert.equal((await call('PATCH', `/services/${s.data.id}`, { price: 1 }, await login('joao@tefreela.com'))).status, 403);
  // saldo insuficiente
  const h = await call('POST', '/hirings', { serviceId: s.data.id, description: 'Quero um app completo' }, cliente);
  assert.equal(h.status, 402);
  assert.equal((await call('DELETE', `/services/${s.data.id}`, null, freela)).status, 200);
  assert.equal((await call('GET', `/services/${s.data.id}`)).status, 404);
  const d = await call('GET', '/dashboard', null, freela);
  assert.equal(typeof d.data.pending, 'number');
  assert.equal((await call('GET', '/dashboard', null, cliente)).status, 403);
});

test('conversas e recarga de créditos', async () => {
  const cliente = await login('daniel@tefreela.com');
  const convs = await call('GET', '/conversations', null, cliente);
  assert.ok(convs.data.length >= 1);
  assert.ok(convs.data[0].other);
  const before = (await call('GET', '/credits', null, cliente)).data.balance;
  assert.equal((await call('POST', '/credits/topup', { amount: 100 }, cliente)).data.balance, before + 100);
  assert.equal((await call('POST', '/credits/topup', { amount: 5000 }, cliente)).status, 400);
});
