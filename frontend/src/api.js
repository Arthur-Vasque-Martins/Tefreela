import { Platform } from 'react-native';

// Endereço do back-end. Ajuste conforme onde o app roda:
//  - Emulador Android: http://10.0.2.2:3333
//  - Simulador iOS / web: http://localhost:3333
//  - Celular físico (Expo Go): http://IP-DO-SEU-COMPUTADOR:3333  (mesma rede Wi-Fi)
export const config = {
  baseUrl: Platform.OS === 'android' ? 'http://10.0.2.2:3333' : 'http://localhost:3333',
};

let token = null;
export const setToken = (t) => { token = t; };

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(`${config.baseUrl}/api${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se o back-end está rodando e o endereço em src/api.js.');
  }
  let data = null;
  try { data = await res.json(); } catch { /* sem corpo */ }
  if (!res.ok) throw new Error((data && data.error) || 'Algo deu errado. Tente novamente.');
  return data;
}

const qs = (params) => {
  const s = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  return s ? `?${s}` : '';
};

export const api = {
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  register: (data) => request('POST', '/auth/register', data),
  me: () => request('GET', '/me'),
  categories: () => request('GET', '/categories'),
  services: (params = {}) => request('GET', `/services${qs(params)}`),
  hire: (serviceId, description) => request('POST', '/hirings', { serviceId, description }),
  hirings: () => request('GET', '/hirings'),
  updateStatus: (id, status) => request('PATCH', `/hirings/${id}/status`, { status }),
  review: (id, rating, comment) => request('POST', `/hirings/${id}/review`, { rating, comment }),
  conversations: () => request('GET', '/conversations'),
  messages: (id) => request('GET', `/hirings/${id}/messages`),
  sendMessage: (id, text) => request('POST', `/hirings/${id}/messages`, { text }),
  credits: () => request('GET', '/credits'),
  topup: (amount) => request('POST', '/credits/topup', { amount }),
  dashboard: () => request('GET', '/dashboard'),
};
