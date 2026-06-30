import { Router } from 'express';

const router = Router();

// Cache em memória — evita gastar créditos da API em cada request
let cache = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos

const CODIGOS_MATA_MATA = ['LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL'];

// Tradução dos nomes dos times (chave = código de 3 letras da seleção, igual em toda a Copa).
// Nomes curtos ficam por extenso; só os realmente longos (ex: Bósnia-Herzegovina) ficam abreviados,
// pra não estourar o card.
const TRADUCOES_TIMES = {
  ALG: 'Argélia', ARG: 'Argentina', AUS: 'Austrália', AUT: 'Áustria', BEL: 'Bélgica',
  BIH: 'Bósnia-Herz.', BRA: 'Brasil', CAN: 'Canadá', CPV: 'Cabo Verde', COL: 'Colômbia',
  COD: 'RD Congo', CRO: 'Croácia', CUW: 'Curaçau', CZE: 'República Tcheca', ECU: 'Equador',
  EGY: 'Egito', ENG: 'Inglaterra', FRA: 'França', GER: 'Alemanha', GHA: 'Gana',
  HAI: 'Haiti', IRN: 'Irã', IRQ: 'Iraque', CIV: 'Costa do Marfim', JPN: 'Japão',
  JOR: 'Jordânia', KOR: 'Coreia do Sul', MEX: 'México', MAR: 'Marrocos', NED: 'Holanda',
  NZL: 'Nova Zelândia', NOR: 'Noruega', PAN: 'Panamá', PAR: 'Paraguai', POR: 'Portugal',
  QAT: 'Catar', KSA: 'Arábia Saudita', SCO: 'Escócia', SEN: 'Senegal', RSA: 'África do Sul',
  ESP: 'Espanha', SWE: 'Suécia', SUI: 'Suíça', TUN: 'Tunísia', TUR: 'Turquia',
  USA: 'Estados Unidos', URU: 'Uruguai', UZB: 'Uzbequistão',
};

function traduzirNome(time) {
  return TRADUCOES_TIMES[time.tla] ?? (time.shortName ?? time.name);
}

function normalizarGrupo(standing) {
  const letra = standing.group?.replace('Group ', '') ?? '?';
  const tabela = standing.table.map((linha) => ({
    posicao: linha.position,
    time: {
      nome: traduzirNome(linha.team),
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
  return { nome: traduzirNome(time), escudo: time.crest ?? '' };
}

function normalizarJogo(match) {
  if (match.homeTeam?.name === 'Norway' || match.awayTeam?.name === 'Norway') {
    console.log("=====================================");
    console.log("🕵️ JOGO DA NORUEGA ENCONTRADO!");
    console.log("Status da API:", match.status);
    console.log("Vencedor na API:", match.score?.winner);
    console.log("=====================================");
  }
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

// O `id` de cada jogo reflete a ordem real do chaveamento da fonte de dados: ordenando uma fase
// por id e juntando de 2 em 2, os pares batem com os confrontos oficiais (confirmado contra fatos
// conhecidos: Canadá x Marrocos nas oitavas, e Brasil aguardando o vencedor de Costa do Marfim x
// Noruega — ambos batem exatamente com essa ordenação).
function ordenarPorId(jogos) {
  return [...jogos].sort((a, b) => a.id - b.id);
}

// Constrói a fase seguinte alinhada aos pares da fase anterior (já ordenada por id).
//
// Duas passagens, de propósito: na primeira, resolve só os pares que já têm vencedor definido em
// algum dos dois jogos, achando o jogo real correspondente pelo nome do time (cada time só está em
// um jogo por rodada, busca exata). Só depois, na segunda passagem, preenche os pares que ainda não
// têm nenhum vencedor com o que sobrou. Se fosse tudo em uma passagem só, um par totalmente indefinido
// processado antes de um par já decidido podia "roubar" no fallback o jogo real que pertencia ao par
// decidido (foi exatamente esse bug que apareceu com o Brasil antes dessa correção).
// Constrói a fase seguinte alinhada aos pares da fase anterior (já ordenada por id).
function construirFaseSeguinte(faseAnteriorOrdenada, faseSeguinteBruta) {
  const usados = new Set();
  const totalPares = faseAnteriorOrdenada.length / 2;
  const resultado = new Array(totalPares).fill(null);

  // Helper interno para resgatar o escudo do time vencedor da rodada anterior
  const getEscudo = (jogo, nomeVencedor) => {
    if (jogo?.home?.nome === nomeVencedor) return jogo.home.escudo;
    if (jogo?.away?.nome === nomeVencedor) return jogo.away.escudo;
    return '';
  };

  for (let p = 0; p < totalPares; p++) {
    const a = faseAnteriorOrdenada[2 * p];
    const b = faseAnteriorOrdenada[2 * p + 1];
    
    const vencedorA = a?.vencedor;
    const vencedorB = b?.vencedor;
    const nomesOriginais = [vencedorA, vencedorB].filter(Boolean);

    let achado = null;
    for (const nome of nomesOriginais) {
      achado = faseSeguinteBruta.find(
        (j) => j && !usados.has(j) && (j.home?.nome === nome || j.away?.nome === nome)
      );
      if (achado) break;
    }

    if (!achado) {
      let i = 0;
      while (i < faseSeguinteBruta.length && usados.has(faseSeguinteBruta[i])) i++;
      if (i < faseSeguinteBruta.length) {
        achado = faseSeguinteBruta[i];
      }
    }

    if (achado) {
      usados.add(achado);
      
      // 🚀 A MÁGICA ENTRA AQUI: Clonamos o jogo para injetar os times que a API está atrasada
      const jogoAtualizado = { ...achado };

      // Força a entrada do Vencedor da chave de cima (A) se a API ainda não colocou
      if (vencedorA && jogoAtualizado.home?.nome !== vencedorA && jogoAtualizado.away?.nome !== vencedorA) {
        if (!jogoAtualizado.home?.nome) {
          jogoAtualizado.home = { nome: vencedorA, escudo: getEscudo(a, vencedorA) };
        } else if (!jogoAtualizado.away?.nome) {
          jogoAtualizado.away = { nome: vencedorA, escudo: getEscudo(a, vencedorA) };
        }
      }

      // Força a entrada do Vencedor da chave de baixo (B) se a API ainda não colocou
      if (vencedorB && jogoAtualizado.home?.nome !== vencedorB && jogoAtualizado.away?.nome !== vencedorB) {
        if (!jogoAtualizado.away?.nome) {
          jogoAtualizado.away = { nome: vencedorB, escudo: getEscudo(b, vencedorB) };
        } else if (!jogoAtualizado.home?.nome) {
          jogoAtualizado.home = { nome: vencedorB, escudo: getEscudo(b, vencedorB) };
        }
      }

      resultado[p] = jogoAtualizado;
    }
  }

  return resultado;
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

      const jogosPorCodigo = Object.fromEntries(
        CODIGOS_MATA_MATA.map((codigo) => [
          codigo,
          matches.filter((m) => m.stage === codigo).map(normalizarJogo),
        ])
      );

      // Reordena em cascata da Rodada de 32 até a Final, par a par (ver ordenarPorId e
      // construirFaseSeguinte). THIRD_PLACE fica de fora — não faz parte da árvore principal
      // (é alimentada pelos perdedores da semifinal, não pelos vencedores).
      const rodada32 = ordenarPorId(jogosPorCodigo.LAST_32 ?? []);
      const oitavas = construirFaseSeguinte(rodada32, jogosPorCodigo.LAST_16 ?? []);
      const quartas = construirFaseSeguinte(oitavas, jogosPorCodigo.QUARTER_FINALS ?? []);
      const semifinal = construirFaseSeguinte(quartas, jogosPorCodigo.SEMI_FINALS ?? []);
      const final = construirFaseSeguinte(semifinal, jogosPorCodigo.FINAL ?? []);

      const fasesOrdenadas = [
        { codigo: 'LAST_32', nome: 'Rodada de 32', jogos: rodada32 },
        { codigo: 'LAST_16', nome: 'Oitavas de Final', jogos: oitavas },
        { codigo: 'QUARTER_FINALS', nome: 'Quartas de Final', jogos: quartas },
        { codigo: 'SEMI_FINALS', nome: 'Semifinal', jogos: semifinal },
        { codigo: 'THIRD_PLACE', nome: 'Disputa de 3º Lugar', jogos: jogosPorCodigo.THIRD_PLACE ?? [] },
        { codigo: 'FINAL', nome: 'Final', jogos: final },
      ];

      const mataMata = fasesOrdenadas
        .map(({ nome, jogos }) => ({ fase: nome, jogos }))
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
