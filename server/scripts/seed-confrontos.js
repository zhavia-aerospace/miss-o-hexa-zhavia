import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Confronto from '../models/Confronto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Aponta para o arquivo .env que está na raiz da pasta server
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const confrontosIniciais = [
  // === LADO ESQUERDO: FASE 1 (1 a 7) ===
  { idJogo: 1, fase: "Fase 1", jogador1: "Kriss", jogador2: "Jeni", proximoJogoId: 15 },
  { idJogo: 2, fase: "Fase 1", jogador1: "Carol", jogador2: "Will", proximoJogoId: 16 },
  { idJogo: 3, fase: "Fase 1", jogador1: "Julia", jogador2: "Marcela", proximoJogoId: 16 },
  { idJogo: 4, fase: "Fase 1", jogador1: "Lucas", jogador2: "Cicero", proximoJogoId: 17 },
  { idJogo: 5, fase: "Fase 1", jogador1: "Grazi P", jogador2: "Thaina", proximoJogoId: 17 },
  { idJogo: 6, fase: "Fase 1", jogador1: "Vitor", jogador2: "Grasi Kolaço", proximoJogoId: 18 },
  { idJogo: 7, fase: "Fase 1", jogador1: "Pedro", jogador2: "Arion", proximoJogoId: 18 },

  // === LADO DIREITO: FASE 1 (8 a 14) ===
  { idJogo: 8, fase: "Fase 1", jogador1: "Pablo", jogador2: "Rafael", proximoJogoId: 19 },
  { idJogo: 9, fase: "Fase 1", jogador1: "Gabi", jogador2: "Cadu", proximoJogoId: 20 },
  { idJogo: 10, fase: "Fase 1", jogador1: "Balzer", jogador2: "Brenda", proximoJogoId: 20 },
  { idJogo: 11, fase: "Fase 1", jogador1: "José", jogador2: "Elvis", proximoJogoId: 21 },
  { idJogo: 12, fase: "Fase 1", jogador1: "Daniel", jogador2: "Amanda", proximoJogoId: 21 },
  { idJogo: 13, fase: "Fase 1", jogador1: "Guilherme", jogador2: "Bea", proximoJogoId: 22 },
  { idJogo: 14, fase: "Fase 1", jogador1: "João", jogador2: "Julia Polli", proximoJogoId: 22 },

  // === OITAVAS DE FINAL ===
  // Lado Esquerdo (Leo espera o vencedor do Jogo 1)
  { idJogo: 15, fase: "Oitavas", jogador1: "Leo", jogador2: null, proximoJogoId: 23 },
  { idJogo: 16, fase: "Oitavas", jogador1: null, jogador2: null, proximoJogoId: 23 },
  { idJogo: 17, fase: "Oitavas", jogador1: null, jogador2: null, proximoJogoId: 24 },
  { idJogo: 18, fase: "Oitavas", jogador1: null, jogador2: null, proximoJogoId: 24 },
  
  // Lado Direito (Kahoe espera o vencedor do Jogo 8)
  { idJogo: 19, fase: "Oitavas", jogador1: "Kahoe", jogador2: null, proximoJogoId: 25 },
  { idJogo: 20, fase: "Oitavas", jogador1: null, jogador2: null, proximoJogoId: 25 },
  { idJogo: 21, fase: "Oitavas", jogador1: null, jogador2: null, proximoJogoId: 26 },
  { idJogo: 22, fase: "Oitavas", jogador1: null, jogador2: null, proximoJogoId: 26 },

  // === QUARTAS DE FINAL ===
  { idJogo: 23, fase: "Quartas", jogador1: null, jogador2: null, proximoJogoId: 27 },
  { idJogo: 24, fase: "Quartas", jogador1: null, jogador2: null, proximoJogoId: 27 },
  { idJogo: 25, fase: "Quartas", jogador1: null, jogador2: null, proximoJogoId: 28 },
  { idJogo: 26, fase: "Quartas", jogador1: null, jogador2: null, proximoJogoId: 28 },

  // === SEMIFINAIS E FINAL ===
  { idJogo: 27, fase: "Semifinal", jogador1: null, jogador2: null, proximoJogoId: 29 },
  { idJogo: 28, fase: "Semifinal", jogador1: null, jogador2: null, proximoJogoId: 29 },
  { idJogo: 29, fase: "Final", jogador1: null, jogador2: null, proximoJogoId: null }
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔌 Conectado ao MongoDB com sucesso.');

    // Remove confrontos anteriores caso o script seja rodado duas vezes
    await Confronto.deleteMany({});
    console.log('🧹 Coleção de confrontos limpa.');

    // Insere toda a árvore estruturada
    await Confronto.insertMany(confrontosIniciais);
    console.log('🚀 Sucesso! Todos os 29 confrontos foram injetados no banco.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao popular banco de dados:', err.message);
    process.exit(1);
  }
}

run();