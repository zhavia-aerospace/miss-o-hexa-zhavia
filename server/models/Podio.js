import mongoose from 'mongoose';

const podioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      unique: true,
      trim: true,
      maxlength: [100, 'Nome muito longo'],
    },
    p1: { type: String, required: true },
    p2: { type: String, required: true },
    p3: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Podio', podioSchema);
