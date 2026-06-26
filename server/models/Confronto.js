import mongoose from 'mongoose';

const ConfrontoSchema = new mongoose.Schema({
  idJogo: { type: Number, required: true, unique: true },
  fase: { type: String, required: true },
  jogador1: { type: String, default: null },
  jogador2: { type: String, default: null },
  vencedor: { type: String, default: null },
  proximoJogoId: { type: Number, default: null }
});

export default mongoose.model('Confronto', ConfrontoSchema);