// Converte linhas do banco no formato que o front-end já usava nos dados de exemplo.
const pad = (n) => String(n).padStart(2, '0');
export function fmtDate(iso) {
  const d = new Date(iso);
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

export const SERVICE_SELECT = `
  SELECT s.id, s.title, s.description, s.emoji, s.price, s.days, s.rating_avg, s.rating_count, s.active,
         c.id AS category_id, c.name AS category,
         u.id AS freelancer_id, u.name AS freelancer, u.headline AS role, u.city
  FROM services s
  JOIN users u ON u.id = s.freelancer_id
  JOIN categories c ON c.id = s.category_id`;

export const serviceOut = (r) => ({
  id: r.id, title: r.title, description: r.description, emoji: r.emoji,
  price: r.price, days: r.days,
  rating: Math.round(r.rating_avg * 10) / 10, reviews: r.rating_count,
  category: r.category, categoryId: r.category_id,
  freelancerId: r.freelancer_id, freelancer: r.freelancer, role: r.role, city: r.city,
});

export const HIRING_SELECT = `
  SELECT h.*, s.title AS service, cu.name AS client, fu.name AS freelancer,
         r.rating AS review_rating
  FROM hirings h
  JOIN services s ON s.id = h.service_id
  JOIN users cu ON cu.id = h.client_id
  JOIN users fu ON fu.id = h.freelancer_id
  LEFT JOIN reviews r ON r.hiring_id = h.id`;

export const hiringOut = (r) => ({
  id: r.id, service: r.service, serviceId: r.service_id,
  client: r.client, clientId: r.client_id,
  freelancer: r.freelancer, freelancerId: r.freelancer_id,
  price: r.price, days: r.days, date: fmtDate(r.created_at),
  status: r.status, step: r.step, msg: r.description,
  reviewed: r.review_rating != null, reviewRating: r.review_rating ?? null,
});

export const userOut = (u) => ({
  id: u.id, name: u.name, email: u.email, role: u.role,
  headline: u.headline, city: u.city, credits: u.credits,
});
