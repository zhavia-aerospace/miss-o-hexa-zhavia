import { Router } from 'express';

const router = Router();

// Cache em memória — evita gastar créditos da API em cada request
let cache = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos

// Mapeia status da football-data.org para os códigos usados pelo frontend (padrão api-sports)
function mapStatus(status, minute) {
  switch (status) {
    case 'IN_PLAY':
      return { short: minute <= 45 ? '1H' : '2H', long: 'Primeiro Tempo', elapsed: minute ?? 0 };
    case 'PAUSED':
      return { short: 'HT', long: 'Intervalo', elapsed: 45 };
    case 'FINISHED':
      return { short: 'FT', long: 'Encerrado', elapsed: 90 };
    case 'EXTRA_TIME':
      return { short: 'ET', long: 'Prorrogação', elapsed: minute ?? 90 };
    case 'PENALTY_SHOOTOUT':
      return { short: 'P', long: 'Pênaltis', elapsed: 120 };
    default:
      // SCHEDULED, TIMED, etc.
      return { short: 'NS', long: 'Não iniciado', elapsed: null };
  }
}

// Normaliza um jogo da football-data.org para o formato esperado pelo frontend
function normalizar(match) {
  const status = mapStatus(match.status, match.minute);
  const placarHome = match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? null;
  const placarAway = match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? null;

  return {
    fixture: {
      id: match.id,
      date: match.utcDate,
      status,
    },
    teams: {
      home: { id: match.homeTeam.id, name: match.homeTeam.name, logo: match.homeTeam.crest ?? '' },
      away: { id: match.awayTeam.id, name: match.awayTeam.name, logo: match.awayTeam.crest ?? '' },
    },
    goals: {
      home: match.status === 'FINISHED' ? placarHome : (match.status === 'IN_PLAY' || match.status === 'PAUSED' ? placarHome : null),
      away: match.status === 'FINISHED' ? placarAway : (match.status === 'IN_PLAY' || match.status === 'PAUSED' ? placarAway : null),
    },
  };
}

// GET /api/jogos — Retorna fixtures da Copa do Mundo 2026
router.get('/', async (_req, res) => {
  const agora = Date.now();

  if (cache.data && agora - cache.timestamp < CACHE_TTL_MS) {
    return res.json({ source: 'cache', data: cache.data });
  }

  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) {
    if (cache.data) return res.json({ source: 'cache_stale', data: cache.data });
    return res.status(503).json({ error: 'API de futebol não configurada' });
  }

  try {
    const response = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches',
      { headers: { 'X-Auth-Token': apiKey } }
    );

    const dados = await response.json();
    const matches = dados?.matches;

    if (Array.isArray(matches) && matches.length > 0) {
      const normalizado = matches.map(normalizar);
      cache = { data: normalizado, timestamp: agora };
      return res.json({ source: 'api', data: normalizado });
    }

    // API retornou vazio — cacheia para não bater na API toda hora
    cache = { data: [], timestamp: agora };
    res.json({ source: 'empty', data: [] });
  } catch (err) {
    console.error('Erro na API de futebol:', err.message);
    if (cache.data) return res.json({ source: 'cache_stale', data: cache.data });
    res.status(502).json({ error: 'Falha na telemetria esportiva' });
  }
});

export default router;
