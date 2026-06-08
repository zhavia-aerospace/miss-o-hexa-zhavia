import { Router } from 'express';
import Palpite from '../models/Palpite.js';

const router = Router();

const LETRAS_GRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

// GET /api/palpites — Retorna todos os palpites (mais recentes primeiro)
router.get('/', async (_req, res) => {
  try {
    const palpites = await Palpite.find().sort({ createdAt: -1 });
    res.json(palpites);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar palpites' });
  }
});

// POST /api/palpites — Registra um novo palpite
router.post('/', async (req, res) => {
  const { nome, grupos } = req.body;

  if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  if (!grupos || typeof grupos !== 'object') {
    return res.status(400).json({ error: 'Dados dos grupos são obrigatórios' });
  }

  // Valida que todos os 12 grupos têm exatamente 2 times
  for (const letra of LETRAS_GRUPOS) {
    if (!Array.isArray(grupos[letra]) || grupos[letra].length !== 2) {
      return res.status(400).json({
        error: `Grupo ${letra} deve ter exatamente 2 classificados`,
      });
    }
  }

  try {
    const palpite = new Palpite({ nome: nome.trim(), grupos });
    await palpite.save();
    res.status(201).json({ success: true, message: 'Palpite registrado com sucesso!' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Já existe um palpite com este nome' });
    }
    res.status(500).json({ error: 'Erro ao salvar palpite' });
  }
});

export default router;
