import { Router } from 'express';
import Ranking from '../models/Ranking.js';

const router = Router();

// GET /api/ranking — Retorna o ranking ordenado por posição
router.get('/', async (_req, res) => {
  try {
    const ranking = await Ranking.find().sort({ posicao: 1 });
    res.json(ranking);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
});

// POST /api/ranking — Substitui todo o ranking (uso administrativo)
// Protegido por chave de admin via header X-Admin-Key
router.post('/', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { ranking } = req.body;
  if (!Array.isArray(ranking) || ranking.length === 0) {
    return res.status(400).json({ error: 'Array de ranking é obrigatório' });
  }

  try {
    await Ranking.deleteMany({});
    await Ranking.insertMany(ranking);
    res.json({ success: true, message: `${ranking.length} entradas de ranking atualizadas` });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar ranking' });
  }
});

export default router;
