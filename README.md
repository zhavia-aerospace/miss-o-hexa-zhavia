# 🚀 Supercopa Zhavia — Bolão da Copa do Mundo 2026

Bolão espacial para a Copa do Mundo 2026. Participantes escolhem os classificados dos 12 grupos e o pódio final, acumulam pontos e disputam o ranking da tripulação.

---

## 📁 Estrutura do Projeto

```
miss-o-hexa-zhavia/
├── client/          # Frontend React + Vite
└── server/          # Backend Node.js + Express + MongoDB
```

---

## 🖥️ Backend — `server/`

**Stack:** Node.js 18+ · Express · Mongoose · MongoDB Atlas

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/palpites` | Lista todos os palpites de grupos |
| `POST` | `/api/palpites` | Registra palpite de grupos (nome único) |
| `GET` | `/api/podio` | Lista todos os pódios finais |
| `POST` | `/api/podio` | Registra pódio final (nome único) |
| `GET` | `/api/ranking` | Retorna ranking ordenado por posição |
| `POST` | `/api/ranking` | Atualiza ranking completo (requer `X-Admin-Key`) |
| `POST` | `/api/oracle` | Consulta o Oráculo Espacial via Gemini AI |
| `GET` | `/api/jogos` | Fixtures da Copa 2026 via API-Sports (cache 15 min) |
| `GET` | `/health` | Health check (útil para Render/Railway) |

### Configuração

```bash
cd server
cp .env.example .env   # preencha as variáveis
npm install
npm run dev            # node --watch (sem nodemon)
```

### Variáveis de ambiente (`server/.env`)

```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/supercopa-zhavia
PORT=3001
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=sua_chave_gemini
FOOTBALL_API_KEY=sua_chave_api_sports
ADMIN_KEY=chave_para_atualizar_ranking
```

---

## 🌐 Frontend — `client/`

**Stack:** React 18 · Vite · CSS puro (sem framework de UI)

### Abas do app

| Aba | Conteúdo |
|-----|----------|
| 🛸 Diretrizes | Regras, sistema de pontuação e cotas máximas |
| 🔮 Classificados | Seleção dos 2 classificados por grupo + tabela da tripulação |
| 👑 Pódio Final | Seleção do pódio (liberado manualmente nas Oitavas) |
| 🏆 Classificação | Ranking geral dos participantes |

### Configuração

```bash
cd client
cp .env.example .env   # só necessário em produção
npm install
npm run dev            # Vite em http://localhost:5173
```

### Variável de ambiente (`client/.env`) — só em produção

```env
VITE_API_URL=https://seu-backend.onrender.com
```

> Em desenvolvimento o Vite faz proxy automático de `/api` → `localhost:3001` (configurado em `vite.config.js`), nenhuma variável de ambiente é necessária.

---

## ▶️ Rodando localmente

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Acesse **http://localhost:5173**

---

## ☁️ Deploy em produção

### Backend → [Render.com](https://render.com) (recomendado, free tier)

1. Crie um **Web Service** apontando para a pasta `server/`
2. Build command: `npm install`
3. Start command: `npm start`
4. Adicione as variáveis de ambiente no painel do Render
5. Em `FRONTEND_URL` coloque o domínio do seu frontend

### Frontend → [Vercel](https://vercel.com) ou [Netlify](https://netlify.com)

1. Aponte para a pasta `client/`
2. Build command: `npm run build`
3. Output dir: `dist`
4. Adicione `VITE_API_URL` com o URL do backend do Render

---

## 🏗️ Por que migramos de vanilla para React + Node + MongoDB?

### Antes (vanilla HTML/CSS/JS + SheetDB)

| Aspecto | Situação |
|---------|----------|
| **Dados** | Google Sheets via SheetDB (serviço de terceiro, sujeito a limites e downtime) |
| **Prevenção de duplicata** | Apenas `localStorage` — qualquer pessoa em outro dispositivo ou aba anônima podia votar duas vezes |
| **Chaves de API** | Expostas no código front-end (`script.js`): Gemini key, Football API key, SheetDB URL |
| **Manutenção** | Uma única função JS de 900 linhas sem separação de responsabilidades |
| **Escalabilidade** | Zero controle sobre a base de dados — dependente de planilha manual |
| **Ranking** | Calculado/inserido manualmente em outra aba do Google Sheets |

### Agora (React + Node.js + MongoDB)

| Aspecto | Melhoria |
|---------|----------|
| **Dados** | MongoDB Atlas — banco real, queries indexadas, sem limites artificiais de terceiro |
| **Prevenção de duplicata** | Índice `unique` no campo `nome` no MongoDB: o servidor rejeita qualquer segundo envio, independente do dispositivo |
| **Chaves de API** | Todas no servidor (`server/.env`) — o frontend nunca vê nenhuma credencial |
| **Manutenção** | Código dividido em componentes React, rotas Express e models Mongoose independentes |
| **Escalabilidade** | Backend stateless pronto para múltiplas instâncias; cache server-side da API de futebol (15 min) |
| **Ranking** | Endpoint `POST /api/ranking` com autenticação via `X-Admin-Key` para atualização direta |
| **Oráculo (Gemini)** | Chamada server-side sem proxy gambiarra (AllOrigins) — direto da Google sem expor key |

### Estrutura de componentes React

```
App
├── AlertProvider (Context — alerta global sem prop drilling)
├── StarsBackground
├── Header
├── main
│   ├── AbaHome
│   ├── AbaPalpites ← componente mais complexo
│   │   └── DetalhesAstronauta (modal)
│   ├── AbaPodio
│   └── AbaRanking
├── PainelLateralJogos
├── footer
└── SpaceAlert (modal de alerta global)
```

---

## 🔐 Segurança

- Credenciais nunca commitadas (`.env` no `.gitignore`)
- Validação de entrada em todas as rotas do backend (grupos com exatamente 2 times, pódio sem repetição, nome obrigatório)
- CORS restrito ao domínio configurado em `FRONTEND_URL`
- Endpoint de atualização de ranking protegido por `X-Admin-Key`
- **Recomendado:** rotacione a senha do MongoDB após o primeiro deploy público
