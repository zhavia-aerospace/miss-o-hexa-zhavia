import { Router } from 'express';
import Palpite from '../models/Palpite.js';
import Podio from '../models/Podio.js';
import Ranking from '../models/Ranking.js';

const router = Router();

// GET /api/admin — dados consolidados
router.get('/', async (_req, res) => {
  try {
    const [palpites, podios, ranking] = await Promise.all([
      Palpite.find().sort({ createdAt: -1 }),
      Podio.find().sort({ createdAt: -1 }),
      Ranking.find().sort({ posicao: 1 }),
    ]);
    res.json({ palpites, podios, ranking });
  } catch {
    res.status(500).json({ error: 'Erro ao carregar dados admin' });
  }
});

// DELETE /api/admin/palpites — zera todos os palpites de grupos
router.delete('/palpites', async (_req, res) => {
  try {
    await Palpite.deleteMany({});
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erro ao zerar palpites' });
  }
});

// DELETE /api/admin/palpites/:id — remove um palpite individual
router.delete('/palpites/:id', async (req, res) => {
  try {
    const deletado = await Palpite.findByIdAndDelete(req.params.id);
    if (!deletado) return res.status(404).json({ error: 'Palpite não encontrado' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar palpite' });
  }
});

// POST /api/admin/ranking — substitui o ranking completo
router.post('/ranking', async (req, res) => {
  const { ranking } = req.body;
  if (!Array.isArray(ranking) || ranking.length === 0) {
    return res.status(400).json({ error: 'Array de ranking obrigatório' });
  }
  // Garante posição sequencial ordenada por pontuação decrescente
  const ordenado = [...ranking]
    .sort((a, b) => Number(b.pontuacao) - Number(a.pontuacao))
    .map((item, i) => ({ posicao: i + 1, astronauta: String(item.astronauta).trim(), pontuacao: Number(item.pontuacao) }));

  try {
    await Ranking.deleteMany({});
    await Ranking.insertMany(ordenado);
    res.json({ success: true, total: ordenado.length });
  } catch {
    res.status(500).json({ error: 'Erro ao salvar ranking' });
  }
});

export default router;
