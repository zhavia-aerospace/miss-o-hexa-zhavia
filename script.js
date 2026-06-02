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

// 🌐 BUSCA OS DADOS REAIS DO RANKING DA PLANILHA DO GOOGLE (Lógica Blindada Mapeada por Chaves Limpas)
// 🌐 BUSCA OS DADOS REAIS DO RANKING DA PLANILHA DO GOOGLE
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

      dados.forEach((item) => {
        // Puxa as propriedades exatas da planilha
        const posicao = item.Posicao || item.posicao || "•";
        const nomeAstronauta = item.Astronauta || item.astronauta;

        // 🛰️ CAPTURA INTELIGENTE: Tenta ler "Pontuacao Total", se não achar tenta "Pontuacao"
        let pontos =
          item["Pontuacao Total"] ||
          item["Pontuacaototal"] ||
          item.Pontuacao ||
          item.pontuacao ||
          "0";

        // Filtro contra erros de processamento temporários da planilha
        if (pontos === "#N/A" || pontos === "#REF!") {
          pontos = "0";
        }

        // Ignora linhas totalmente vazias ou o cabeçalho caso a API duplique
        if (
          !nomeAstronauta ||
          nomeAstronauta.trim() === "" ||
          nomeAstronauta.includes("#REF!")
        )
          return;

        const linha = document.createElement("tr");
        linha.style.borderBottom = "1px solid #222";

        linha.innerHTML = `
            <td style="padding: 14px 8px; font-weight: bold; color: var(--galaxy-gold); font-size: 1.1rem; text-align: left;">
              ${posicao}º
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
