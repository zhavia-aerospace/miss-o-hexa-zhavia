import mongoose from 'mongoose';

// Único documento — sempre salvo com upsert
const gabaritoSchema = new mongoose.Schema({
  grupos: {
    A: { type: [String], default: [] },
    B: { type: [String], default: [] },
    C: { type: [String], default: [] },
    D: { type: [String], default: [] },
    E: { type: [String], default: [] },
    F: { type: [String], default: [] },
    G: { type: [String], default: [] },
    H: { type: [String], default: [] },
    I: { type: [String], default: [] },
    J: { type: [String], default: [] },
    K: { type: [String], default: [] },
    L: { type: [String], default: [] },
  },
  podio: {
    p1: { type: String, default: '' },
    p2: { type: String, default: '' },
    p3: { type: String, default: '' },
  },
  podioLiberado: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Gabarito', gabaritoSchema);
