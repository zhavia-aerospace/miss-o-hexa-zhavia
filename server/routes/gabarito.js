import { Router } from 'express';
import Gabarito from '../models/Gabarito.js';

const router = Router();

// GET /api/gabarito — retorna o gabarito atual
router.get('/', async (_req, res) => {
  try {
    const gabarito = await Gabarito.findOne();
    res.json(gabarito ?? { grupos: {}, podio: {} });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar gabarito' });
  }
});

// POST /api/gabarito — salva (upsert) o gabarito oficial
router.post('/', async (req, res) => {
  const { grupos, podio, podioLiberado } = req.body;
  if (!grupos || typeof grupos !== 'object') {
    return res.status(400).json({ error: 'Grupos são obrigatórios' });
  }
  try {
    const update = { grupos, podio: podio ?? {} };
    if (typeof podioLiberado === 'boolean') update.podioLiberado = podioLiberado;

    const gabarito = await Gabarito.findOneAndUpdate(
      {},
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, gabarito });
  } catch {
    res.status(500).json({ error: 'Erro ao salvar gabarito' });
  }
});

// PATCH /api/gabarito/podio-liberado — alterna liberação do pódio
router.patch('/podio-liberado', async (req, res) => {
  const { liberado } = req.body;
  if (typeof liberado !== 'boolean') {
    return res.status(400).json({ error: '"liberado" deve ser boolean' });
  }
  try {
    await Gabarito.findOneAndUpdate(
      {},
      { podioLiberado: liberado },
      { upsert: true, new: true }
    );
    res.json({ success: true, podioLiberado: liberado });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});

export default router;
