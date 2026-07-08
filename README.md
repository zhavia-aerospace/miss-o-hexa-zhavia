# 🚀 Supercopa Zhavia — Bolão da Copa do Mundo 2026

![Banner da Supercopa Zhavia](https://via.placeholder.com/800x200?text=Supercopa+Zhavia+-+Bol%C3%A3o+da+Copa+2026) <!-- Placeholder, pode ser substituído por um banner real -->

Um bolão espacial intergalático para a Copa do Mundo 2026, onde participantes de toda a galáxia podem testar suas habilidades de predição e disputar o ranking da tripulação. Inspirado na tecnologia da Frota Estelar, este projeto integra inteligência artificial e uma experiência de usuário imersiva para recriar a emoção do maior evento de futebol do universo.

---

## ✨ Funcionalidades

*   **Palpites de Grupos:** Escolha os 2 classificados de cada um dos 12 grupos da Copa do Mundo 2026.
*   **Pódio Final:** Preveja os 3 primeiros colocados do torneio (campeão, vice e terceiro lugar).
*   **Sistema de Pontuação:** Acumule pontos com base na precisão dos seus palpites.
*   **Ranking Intergalático:** Dispute com outros participantes em um ranking dinâmico e atualizado.
*   **Oráculo Espacial (Gemini AI):** Consulte a inteligência artificial Gemini para obter insights e previsões para seus palpites.
*   **Atualização de Jogos:** Acompanhe os resultados e fixtures da Copa 2026 em tempo real (via API-Sports).
*   **Administração Simplificada:** Ferramentas para administradores atualizarem o ranking e liberarem fases do bolão.

---

## 🛠️ Tecnologias Utilizadas

Este projeto é construído como uma aplicação Full-Stack, utilizando as seguintes tecnologias:

### Frontend (`client/`)

*   **React 18:** Biblioteca JavaScript para construção de interfaces de usuário.
*   **Vite:** Ferramenta de build rápida para desenvolvimento frontend.
*   **CSS Puro:** Estilização sem a necessidade de frameworks UI complexos.
*   **Axios:** Cliente HTTP para comunicação com a API do backend.
*   **Context API:** Para gerenciamento de estado global no React (e.g., sistema de alertas).

### Backend (`server/`)

*   **Node.js 18+:** Ambiente de execução JavaScript no lado do servidor.
*   **Express:** Framework web para Node.js, utilizado para construir a API RESTful.
*   **Mongoose:** Biblioteca ODM (Object Data Modeling) para MongoDB.
*   **MongoDB Atlas:** Banco de dados NoSQL baseado em nuvem para armazenamento de dados.
*   **Google Gemini API:** Integração com inteligência artificial para o "Oráculo Espacial".
*   **API-Sports:** Para obter dados de jogos e resultados da Copa do Mundo.

---

## 📁 Estrutura do Projeto

```
miss-o-hexa-zhavia/
├── client/          # Aplicação frontend (React + Vite)
│   ├── public/      # Ativos estáticos
│   ├── src/         # Código fonte do frontend
│   │   ├── components/ # Componentes React reutilizáveis
│   │   ├── context/    # Contextos React para gerenciamento de estado
│   │   ├── data/       # Dados estáticos ou mocks
│   │   ├── services/   # Funções de serviço para chamadas de API
│   │   └── tabs/       # Componentes de abas principais da aplicação
│   ├── index.html   # HTML principal
│   ├── package.json # Dependências e scripts do frontend
│   ├── vercel.json  # Configuração de deploy para Vercel
│   └── vite.config.js # Configuração do Vite
└── server/          # Aplicação backend (Node.js + Express)
    ├── copa_zhavia.json # Dados iniciais para o bolão
    ├── models/      # Modelos de dados do Mongoose (MongoDB)
    ├── routes/      # Rotas da API Express
    ├── scripts/     # Scripts utilitários (e.g., importação de dados, seed)
    ├── index.js     # Ponto de entrada do servidor
    └── package.json # Dependências e scripts do backend
```

---

## 🚀 Como Rodar Localmente

Siga estes passos para configurar e executar a aplicação em seu ambiente de desenvolvimento.

### Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

*   **Node.js** (versão 18 ou superior)
*   **npm** (gerenciador de pacotes do Node.js)
*   Uma conta no **MongoDB Atlas** e um URI de conexão.
*   Uma **chave de API para Google Gemini**.
*   Uma **chave de API para API-Football** (ou serviço similar que você esteja usando para os dados dos jogos).

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/miss-o-hexa-zhavia.git
cd miss-o-hexa-zhavia
```

### 2. Configurar o Backend

Navegue até o diretório `server` e instale as dependências:

```bash
cd server
npm install
```

Crie um arquivo `.env` na pasta `server/` copiando o `.env.example` e preencha as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/supercopa-zhavia # Seu URI do MongoDB Atlas
PORT=3001
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=sua_chave_gemini           # Sua chave de API do Google Gemini
FOOTBALL_API_KEY=sua_chave_api_sports     # Sua chave de API do API-Sports
ADMIN_KEY=chave_secreta_para_admin        # Chave para acesso administrativo (ex: atualizar ranking)
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O backend estará disponível em `http://localhost:3001`.

### 3. Configurar o Frontend

Em um **novo terminal**, navegue até o diretório `client` e instale as dependências:

```bash
cd client
npm install
```

Para desenvolvimento local, o Vite já está configurado para fazer proxy das requisições `/api` para o backend (`localhost:3001`), então você **não precisa** de um arquivo `.env` no frontend.

Inicie a aplicação frontend:

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

### 4. Acessar a Aplicação

Abra seu navegador e acesse:

[http://localhost:5173](http://localhost:5173)

---

## ⚙️ Endpoints da API (Backend)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/palpites` | Lista todos os palpites de grupos registrados. |
| `POST` | `/api/palpites` | Registra um novo palpite de grupos. Requer um nome único para o participante. |
| `GET` | `/api/podio` | Lista todos os pódios finais registrados. |
| `POST` | `/api/podio` | Registra um novo pódio final. Requer um nome único para o participante. |
| `GET` | `/api/ranking` | Retorna o ranking geral dos participantes, ordenado por posição. |
| `POST` | `/api/ranking` | Atualiza o ranking completo. **Requer `X-Admin-Key` no header.** |
| `POST` | `/api/oracle` | Consulta o Oráculo Espacial para previsões (alimentado por Gemini AI). |
| `GET` | `/api/jogos` | Retorna os fixtures da Copa 2026. Dados em cache por 15 minutos. |
| `GET` | `/health` | Endpoint de verificação de saúde do servidor (útil para plataformas de deploy como Render/Railway). |

---

## 🌐 Abas do Aplicativo (Frontend)

| Aba | Conteúdo |
|-----|----------|
| 🛸 Diretrizes | Detalha as regras do bolão, o sistema de pontuação e as cotas máximas para cada tipo de palpite. |
| 🔮 Classificados | Interface para a seleção dos 2 times classificados por grupo e visualização da tabela de palpites da tripulação. |
| 👑 Pódio Final | Seção para registrar os palpites do pódio (Campeão, Vice, 3º lugar), liberada manualmente pelos administradores nas Oitavas de Final. |
| 🏆 Classificação | Exibe o ranking geral dos participantes, com suas pontuações e posições. |
| 🛡️ Admin | (Apenas para administradores) Interface para gerenciar o bolão, como atualizar o ranking ou liberar o pódio. |

---

## 🤝 Contribuição

Contribuições são bem-vindas! Se você deseja contribuir com o projeto, siga estes passos:

1.  Faça um fork do repositório.
2.  Crie uma nova branch (`git checkout -b feature/sua-feature`).
3.  Faça suas alterações e commit-as (`git commit -m 'feat: Adiciona nova funcionalidade X'`).
4.  Envie suas alterações para o fork (`git push origin feature/sua-feature`).
5.  Abra um Pull Request detalhando suas modificações.

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. <!-- Assumindo que existe um arquivo LICENSE ou será criado -->

---

## 📞 Contato

Para dúvidas, sugestões ou suporte, entre em contato com [rafael.inacio2012@hotmail.com](mailto:rafael.inacio2012@hotmail.com).


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