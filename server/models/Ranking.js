import mongoose from 'mongoose';

// Este modelo é atualizado pelo admin após cada rodada calculada
const rankingSchema = new mongoose.Schema(
  {
    posicao: { type: Number, required: true },
    astronauta: { type: String, required: true, trim: true },
    pontuacao: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Ranking', rankingSchema);
