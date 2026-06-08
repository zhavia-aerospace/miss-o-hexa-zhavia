import { Router } from 'express';

const router = Router();

// Cache em memória — evita gastar créditos da API em cada request
let cache = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos

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
      'https://v3.football.api-sports.io/fixtures?league=1&season=2026',
      {
        headers: {
          'x-rapidapi-host': 'v3.football.api-sports.io',
          'x-rapidapi-key': apiKey,
        },
      }
    );

    const dados = await response.json();

    if (dados?.response?.length > 0) {
      cache = { data: dados.response, timestamp: agora };
      return res.json({ source: 'api', data: dados.response });
    }

    // API retornou vazio — usa cache antigo se existir
    if (cache.data) return res.json({ source: 'cache_stale', data: cache.data });

    res.json({ source: 'empty', data: [] });
  } catch (err) {
    console.error('Erro na API de futebol:', err.message);
    if (cache.data) return res.json({ source: 'cache_stale', data: cache.data });
    res.status(502).json({ error: 'Falha na telemetria esportiva' });
  }
});

export default router;
