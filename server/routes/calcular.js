import { Router } from 'express';
import Palpite from '../models/Palpite.js';
import Podio from '../models/Podio.js';
import Gabarito from '../models/Gabarito.js';

const router = Router();

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

/**
 * Calcula a pontuação de grupos de um participante.
 *
 * Regras:
 *  - 1 classificado certo:          4 pts
 *  - 2 classificados certos:        8 pts
 *  - 2 certos + ordem exata (1º e 2º): +2 pts bônus  → máx 10 pts por grupo
 *  - Máximo total grupos: 120 pts
 */
function calcularGrupos(palpiteGrupos, gabaritoGrupos) {
  let total = 0;
  const detalhes = {};

  for (const letra of LETRAS) {
    const pal = (palpiteGrupos?.[letra] ?? []).map((t) => t.trim());
    const gab = (gabaritoGrupos?.[letra] ?? []).map((t) => t.trim());

    if (gab.length < 2) {
      detalhes[letra] = { pontos: 0, acertos: 0, pendente: true };
      continue;
    }

    const gabSet = new Set(gab);
    const acertos = pal.filter((t) => gabSet.has(t)).length;

    let pontos = 0;
    if (acertos === 1) pontos = 4;
    if (acertos === 2) {
      pontos = 8;
      // Bônus de ordem: 1º e 2º exatos
      if (pal[0] === gab[0] && pal[1] === gab[1]) pontos += 2;
    }

    total += pontos;
    detalhes[letra] = { pontos, acertos };
  }

  return { total, detalhes };
}

/**
 * Calcula a pontuação do pódio final.
 *
 * Regras:
 *  - 1º lugar certo:  25 pts
 *  - 2º lugar certo:  15 pts
 *  - 3º lugar certo:  10 pts
 *  - Ordem completa:  +5 pts bônus  → máx 55 pts
 */
function calcularPodio(palpitePodio, gabaritoPodio) {
  if (!gabaritoPodio?.p1) return { total: 0, detalhes: {} };

  const gab = {
    p1: gabaritoPodio.p1.trim(),
    p2: gabaritoPodio.p2.trim(),
    p3: gabaritoPodio.p3.trim(),
  };

  const pal = {
    p1: palpitePodio?.p1?.trim() ?? '',
    p2: palpitePodio?.p2?.trim() ?? '',
    p3: palpitePodio?.p3?.trim() ?? '',
  };

  const p1ok = pal.p1 === gab.p1;
  const p2ok = pal.p2 === gab.p2;
  const p3ok = pal.p3 === gab.p3;

  let total = (p1ok ? 25 : 0) + (p2ok ? 15 : 0) + (p3ok ? 10 : 0);
  const ordemCompleta = p1ok && p2ok && p3ok;
  if (ordemCompleta) total += 5;

  return {
    total,
    detalhes: { p1ok, p2ok, p3ok, ordemCompleta },
  };
}

// POST /api/calcular — calcula pontuações de todos os participantes
// Retorna lista ranqueada (não salva automaticamente — admin revisa antes)
router.post('/', async (_req, res) => {
  try {
    const [gabarito, palpites, podios] = await Promise.all([
      Gabarito.findOne(),
      Palpite.find(),
      Podio.find(),
    ]);

    if (!gabarito) {
      return res.status(400).json({ error: 'Gabarito ainda não foi configurado' });
    }

    // Monta um mapa { nome → podio } para lookup O(1)
    const mapPodio = Object.fromEntries(
      podios.map((p) => [p.nome.trim().toLowerCase(), p])
    );

    const resultados = palpites.map((palpite) => {
      const nome = palpite.nome.trim();
      const grupos = calcularGrupos(palpite.grupos, gabarito.grupos);
      const podioParticipante = mapPodio[nome.toLowerCase()];
      const podioScore = calcularPodio(podioParticipante, gabarito.podio);

      return {
        nome,
        pontuacaoGrupos: grupos.total,
        detalhesGrupos: grupos.detalhes,
        pontuacaoPodio: podioScore.total,
        detalhesPodio: podioScore.detalhes,
        total: grupos.total + podioScore.total,
      };
    });

    // Ordena por total decrescente (empate: ordem alfabética)
    resultados.sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome));

    res.json(resultados);
  } catch (err) {
    console.error('Erro ao calcular:', err);
    res.status(500).json({ error: 'Erro no cálculo de pontuações' });
  }
});

export default router;
