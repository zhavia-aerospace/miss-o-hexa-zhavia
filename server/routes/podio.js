import { Router } from 'express';
import Podio from '../models/Podio.js';

const router = Router();

// GET /api/podio — Retorna todos os pódios
router.get('/', async (_req, res) => {
  try {
    const podios = await Podio.find().sort({ createdAt: -1 });
    res.json(podios);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar pódios' });
  }
});

// POST /api/podio — Registra pódio de um participante
router.post('/', async (req, res) => {
  const { nome, p1, p2, p3 } = req.body;

  if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }
  if (!p1 || !p2 || !p3) {
    return res.status(400).json({ error: 'Os três colocados são obrigatórios' });
  }
  if (p1 === p2 || p1 === p3 || p2 === p3) {
    return res.status(400).json({ error: 'Não é permitido repetir a mesma nação no pódio' });
  }

  try {
    const podio = new Podio({ nome: nome.trim(), p1, p2, p3 });
    await podio.save();
    res.status(201).json({ success: true, message: 'Pódio registrado com sucesso!' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Já existe um pódio com este nome' });
    }
    res.status(500).json({ error: 'Erro ao salvar pódio' });
  }
});

export default router;
