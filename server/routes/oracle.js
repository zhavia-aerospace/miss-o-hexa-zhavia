import { Router } from 'express';

const router = Router();

// POST /api/oracle — Proxy para a API do Gemini (mantém a chave server-side)
router.post('/', async (req, res) => {
  const { pergunta } = req.body;

  if (!pergunta || typeof pergunta !== 'string' || pergunta.trim().length === 0) {
    return res.status(400).json({ error: 'Pergunta é obrigatória' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Oráculo offline: chave não configurada' });
  }

  const instrucao =
    'Você é o Oráculo Espacial da Supercopa Zhavia. Responda de forma curta (máximo 3 linhas) e bem-humorada sobre futebol, fanático pelo Brasil, confiante no hexa e apaixonado no Neymar, espaço e zoeira corporativa leve.';

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${instrucao}\n\nPergunta: ${pergunta.trim()}` }] }],
      }),
    });

    const data = await response.json();

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return res.json({ resposta: data.candidates[0].content.parts[0].text });
    }

    if (data?.error) {
      console.error('Erro Gemini:', data.error);
      return res.status(502).json({ error: 'Oráculo rejeitou a consulta' });
    }

    res.status(502).json({ error: 'Resposta inesperada do Oráculo' });
  } catch (err) {
    console.error('Erro ao chamar Gemini:', err.message);
    res.status(502).json({ error: 'Falha na conexão com o Oráculo' });
  }
});

export default router;
