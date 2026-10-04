export const categories = [
  { id: 'tec', icon: '💻', name: 'Tecnologia' }, { id: 'des', icon: '🎨', name: 'Design' },
  { id: 'man', icon: '🔧', name: 'Manutenção' }, { id: 'edu', icon: '📚', name: 'Educação' },
  { id: 'fot', icon: '📸', name: 'Fotografia' }, { id: 'dom', icon: '🏠', name: 'Doméstico' },
  { id: 'mkt', icon: '📱', name: 'Marketing' }, { id: 'red', icon: '✍️', name: 'Redação' },
];
export const services = [
  { id: 1, title: 'Criação de site institucional', freelancer: 'Carlos Oliveira', role: 'Desenvolvedor Full Stack', city: 'Manaus, AM', rating: 4.9, reviews: 32, price: 120, days: 7, category: 'Tecnologia', emoji: '💻' },
  { id: 2, title: 'Identidade visual completa', freelancer: 'Mariana Santos', role: 'Designer Gráfica', city: 'Brasília, DF', rating: 4.8, reviews: 21, price: 80, days: 5, category: 'Design', emoji: '🎨' },
  { id: 3, title: 'Instalação elétrica residencial', freelancer: 'João Pereira', role: 'Eletricista', city: 'Goiânia, GO', rating: 4.7, reviews: 15, price: 60, days: 2, category: 'Manutenção', emoji: '🔧' },
];
export const hirings = [
  { id: 1, service: 'Criação de site institucional', client: 'Maria Santos', freelancer: 'Carlos Oliveira', price: 120, days: 7, date: '02/10/2026', status: 'andamento', step: 3, msg: 'Preciso de um site institucional para uma pequena empresa...' },
  { id: 2, service: 'Identidade visual completa', client: 'Daniel', freelancer: 'Mariana Santos', price: 80, days: 5, date: '28/09/2026', status: 'aguardando', step: 1, msg: 'Logo e paleta para minha loja.' },
  { id: 3, service: 'Instalação elétrica residencial', client: 'Daniel', freelancer: 'João Pereira', price: 60, days: 2, date: '15/09/2026', status: 'concluida', step: 4, msg: 'Troca de quadro de luz.' },
];
export const transactions = [
  { id: 1, value: 120, desc: 'Serviço concluído', date: '02/10/2026' },
  { id: 2, value: -80, desc: 'Contratação de serviço', date: '28/09/2026' },
  { id: 3, value: -10, desc: 'Taxa da plataforma', date: '28/09/2026' },
];
export const messages = [
  { id: 1, mine: true, text: 'Olá! Gostaria de saber se o site pode ter integração com Instagram.' },
  { id: 2, mine: false, text: 'Sim, posso incluir essa integração.' },
];
export const portfolio = ['🖥️', '📱', '🛒', '📰'];
