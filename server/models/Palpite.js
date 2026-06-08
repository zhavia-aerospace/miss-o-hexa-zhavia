import mongoose from 'mongoose';

const gruposSchema = {
  A: { type: [String], required: true },
  B: { type: [String], required: true },
  C: { type: [String], required: true },
  D: { type: [String], required: true },
  E: { type: [String], required: true },
  F: { type: [String], required: true },
  G: { type: [String], required: true },
  H: { type: [String], required: true },
  I: { type: [String], required: true },
  J: { type: [String], required: true },
  K: { type: [String], required: true },
  L: { type: [String], required: true },
};

const palpiteSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      unique: true,
      trim: true,
      maxlength: [100, 'Nome muito longo'],
    },
    grupos: {
      type: gruposSchema,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Palpite', palpiteSchema);
