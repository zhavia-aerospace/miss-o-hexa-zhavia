import { Router } from 'express';

const router = Router();

// Cache em memória — evita gastar créditos da API em cada request
let cache = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos

const FASES_MATA_MATA = [
  { codigo: 'LAST_32', nome: 'Rodada de 32' },
  { codigo: 'LAST_16', nome: 'Oitavas de Final' },
  { codigo: 'QUARTER_FINALS', nome: 'Quartas de Final' },
  { codigo: 'SEMI_FINALS', nome: 'Semifinal' },
  { codigo: 'THIRD_PLACE', nome: 'Disputa de 3º Lugar' },
  { codigo: 'FINAL', nome: 'Final' },
];

function normalizarGrupo(standing) {
  const letra = standing.group?.replace('Group ', '') ?? '?';
  const tabela = standing.table.map((linha) => ({
    posicao: linha.position,
    time: {
      nome: linha.team.shortName ?? linha.team.name,
      escudo: linha.team.crest ?? '',
    },
    pontos: linha.points,
    jogos: linha.playedGames,
    vitorias: linha.won,
    empates: linha.draw,
    derrotas: linha.lost,
    saldoGols: linha.goalDifference,
    golsMarcados: linha.goalsFor,
  }));
  return { grupo: letra, tabela };
}

function normalizarTime(time) {
  if (!time?.name) return null;
  return { nome: time.shortName ?? time.name, escudo: time.crest ?? '' };
}

function normalizarJogo(match) {
  const home = normalizarTime(match.homeTeam);
  const away = normalizarTime(match.awayTeam);
  
  const vencedor = match.score?.winner === 'HOME_TEAM' ? home
    : match.score?.winner === 'AWAY_TEAM' ? away
    : null;

  let penaltisHome = match.score?.penalties?.home;
  let penaltisAway = match.score?.penalties?.away;

  // A ordem oficial de prioridade para pegar o placar de bola rolando:
  // 1º Tenta pegar o tempo regulamentar (90 min)
  // 2º Tenta pegar a prorrogação (120 min)
  // 3º Em último caso, usa o fullTime (Placar Final)
  let placarHome = match.score?.regularTime?.home ?? match.score?.extraTime?.home ?? match.score?.fullTime?.home;
  let placarAway = match.score?.regularTime?.away ?? match.score?.extraTime?.away ?? match.score?.fullTime?.away;

  return {
    id: match.id,
    data: match.utcDate,
    status: match.status,
    home,
    away,
    placarHome: placarHome ?? null,
    placarAway: placarAway ?? null,
    penaltisHome: penaltisHome ?? null,
    penaltisAway: penaltisAway ?? null,
    vencedor: vencedor ? vencedor.nome : null,
  };
}

// GET /api/grupos-reais — tabela real de grupos, ranking dos 3º colocados e chaveamento do mata-mata
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
    const [standingsRes, matchesRes] = await Promise.all([
      fetch('https://api.football-data.org/v4/competitions/WC/standings', {
        headers: { 'X-Auth-Token': apiKey },
      }),
      fetch('https://api.football-data.org/v4/competitions/WC/matches', {
        headers: { 'X-Auth-Token': apiKey },
      }),
    ]);
    const standingsDados = await standingsRes.json();
    const matchesDados = await matchesRes.json();

    const standings = standingsDados?.standings?.filter((s) => s.type === 'TOTAL' && s.group);
    const matches = matchesDados?.matches ?? [];

    if (Array.isArray(standings) && standings.length > 0) {
      const grupos = standings
        .map(normalizarGrupo)
        .sort((a, b) => a.grupo.localeCompare(b.grupo));

      const terceiros = grupos
        .map((g) => {
          const linha = g.tabela.find((l) => l.posicao === 3);
          return linha ? { ...linha, grupo: g.grupo } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.pontos - a.pontos || b.saldoGols - a.saldoGols || b.golsMarcados - a.golsMarcados);

      const mataMata = FASES_MATA_MATA
        .map(({ codigo, nome }) => ({
          fase: nome,
          jogos: matches.filter((m) => m.stage === codigo).map(normalizarJogo),
        }))
        .filter((f) => f.jogos.length > 0);

      const resultado = { grupos, terceiros, mataMata };
      cache = { data: resultado, timestamp: agora };
      return res.json({ source: 'api', data: resultado });
    }

    cache = { data: { grupos: [], terceiros: [], mataMata: [] }, timestamp: agora };
    res.json({ source: 'empty', data: cache.data });
  } catch (err) {
    console.error('Erro na API de grupos reais:', err.message);
    if (cache.data) return res.json({ source: 'cache_stale', data: cache.data });
    res.status(502).json({ error: 'Falha na telemetria de grupos' });
  }
});

export default router;
