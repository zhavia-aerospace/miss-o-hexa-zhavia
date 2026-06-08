// Executa com: node scripts/importar-palpites.js
// Deve rodar dentro da pasta server/ com o .env configurado

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Palpite from '../models/Palpite.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB conectado');

  const raw = JSON.parse(readFileSync(join(__dirname, '../copa_zhavia.json'), 'utf-8'));

  let inseridos = 0;
  let pulados = 0;

  for (const entrada of raw) {
    const grupos = {};
    LETRAS.forEach((letra, i) => {
      const chave = `Grupo ${letra}`;
      const g = entrada.palpites?.[chave];
      grupos[letra] = g ? [g['1º'] ?? '', g['2º'] ?? ''] : ['', ''];
    });

    try {
      await Palpite.create({
        nome: entrada.nome.trim(),
        grupos,
        createdAt: new Date(entrada.data),
        updatedAt: new Date(entrada.data),
      });
      console.log(`  ✅ ${entrada.nome}`);
      inseridos++;
    } catch (err) {
      if (err.code === 11000) {
        console.log(`  ⚠️  Pulado (já existe): ${entrada.nome}`);
        pulados++;
      } else {
        console.error(`  ❌ Erro em ${entrada.nome}:`, err.message);
      }
    }
  }

  console.log(`\nConcluído: ${inseridos} inseridos, ${pulados} pulados.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
