import { config } from './config.js';
import { buildServer } from './app.js';

const server = buildServer();
server.listen(config.port, '0.0.0.0', () => {
  console.log(`Tefreela API rodando em http://localhost:${config.port}/api`);
  console.log('Contas de demonstração (senha 1234): daniel@tefreela.com (cliente), carlos@tefreela.com (freelancer)');
});
