import { db, now, tx } from './db.js';
import { hashPassword } from './auth.js';
import { config } from './config.js';

const categories = [
  ['tec', '💻', 'Tecnologia'], ['des', '🎨', 'Design'], ['man', '🔧', 'Manutenção'], ['edu', '📚', 'Educação'],
  ['fot', '📸', 'Fotografia'], ['dom', '🏠', 'Doméstico'], ['mkt', '📱', 'Marketing'], ['red', '✍️', 'Redação'],
];

export function seedCategories() {
  const ins = db.prepare('INSERT OR IGNORE INTO categories (id, icon, name) VALUES (?, ?, ?)');
  for (const c of categories) ins.run(...c);
}

// Cria dados de demonstração (mesmos do protótipo). Só roda se não houver usuários.
export function seedDemo() {
  seedCategories();
  if (db.prepare('SELECT COUNT(*) n FROM users').get().n > 0) return false;
  const pw = hashPassword('1234');
  tx(() => {
    const u = db.prepare('INSERT INTO users (name,email,password_hash,role,headline,city,credits,created_at) VALUES (?,?,?,?,?,?,?,?)');
    const daniel = u.run('Daniel', 'daniel@tefreela.com', pw, 'cliente', null, 'Brasília, DF', 350, now()).lastInsertRowid;
    const maria = u.run('Maria Santos', 'maria@tefreela.com', pw, 'cliente', null, 'Brasília, DF', 350, now()).lastInsertRowid;
    const carlos = u.run('Carlos Oliveira', 'carlos@tefreela.com', pw, 'freelancer', 'Desenvolvedor Full Stack', 'Manaus, AM', 350, now()).lastInsertRowid;
    const mariana = u.run('Mariana Santos', 'mariana@tefreela.com', pw, 'freelancer', 'Designer Gráfica', 'Brasília, DF', 350, now()).lastInsertRowid;
    const joao = u.run('João Pereira', 'joao@tefreela.com', pw, 'freelancer', 'Eletricista', 'Goiânia, GO', 350, now()).lastInsertRowid;

    const s = db.prepare('INSERT INTO services (freelancer_id,category_id,title,description,emoji,price,days,rating_avg,rating_count,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)');
    const s1 = s.run(carlos, 'tec', 'Criação de site institucional', 'Site responsivo para pequenas empresas, com briefing, design e publicação.', '💻', 120, 7, 4.9, 32, now()).lastInsertRowid;
    const s2 = s.run(mariana, 'des', 'Identidade visual completa', 'Logo, paleta de cores e tipografia para a sua marca.', '🎨', 80, 5, 4.8, 21, now()).lastInsertRowid;
    const s3 = s.run(joao, 'man', 'Instalação elétrica residencial', 'Instalação e manutenção elétrica residencial com segurança.', '🔧', 60, 2, 4.7, 15, now()).lastInsertRowid;

    const h = db.prepare('INSERT INTO hirings (service_id,client_id,freelancer_id,price,days,description,status,step,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)');
    const h1 = h.run(s1, maria, carlos, 120, 7, 'Preciso de um site institucional para uma pequena empresa...', 'andamento', 3, '2026-10-02T12:00:00.000Z', now()).lastInsertRowid;
    h.run(s2, daniel, mariana, 80, 5, 'Logo e paleta para minha loja.', 'aguardando', 1, '2026-09-28T12:00:00.000Z', now());
    const h3 = h.run(s3, daniel, joao, 60, 2, 'Troca de quadro de luz.', 'concluida', 4, '2026-09-15T12:00:00.000Z', now()).lastInsertRowid;

    const m = db.prepare('INSERT INTO messages (hiring_id,sender_id,text,created_at) VALUES (?,?,?,?)');
    m.run(h1, maria, 'Olá! Gostaria de saber se o site pode ter integração com Instagram.', now());
    m.run(h1, carlos, 'Sim, posso incluir essa integração.', now());
    m.run(h3, daniel, 'Troca de quadro de luz.', now());

    const t = db.prepare('INSERT INTO transactions (user_id,hiring_id,value,description,created_at) VALUES (?,?,?,?,?)');
    t.run(daniel, h3, -60, 'Contratação de serviço', '2026-09-15T12:00:00.000Z');
    t.run(joao, h3, 60, 'Serviço concluído', '2026-09-17T12:00:00.000Z');
    t.run(joao, h3, -10, 'Taxa da plataforma', '2026-09-17T12:00:00.000Z');
  });
  return true;
}

 // Cria/atualiza a conta administrativa somente com senha fornecida no ambiente.
export function seedDeveloper() {
  const email = config.developerEmail;
  const password = config.developerPassword;
  if (!password) return false;
  if (password.length < 12) {
    console.error('DEVELOPER_PASSWORD deve ter pelo menos 12 caracteres; conta dev não foi criada.');
    return false;
  }
  const existing = db.prepare('SELECT id, is_developer FROM users WHERE email = ?').get(email);
  if (existing && !existing.is_developer) {
    console.error('O e-mail configurado para desenvolvedor já pertence a uma conta comum. Escolha outro DEVELOPER_EMAIL.');
    return false;
  }
  if (existing) {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(password), existing.id);
    return true;
  }
  const id = db.prepare(
    'INSERT INTO users (name,email,password_hash,role,is_developer,headline,city,credits,created_at) VALUES (?,?,?,?,?,?,?,?,?)'
  ).run('Equipe Tefreela', email, hashPassword(password), 'freelancer', 1, 'Desenvolvimento', null, 0, now()).lastInsertRowid;
  return Boolean(id);
}
// Uso: node src/seed.js [--reset]
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  if (process.argv.includes('--reset')) {
    db.exec('PRAGMA foreign_keys = OFF');
    for (const t of ['reviews', 'messages', 'transactions', 'hirings', 'services', 'users']) db.exec(`DELETE FROM ${t}`);
    db.exec("DELETE FROM sqlite_sequence; PRAGMA foreign_keys = ON");
  }
  console.log(seedDemo() ? 'Dados de demonstração criados.' : 'Banco já possui dados; nada a fazer (use --reset).');
}
