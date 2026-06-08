// Centraliza todas as chamadas para o backend.
// Em dev, o Vite redireciona /api → http://localhost:3001 (via proxy).
// Em produção, defina VITE_API_URL no .env do client apontando para seu backend (ex: Render).

const BASE = import.meta.env.VITE_API_URL ?? '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro na requisição');
  return data;
}

// --- Palpites ---
export const getPalpites = () => request('/api/palpites');
export const postPalpite = (nome, grupos) =>
  request('/api/palpites', {
    method: 'POST',
    body: JSON.stringify({ nome, grupos }),
  });

// --- Pódio ---
export const getPodios = () => request('/api/podio');
export const postPodio = (nome, p1, p2, p3) =>
  request('/api/podio', {
    method: 'POST',
    body: JSON.stringify({ nome, p1, p2, p3 }),
  });

// --- Ranking ---
export const getRanking = () => request('/api/ranking');

// --- Oráculo ---
export const consultarOraculo = (pergunta) =>
  request('/api/oracle', {
    method: 'POST',
    body: JSON.stringify({ pergunta }),
  });

// --- Jogos ao vivo ---
export const getJogos = () => request('/api/jogos');
