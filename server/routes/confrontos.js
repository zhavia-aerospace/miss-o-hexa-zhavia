import express from 'express';
import Confronto from '../models/Confronto.js';

const router = express.Router();

// ROTA 1: Buscar todos os confrontos
router.get('/', async (req, res) => {
  try {
    const confrontos = await Confronto.find().sort({ idJogo: 1 });
    res.json(confrontos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ROTA 2: Atualizar ou Reverter um confronto
router.put('/:idJogo', async (req, res) => {
  try {
    const { vencedor, proximoJogoId, reverter } = req.body;
    const { idJogo } = req.params;

    // === LÓGICA DE DESFAZER (NOVA) ===
    if (reverter) {
      // 1. Tira o vencedor do jogo atual
      const jogoAtual = await Confronto.findOneAndUpdate(
        { idJogo: Number(idJogo) },
        { vencedor: null },
        { new: true }
      );

      // 2. Remove o jogador da chave do próximo jogo
      if (proximoJogoId && vencedor) {
        const proximoJogo = await Confronto.findOne({ idJogo: proximoJogoId });
        if (proximoJogo) {
          if (proximoJogo.jogador1 === vencedor) proximoJogo.jogador1 = null;
          else if (proximoJogo.jogador2 === vencedor) proximoJogo.jogador2 = null;
          await proximoJogo.save();
        }
      }
      return res.json(jogoAtual);
    }

    // === LÓGICA DE AVANÇAR VENCEDOR (EXISTENTE) ===
    const jogoAtual = await Confronto.findOneAndUpdate(
      { idJogo: Number(idJogo) },
      { vencedor },
      { new: true }
    );

    if (proximoJogoId && vencedor) {
      const proximoJogo = await Confronto.findOne({ idJogo: proximoJogoId });
      
      if (!proximoJogo.jogador1) {
        proximoJogo.jogador1 = vencedor;
      } else if (!proximoJogo.jogador2 && proximoJogo.jogador1 !== vencedor) {
        proximoJogo.jogador2 = vencedor;
      }
      await proximoJogo.save();
    }

    res.json(jogoAtual);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;