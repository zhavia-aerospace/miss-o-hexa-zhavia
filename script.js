const definicaoGrupos = {
  A: [
    "México 🇲🇽",
    "África do Sul 🇿🇦",
    "Coreia do Sul 🇰🇷",
    "República Tcheca 🇨🇿",
  ],
  B: ["Canadá 🇨🇦", "Suíça 🇨🇭", "Catar 🇶🇦", "Bósnia e Herzegovina 🇧🇦"],
  C: ["Brasil 🇧🇷", "Marrocos 🇲🇦", "Escócia 🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Haiti 🇭🇹"],
  D: ["Estados Unidos 🇺🇸", "Paraguai 🇵🇾", "Austrália 🇦🇺", "Turquia 🇹🇷"],
  E: ["Alemanha 🇩🇪", "Equador 🇪🇨", "Costa do Marfim 🇨🇮", "Curaçau 🇨🇼"],
  F: ["Holanda 🇳🇱", "Japão 🇯🇵", "Tunísia 🇹🇳", "Suécia 🇸🇪"],
  G: ["Bélgica 🇧🇪", "Irã 🇮🇷", "Egito 🇪🇬", "Nova Zelândia 🇳🇿"],
  H: ["Espanha 🇪🇸", "Uruguai 🇺🇾", "Arábia Saudita 🇸🇦", "Cabo Verde 🇨🇻"],
  I: ["França 🇫🇷", "Senegal 🇸🇳", "Noruega 🇳🇴", "Iraque 🇮🇶"],
  J: ["Argentina 🇦🇷", "Áustria 🇦🇹", "Argélia 🇩🇿", "Jordânia 🇯🇴"],
  K: ["Portugal 🇵🇹", "Colômbia 🇨🇴", "Uzbequistão 🇺🇿", "RD do Congo 🇨🇩"],
  L: ["Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croácia 🇭🇷", "Panamá 🇵🇦", "Gana 🇬🇭"],
};

let escolhasDosGrupos = {
  A: [],
  B: [],
  C: [],
  D: [],
  E: [],
  F: [],
  G: [],
  H: [],
  I: [],
  J: [],
  K: [],
  L: [],
};

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("stars-container");
  const starCount = 80;
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement("div");
    star.classList.add("star");
    const size = Math.random() * 3 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 2}s`;
    container.appendChild(star);
  }
  document.getElementById("username").value = "";
  desenharPainelDeGrupos();
  carregarPalpitesDaPlanilha();
  controlarVisibilidadeRadar();
});

// ⚡ FUNÇÃO DE MUDANÇA DE ABAS INTEGRADA COM OS GATILHOS VISUAIS
function mudarAba(nomeAba) {
  document
    .querySelectorAll(".tab-content")
    .forEach((aba) => aba.classList.remove("active"));
  document
    .querySelectorAll(".nav-btn")
    .forEach((btn) => btn.classList.remove("active"));

  document.getElementById(`aba-${nomeAba}`).classList.add("active");
  if (event && event.currentTarget) {
    event.currentTarget.classList.add("active");
  }

  // Se o astronauta clicar na Aba 3 (Pódio), renderiza os emojis nas caixas
  if (nomeAba === "podio" && window.twemoji) {
    twemoji.parse(document.getElementById("painel-formulario-podio"));
  }

  // 🚀 ADICIONADO: Se o usuário clicar na Aba 4, dispara a busca de telemetria na planilha!
  if (nomeAba === "ranking") {
    carregarRankingGeralDaPlanilha();
  }
}

function mostrarAlertaCosmico(mensagem, titulo = "⚠️ Alerta de Órbita") {
  document.getElementById("space-alert-title").innerText = titulo;
  document.getElementById("space-alert-msg").innerText = mensagem;
  const modal = document.getElementById("space-alert-modal");
  modal.style.display = "flex";
}

function fecharAlertaCosmico() {
  document.getElementById("space-alert-modal").style.display = "none";
}

function desenharPainelDeGrupos() {
  const grid = document.getElementById("macro-grid-grupos");
  grid.innerHTML = "";
  Object.keys(definicaoGrupos).forEach((letra) => {
    const card = document.createElement("div");
    card.classList.add("card-grupo-space");
    card.id = `card-grupo-${letra}`;
    let htmlTimes = `<h3>Grupo ${letra}</h3>`;
    definicaoGrupos[letra].forEach((time, idx) => {
      htmlTimes += `
        <div class="label-time-checkbox" id="time-${letra}-${idx}" onclick="selecionarPosicaoTime('${letra}', '${time}', ${idx})">
            <span class="badge-posicao" id="badge-${letra}-${idx}" style="display:inline-block; width:24px; font-weight:bold; color:#666;">•</span>
            <span style="color:#fff; font-size:1.1rem;">${time}</span>
        </div>`;
    });
    card.innerHTML = htmlTimes;
    grid.appendChild(card);
  });

  if (window.twemoji) {
    twemoji.parse(grid);
  }
}

function selecionarPosicaoTime(letra, time, idx) {
  const lista = escolhasDosGrupos[letra];
  if (lista.includes(time)) {
    lista.splice(lista.indexOf(time), 1);
  } else {
    if (lista.length >= 2) {
      mostrarAlertaCosmico(
        `O Grupo ${letra} já possui os dois classificados definidos! Desmarque uma seleção para poder alterar.`,
      );
      return;
    }
    lista.push(time);
  }
  atualizarVisualCardGrupo(letra);
}

function atualizarVisualCardGrupo(letra) {
  const lista = escolhasDosGrupos[letra];
  const card = document.getElementById(`card-grupo-${letra}`);
  definicaoGrupos[letra].forEach((time, idx) => {
    const el = document.getElementById("time-" + letra + "-" + idx);
    const badge = document.getElementById("badge-" + letra + "-" + idx);
    if (lista[0] === time) {
      el.style.background = "rgba(255, 204, 0, 0.15)";
      badge.innerText = "1º";
      badge.style.color = "var(--galaxy-gold)";
    } else if (lista[1] === time) {
      el.style.background = "rgba(0, 255, 102, 0.15)";
      badge.innerText = "2º";
      badge.style.color = "var(--nebula-green)";
    } else {
      el.style.background = "transparent";
      badge.innerText = "•";
      badge.style.color = "#666";
    }
  });
  card.style.borderColor =
    lista.length === 2 ? "var(--nebula-green)" : "var(--cosmic-blue)";
}

function salvarPalpitesGrupoApenas() {
  const nome = document.getElementById("username").value.trim();
  const msg = document.getElementById("saved-msg");
  const btn = document.getElementById("btn-enviar");

  if (localStorage.getItem("bolao_hexa_enviado") === "true") {
    mostrarAlertaCosmico(
      "Sua telemetria já foi transmitida para a base! Não é permitido enviar múltiplos palpites do mesmo dispositivo.",
      "🛰️ Missão Já Registrada",
    );
    return;
  }

  if (!nome) {
    mostrarAlertaCosmico(
      "Identifique-se com seu nome de astronauta para registrar sua missão!",
      "🛸 Identificação Necessária",
    );
    return;
  }

  let validacaoGeral = true;
  Object.keys(definicaoGrupos).forEach((l) => {
    if (escolhasDosGrupos[l].length !== 2) validacaoGeral = false;
  });

  if (!validacaoGeral) {
    mostrarAlertaCosmico(
      "Telemetria incompleta! Você precisa escolher exatamente 2 classificados em cada um dos 12 grupos destacados.",
      "🛰️ Falha de Varredura",
    );
    return;
  }

  btn.innerText = "Transmitindo dados à base...";
  btn.disabled = true;

  const payload = {
    Nome: nome,
    Data: new Date().toLocaleString("pt-BR"),
  };

  Object.keys(escolhasDosGrupos).forEach((l) => {
    payload[`Grupo_${l}`] =
      `1º: ${escolhasDosGrupos[l][0]} / 2º: ${escolhasDosGrupos[l][1]}`;
  });

  const urlPlanilha = "https://sheetdb.io/api/v1/uydiragrvi7jc";

  fetch(urlPlanilha, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: [payload] }),
  })
    .then(() => {
      localStorage.setItem("bolao_hexa_enviado", "true");
      msg.style.color = "#00ff66";
      msg.innerText = `🚀 Sucesso, ${nome}! Seus palpites de grupos foram computados!`;

      document.getElementById("username").value = "";
      escolhasDosGrupos = {
        A: [],
        B: [],
        C: [],
        D: [],
        E: [],
        F: [],
        G: [],
        H: [],
        I: [],
        J: [],
        K: [],
        L: [],
      };
      desenharPainelDeGrupos();
      carregarPalpitesDaPlanilha();
      controlarVisibilidadeRadar();
    })
    .catch(() => {
      msg.style.color = "#ff3333";
      msg.innerText = "❌ Erro na conexão orbital.";
    })
    .finally(() => {
      btn.innerText = "Computar Classificados 🚀";
      btn.disabled = false;
    });
}

function carregarPalpitesDaPlanilha() {
  const urlPlanilha = "https://sheetdb.io/api/v1/uydiragrvi7jc";
  const cuerpoTabela = document.getElementById("tabela-palpites-corpo");
  fetch(urlPlanilha)
    .then((r) => r.json())
    .then((dados) => {
      cuerpoTabela.innerHTML = "";
      if (!dados || dados.length === 0) {
        cuerpoTabela.innerHTML = `<tr><td colspan="14">Nenhum palpite computado ainda.</td></tr>`;
        return;
      }
      dados.reverse().forEach((item) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td style="font-weight:bold; color:#fff; position:sticky; left:0; background:var(--space-panel);">🛸 ${item.Nome}</td>
            <td style="font-size:0.85rem; white-space:nowrap;">${item.Grupo_A || "-"}</td><td style="font-size:0.85rem; white-space:nowrap;">${item.Grupo_B || "-"}</td>
            <td style="font-size:0.85rem; white-space:nowrap;">${item.Grupo_C || "-"}</td><td style="font-size:0.85rem; white-space:nowrap;">${item.Grupo_D || "-"}</td>
            <td style="font-size:0.85rem; white-space:nowrap;">${item.Grupo_E || "-"}</td><td style="font-size:0.85rem; white-space:nowrap;">${item.Grupo_F || "-"}</td>
            <td style="font-size:0.85rem; white-space:nowrap;">${item.Grupo_G || "-"}</td><td style="font-size:0.85rem; white-space:nowrap;">${item.Grupo_H || "-"}</td>
            <td style="font-size:0.85rem; white-space:nowrap;">${item.Grupo_I || "-"}</td><td style="font-size:0.85rem; white-space:nowrap;">${item.Grupo_J || "-"}</td>
            <td style="font-size:0.85rem; white-space:nowrap;">${item.Grupo_K || "-"}</td><td style="font-size:0.85rem; white-space:nowrap;">${item.Grupo_L || "-"}</td>
            <td style="font-size:0.8rem; color:#aaa;">${item.Data}</td>`;
        cuerpoTabela.appendChild(linha);
      });

      if (window.twemoji) {
        twemoji.parse(cuerpoTabela);
      }
    })
    .catch(() => {});
}

function filtrarTabela() {
  const filtro = document
    .getElementById("busca-astronauta")
    .value.toUpperCase();
  const linens = document
    .getElementById("tabela-palpites-corpo")
    .getElementsByTagName("tr");
  for (let i = 0; i < linens.length; i++) {
    const col = linens[i].getElementsByTagName("td")[0];
    if (col) {
      linens[i].style.display =
        (col.textContent || col.innerText).toUpperCase().indexOf(filtro) > -1
          ? ""
          : "none";
    }
  }
}

async function consultarOraculo() {
  const pergunta = document.getElementById("pergunta-oraculo").value.trim();
  const box = document.getElementById("resposta-oraculo-box");
  const txt = document.getElementById("resposta-oraculo-texto");

  if (!pergunta) {
    mostrarAlertaCosmico(
      "O Oráculo exige um questionamento! Digite uma pergunta antes de consultar os astros.",
      "🔮 Consulta Inválida",
    );
    return;
  }

  txt.innerText = "Decodificando resposta cósmica...";
  box.style.display = "block";

  // 🔑 COLOQUE SUA CHAVE FIXA AQUI DENTRO DAS ASPAS:
  const apiKey = "AQ.Ab8RN6L55qowoa0LCx6V6SHd6eMIptUTuwGbRf60s4ksuWYZvg";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const instrucao = `Você é o Oráculo Espacial da Supercopa Zhavia. Responda de forma curta (máximo 3 linhas) e bem-humorada sobre futebol, espaço e zoeira corporativa leve.`;

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: `${instrucao}\n\nPergunta: ${pergunta}` }] },
        ],
      }),
    });
    const d = await r.json();
    txt.innerText = d.candidates[0].content.parts[0].text;
    document.getElementById("pergunta-oraculo").value = "";
  } catch (erro) {
    console.error("Erro no Oráculo:", erro);
    mostrarAlertaCosmico(
      "O Oráculo está instável no momento. Tente novamente em outra órbita.",
      "🛸 Falha do Sistema",
    );
  }
}

function salvarPodioFinal() {
  const nome = document.getElementById("username-podio").value.trim();
  const p1 = document.getElementById("select-1-lugar").value;
  const p2 = document.getElementById("select-2-lugar").value;
  const p3 = document.getElementById("select-3-lugar").value;
  const msg = document.getElementById("saved-podio-msg");
  const btn = document.getElementById("btn-enviar-podio");

  if (localStorage.getItem("bolao_podio_enviado") === "true") {
    mostrarAlertaCosmico(
      "Sua telemetria de campeões já foi transmitida para a base! Não é permitido enviar múltiplos palpites do mesmo dispositivo.",
      "🛰️ Pódio Já Registrado",
    );
    return;
  }

  if (!nome) {
    mostrarAlertaCosmico(
      "Identifique-se com seu nome de astronauta para enviar o pódio!",
      "🛸 Identificação Necessária",
    );
    return;
  }
  if (!p1 || !p2 || !p3) {
    mostrarAlertaCosmico(
      "Você precisa selecionar os três colocados do pódio!",
      "👑 Pódio Incompleto",
    );
    return;
  }
  if (p1 === p2 || p1 === p3 || p2 === p3) {
    mostrarAlertaCosmico(
      "Anomalia detectada! Não é permitido repetir a mesma nação em posições diferentes do pódio.",
      "🚫 Seleção Duplicada",
    );
    return;
  }

  btn.innerText = "Transmitindo pódio à base...";
  btn.disabled = true;

  const payload = {
    Nome: nome,
    Podio_1_Lugar: p1,
    Podio_2_Lugar: p2,
    Podio_3_Lugar: p3,
    Data: new Date().toLocaleString("pt-BR"),
  };

  const urlPlanilha = "https://sheetdb.io/api/v1/uydiragrvi7jc?sheet=Podio";

  fetch(urlPlanilha, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: [payload] }),
  })
    .then(() => {
      localStorage.setItem("bolao_podio_enviado", "true");
      msg.style.color = "#00ff66";
      msg.innerText = `👑 Sucesso! O pódio do astronauta ${nome} foi eternizado!`;

      document.getElementById("username-podio").value = "";
      document.getElementById("select-1-lugar").value = "";
      document.getElementById("select-2-lugar").value = "";
      document.getElementById("select-3-lugar").value = "";
    })
    .catch(() => {
      msg.style.color = "#ff3333";
      msg.innerText = "❌ Erro na conexão orbital.";
    })
    .finally(() => {
      btn.innerText = "GRAVAR PÓDIO NA BASE 🚀";
      btn.disabled = false;
    });
}

function controlarVisibilidadeRadar() {
  const painelBloqueado = document.getElementById("radar-bloqueado");
  const painelConteudo = document.getElementById("radar-conteudo");

  if (!painelBloqueado || !painelConteudo) return;

  if (localStorage.getItem("bolao_hexa_enviado") === "true") {
    painelBloqueado.style.display = "none";
    painelConteudo.style.display = "block";
  } else {
    painelBloqueado.style.display = "block";
    painelConteudo.style.display = "none";
  }
}

// 🌐 BUSCA OS DADOS REAIS DO RANKING DA PLANILHA DO GOOGLE
// 🌐 BUSCA OS DADOS REAIS DO RANKING DA PLANILHA DO GOOGLE (VERSÃO BLINDADA)
function carregarRankingGeralDaPlanilha() {
  const urlRanking =
    "https://sheetdb.io/api/v1/uydiragrvi7jc?sheet=Classificacao";
  const corpoTabela = document.getElementById("tabela-ranking-geral");

  if (!corpoTabela) return;

  fetch(urlRanking)
    .then((r) => r.json())
    .then((dados) => {
      corpoTabela.innerHTML = "";

      if (!dados || dados.length === 0) {
        corpoTabela.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 20px; color: #ff3333;">⚠️ Nenhum dado encontrado na aba Classificacao.</td></tr>`;
        return;
      }

      dados.forEach((item, index) => {
        const posicaoRaw = item.Posicao || item.posicao || "";
        const nomeAstronauta = item.Astronauta || item.astronauta;

        let pontos =
          item["Pontuacao Total"] ||
          item["Pontuacaototal"] ||
          item.Pontuacao ||
          item.pontuacao ||
          "0";

        if (pontos === "#N/A" || pontos === "#REF!") {
          pontos = "0";
        }

        if (
          !nomeAstronauta ||
          nomeAstronauta.trim() === "" ||
          nomeAstronauta.includes("#REF!")
        )
          return;

        const linha = document.createElement("tr");
        linha.style.borderBottom = "1px solid #222";

        // 🥇 TRATAMENTO SEGURO DO PÓDIO: Evita travar com caracteres como "•"
        let classePodio = "";
        const numPosicao = parseInt(posicaoRaw, 10);

        if (!isNaN(numPosicao)) {
          if (numPosicao === 1) classePodio = "podio-1";
          else if (numPosicao === 2) classePodio = "podio-2";
          else if (numPosicao === 3) classePodio = "podio-3";
        }

        linha.className = `ranking-row-clicavel ${classePodio}`;
        linha.onclick = () => abrirDetalhesAstronauta(nomeAstronauta);

        // Exibe o número com º apenas se for um número válido, senão exibe o caractere da planilha
        const exibicaoPosicao = !isNaN(numPosicao)
          ? `${numPosicao}º`
          : `${posicaoRaw}`;

        linha.innerHTML = `
            <td class="posicao-num" style="padding: 14px 8px; font-weight: bold; color: var(--galaxy-gold); font-size: 1.1rem; text-align: left;">
              ${exibicaoPosicao}
            </td>
            <td style="padding: 14px 8px; font-weight: bold; color: #fff; text-align: left;">
              👨‍🚀 ${nomeAstronauta}
            </td>
            <td style="padding: 14px 8px; text-align: right; font-weight: bold; color: var(--nebula-green); font-size: 1.15rem;">
              ${pontos} pts
            </td>
        `;
        corpoTabela.appendChild(linha);
      });

      if (corpoTabela.innerHTML === "") {
        corpoTabela.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 30px; color: #aaa;">🛸 Aguardando computação de pontos na planilha...</td></tr>`;
      }
    })
    .catch((erro) => {
      console.error("Erro na sincronização:", erro);
      corpoTabela.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 20px; color: #ff3333;">❌ Falha na conexão com o satélite de pontuação.</td></tr>`;
    });
}

// 📊 ADICIONANDO: CONEXÃO COM A API DE FUTEBOL (NÃO MEXE EM NADA DO ANTERIOR)
// 🌐 BUSCA E GERENCIA OS PLACARES COM SISTEMA DE CACHE CÓSMICO (EVITA ACABAR OS CRÉDITOS DA API)
function carregarPlacaresAoVivoDaCopa() {
  const containerLive = document.getElementById("container-jogos-live");
  if (!containerLive) return;

  const AGORA = Date.now();
  const QUINZE_MINUTOS = 15 * 60 * 1000; // Tempo em milissegundos

  const cacheSalvo = localStorage.getItem("zhavia_cache_futebol");
  const cacheTempo = localStorage.getItem("zhavia_cache_tempo");

  // 🛰️ SE O CACHE EXISTIR E FOR RECENTE: Usa os dados locais e evita gastar a API!
  if (cacheSalvo && cacheTempo && AGORA - cacheTempo < QUINZE_MINUTOS) {
    console.log("🚀 Telemetria recuperada do cache local para poupar energia.");
    renderizarPainelJogos(JSON.parse(cacheSalvo));
    return;
  }

  // 🔑 CREDENCIAIS DO SEU RADAR ESPACIAL
  const tokenAPIFootball = "2b88600ff5defe42d6baa283c8aca0f6";
  const urlAPI =
    "https://v3.football.api-sports.io/fixtures?league=1&season=2026";

  console.log("📡 Conectando aos satélites da API-Sports para novos dados...");

  fetch(urlAPI, {
    method: "GET",
    headers: {
      "x-rapidapi-host": "v3.football.api-sports.io",
      "x-rapidapi-key": tokenAPIFootball,
    },
  })
    .then((res) => res.json())
    .then((dados) => {
      if (dados.response && dados.response.length > 0) {
        verificarNovosGols(dados.response);
        // Salva os novos dados no Cache do Navegador
        localStorage.setItem(
          "zhavia_cache_futebol",
          JSON.stringify(dados.response),
        );
        localStorage.setItem("zhavia_cache_tempo", AGORA.toString());
        renderizarPainelJogos(dados.response);
      } else {
        // Se a API retornar vazio mas tiver cache antigo, usa o antigo para não quebrar a tela
        if (cacheSalvo) renderizarPainelJogos(JSON.parse(cacheSalvo));
        else
          containerLive.innerHTML = `<p style="color: #666; text-align: center; font-size: 0.85rem;">Nenhum jogo agendado.</p>`;
      }
    })
    .catch((err) => {
      console.error("Erro radar esportivo:", err);
      if (cacheSalvo) {
        renderizarPainelJogos(JSON.parse(cacheSalvo));
      } else {
        containerLive.innerHTML = `<p style="color: #ff3333; text-align: center; font-size: 0.85rem;">Falha na telemetria dos placares.</p>`;
      }
    });
}

// 🖨️ FUNÇÃO AUXILIAR PARA MONTAR AS ABAS E LISTAR TODOS OS JOGOS
function renderizarPainelJogos(jogos) {
  const container = document.getElementById("container-jogos-live");
  if (!container) return;

  // Cria a estrutura das mini-abas se elas não existirem na barra lateral
  container.innerHTML = `
    <div style="display: flex; gap: 5px; margin-bottom: 12px; border-bottom: 1px solid rgba(0,102,255,0.2); padding-bottom: 8px;">
      <button id="tab-radar-live" onclick="alternarSubAbaRadar('live')" style="flex:1; background:var(--cosmic-blue); border:none; color:#fff; padding:6px; font-size:0.75rem; font-weight:bold; border-radius:4px; cursor:pointer;">AO VIVO / HOJE</button>
      <button id="tab-radar-hist" onclick="alternarSubAbaRadar('hist')" style="flex:1; background:rgba(255,255,255,0.05); border:1px solid #222; color:#aaa; padding:6px; font-size:0.75rem; font-weight:bold; border-radius:4px; cursor:pointer;">RESULTADOS</button>
    </div>
    <div id="radar-bloco-live"></div>
    <div id="radar-bloco-historico" style="display:none; max-height: 250px; overflow-y:auto; gap:8px; flex-direction:column;"></div>
  `;

  const blocoLive = document.getElementById("radar-bloco-live");
  const blocoHist = document.getElementById("radar-bloco-historico");

  let contLive = 0;
  let contHist = 0;

  // Ordena os jogos por data (mais antigos primeiro para o histórico fazer sentido)
  jogos.sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));

  jogos.forEach((confronto) => {
    const item = confronto.fixture;
    const times = confronto.teams;
    const gols = confronto.goals;
    const status = item.status.short;

    let tempoDeJogo = status;
    let corStatus = "#aaa";
    let ehLive = false;

    if (["1H", "2H", "HT", "ET", "P"].includes(status)) {
      tempoDeJogo = `LIVE • ${item.status.elapsed}'`;
      corStatus = "var(--nebula-green)";
      ehLive = true;
    } else if (status === "FT") {
      tempoDeJogo = "Encerrado";
      corStatus = "#667099";
    } else {
      const dataJogo = new Date(item.date);
      tempoDeJogo =
        dataJogo.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }) +
        " " +
        dataJogo.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
    }

    const cardHtml = `
      <div style="background: rgba(0, 0, 0, 0.4); padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03); display: flex; flex-direction: column; gap: 4px; margin-bottom:8px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: bold; color: ${corStatus};">
          <span>🎯 ${item.status.long}</span>
          <span>${tempoDeJogo}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #fff; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              <img src="${times.home.logo}" style="width: 14px; height: 14px;"> ${times.home.name}
            </span>
            <strong style="color: var(--galaxy-gold); font-size: 1rem;">${gols.home !== null ? gols.home : "-"}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #fff; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              <img src="${times.away.logo}" style="width: 14px; height: 14px;"> ${times.away.name}
            </span>
            <strong style="color: var(--galaxy-gold); font-size: 1rem;">${gols.away !== null ? gols.away : "-"}</strong>
          </div>
        </div>
      </div>
    `;

    // Distribui o jogo para a aba correta
    if (ehLive || status === "NS") {
      // Se está rolando agora ou se ainda não começou (Próximos jogos)
      blocoLive.insertAdjacentHTML("beforeend", cardHtml);
      contLive++;
    } else if (status === "FT") {
      // Se o jogo já terminou por completo
      blocoHist.insertAdjacentHTML("beforeend", cardHtml);
      contHist++;
    }
  });

  if (contLive === 0) {
    blocoLive.innerHTML = `<p style="color: #666; text-align: center; font-size: 0.8rem; padding: 10px;">Nenhum jogo rolando ou agendado para hoje.</p>`;
  }
  if (contHist === 0) {
    blocoHist.innerHTML = `<p style="color: #666; text-align: center; font-size: 0.8rem; padding: 10px;">Nenhum resultado computado ainda.</p>`;
  }
}

// 🔌 CONTROLE DE SELEÇÃO DE ABAS DENTRO DO RADAR
function alternarSubAbaRadar(tipo) {
  const btnLive = document.getElementById("tab-radar-live");
  const btnHist = document.getElementById("tab-radar-hist");
  const blocoLive = document.getElementById("radar-bloco-live");
  const blocoHist = document.getElementById("radar-bloco-historico");

  if (tipo === "live") {
    blocoLive.style.display = "block";
    blocoHist.style.display = "none";
    btnLive.style.background = "var(--cosmic-blue)";
    btnLive.style.color = "#fff";
    btnLive.style.border = "none";
    btnHist.style.background = "rgba(255,255,255,0.05)";
    btnHist.style.color = "#aaa";
    btnHist.style.border = "1px solid #222";
  } else {
    blocoLive.style.display = "none";
    blocoHist.style.display = "flex";
    btnHist.style.background = "var(--cosmic-blue)";
    btnHist.style.color = "#fff";
    btnHist.style.border = "none";
    btnLive.style.background = "rgba(255,255,255,0.05)";
    btnLive.style.color = "#aaa";
    btnLive.style.border = "1px solid #222";
  }
}

// ⚡ ACIONAMENTO AUTOMÁTICO DO SCRIPT (MODIFICADO PARA INICIAR OCULTO)
window.addEventListener("load", () => {
  carregarPlacaresAoVivoDaCopa();
  // Verifica o cache local a cada 2 minutos (Sem gastar requisição da API externa)
  setInterval(carregarPlacaresAoVivoDaCopa, 120000);

  // 📡 CORREÇÃO DE ÓRBITA: Força o painel a iniciar completamente fechado e invisível na montagem da página
  const painel = document.getElementById("painel-lateral-jogos");
  const conteudo = document.getElementById("conteudo-painel-lateral");
  const gatilhoMini = document.getElementById("radar-minimizado-trigger");
  const cabecalho = document.querySelector(".cabecalho-radar");

  if (painel && conteudo && gatilhoMini) {
    conteudo.style.display = "none";
    if (cabecalho) cabecalho.style.display = "none";
    gatilhoMini.style.display = "flex";
    painel.className = "cosmic-panel painel-lateral-oculto";
  }
  
  // Injeta dinamicamente a biblioteca de confetes se ela não estiver presente no HTML
  if (!window.confetti) {
    const scriptConfetti = document.createElement("script");
    scriptConfetti.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
    document.head.appendChild(scriptConfetti);
  }
});

// 🛸 FUNÇÃO DE MINIMIZAÇÃO E EXPANSÃO DO RADAR
let painelAberto = false;

function alternarPainelLateral() {
  const painel = document.getElementById("painel-lateral-jogos");
  const conteudo = document.getElementById("conteudo-painel-lateral");
  const botaoTexto = document.getElementById("btn-texto-switch");
  const gatilhoMini = document.getElementById("radar-minimizado-trigger");
  const cabecalho = document.querySelector(".cabecalho-radar");

  if (!painel || !conteudo || !botaoTexto || !gatilhoMini) return;

  if (painelAberto) {
    // 🎯 MODO OCULTO: Transforma o painel lateral em um gadget redondo pulsante
    conteudo.style.display = "none";
    cabecalho.style.display = "none";
    gatilhoMini.style.display = "flex";

    painel.className = "cosmic-panel painel-lateral-oculto";
    painelAberto = false;
  } else {
    // 🌌 MODO EXPANDIDO: Retorna ao painel de monitoramento completo
    gatilhoMini.style.display = "none";
    conteudo.style.display = "block";
    cabecalho.style.display = "flex";

    painel.className = "cosmic-panel painel-lateral-expandido";
    painelAberto = true;
  }
}

// 🔒 POP-UP DE DETALHES EVOLUÍDO: BUSCA OS PALPITES REAIS DO USUÁRIO NA BASE
function abrirDetalhesAstronauta(nomeSelecionado) {
  const jaVotouAba2 = localStorage.getItem("bolao_hexa_enviado");

  if (jaVotouAba2 !== "true") {
    mostrarAlertaCosmico(
      "⚠️ Você precisa enviar seus palpites na 'Aba 2: Classificados' primeiro para ganhar autorização de espionar a telemetria de outros astronautas!",
      "Acesso Bloqueado",
    );
    return;
  }

  const modal = document.createElement("div");
  modal.className = "modal-detalhes-astronauta";
  modal.id = "modal-espiao-astronauta";

  modal.innerHTML = `
    <div class="modal-detalhes-content" style="max-height: 85vh; overflow-y: auto;">
      <button class="modal-detalhes-fechar" onclick="document.getElementById('modal-espiao-astronauta').remove()">✕</button>
      <h3 style="color:var(--galaxy-gold); margin-bottom:15px; font-size:1.25rem; display:flex; align-items:center; gap:8px;">
        📊 Telemetria de Palpites: ${nomeSelecionado}
      </h3>
      <div id="detalhes-painel-interno" style="display:flex; flex-direction:column; gap:10px; font-size:0.9rem;">
        <p style="color:#667099; text-align:center; padding: 20px;">Sincronizando satélites para descriptografar palpites...</p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const urlBasePalpites = "https://sheetdb.io/api/v1/uydiragrvi7jc";

  fetch(urlBasePalpites)
    .then((r) => r.json())
    .then((dados) => {
      const painelInterno = document.getElementById("detalhes-painel-interno");
      if (!painelInterno) return;

      const palpiteUsuario = dados.find(
        (item) =>
          item.Nome &&
          item.Nome.trim().toUpperCase() ===
            nomeSelecionado.trim().toUpperCase(),
      );

      if (!palpiteUsuario) {
        painelInterno.innerHTML = `<p style="color:#ff3333; text-align:center;">Nenhum registro de grupos encontrado para este astronauta na base ativa.</p>`;
        return;
      }

      let htmlPalpites = `<div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:8px; margin-top:5px;">`;

      const letrasGrupos = ["A","B","C","D","E","F","G","H","I","J","K","L"];
      letrasGrupos.forEach((letra) => {
        const dadosGrupo = palpiteUsuario[`Grupo_${letra}`] || "Não enviado";
        htmlPalpites += `
          <div style="background:rgba(0,0,0,0.25); padding:8px; border-radius:6px; border:1px solid rgba(0,102,255,0.15);">
            <strong style="color:var(--galaxy-gold); display:block; margin-bottom:3px; font-size:0.8rem;">Grupo ${letra}</strong>
            <span style="color:#fff; font-size:0.75rem; display:block; line-height:1.3;">${dadosGrupo.replace(" / ", "<br>")}</span>
          </div>
        `;
      });

      htmlPalpites += `</div>`;
      htmlPalpites += `
        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05); margin:12px 0 5px 0;">
        <p style="color:#667099; text-align:center; font-size:0.75rem; font-style:italic;">[Pódio Final Supremo protegido por criptografia - Liberado nas Oitavas]</p>
      `;

      painelInterno.innerHTML = htmlPalpites;

      if (window.twemoji) {
        twemoji.parse(painelInterno);
      }
    })
    .catch((err) => {
      console.error("Erro ao descriptografar palpites:", err);
      const painelInterno = document.getElementById("detalhes-painel-interno");
      if (painelInterno) {
        painelInterno.innerHTML = `<p style="color:#ff3333; text-align:center;">Falha na conexão de rádio com o banco de palpites.</p>`;
      }
    });
}

// ⚠️ SISTEMA AUTOMÁTICO DE DETECÇÃO E ALERTA FLASH DE GOLS
function verificarNovosGols(dadosNovos) {
  const cacheAntigo = localStorage.getItem("zhavia_cache_futebol");
  if (!cacheAntigo) return;

  const dadosAntigos = JSON.parse(cacheAntigo);

  dadosNovos.forEach((jogoNovo) => {
    const jogoAntigo = dadosAntigos.find(
      (j) => j.fixture.id === jogoNovo.fixture.id,
    );

    if (jogoAntigo && jogoNovo.goals) {
      const golHomeMudou = jogoNovo.goals.home > jogoAntigo.goals.home;
      const golAwayMudou = jogoNovo.goals.away > jogoAntigo.goals.away;

      if (golHomeMudou || golAwayMudou) {
        const banner = document.createElement("div");
        banner.className = "banner-alerta-gol";
        banner.id = "flash-gol";
        banner.innerHTML = `
          <span style="font-size:1.3rem;">⚽</span>
          <span style="color:#fff; font-weight:bold; font-size:0.95rem;">
            GOOOL NA COPA! ${jogoNovo.teams.home.name} ${jogoNovo.goals.home} x ${jogoNovo.goals.away} ${jogoNovo.teams.away.name}
          </span>
        `;
        document.body.appendChild(banner);

        setTimeout(() => {
          if (document.getElementById("flash-gol"))
            document.getElementById("flash-gol").remove();
        }, 6000);
      }
    }
  });
}