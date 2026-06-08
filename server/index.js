import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import palpitesRouter from './routes/palpites.js';
import podioRouter from './routes/podio.js';
import rankingRouter from './routes/ranking.js';
import oracleRouter from './routes/oracle.js';
import jogosRouter from './routes/jogos.js';
import adminRouter from './routes/admin.js';
import gabaritoRouter from './routes/gabarito.js';
import calcularRouter from './routes/calcular.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS — em produção, troque FRONTEND_URL pelo domínio real do seu frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8000',
  'https://supercopa-zhavia.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: Render health check, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqueado: ${origin}`));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));

app.use(express.json());

// Rotas
app.use('/api/palpites', palpitesRouter);
app.use('/api/podio', podioRouter);
app.use('/api/ranking', rankingRouter);
app.use('/api/oracle', oracleRouter);
app.use('/api/jogos', jogosRouter);
app.use('/api/admin', adminRouter);
app.use('/api/gabarito', gabaritoRouter);
app.use('/api/calcular', calcularRouter);

// Health check (útil para Render / Railway)
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Conectar ao MongoDB e iniciar servidor
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB conectado com sucesso!');
    app.listen(PORT, () =>
      console.log(`🚀 Servidor rodando na porta ${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar no MongoDB:', err.message);
    process.exit(1);
  });
