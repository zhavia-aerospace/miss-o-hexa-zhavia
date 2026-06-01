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
});

function mudarAba(nomeAba) {
  document
    .querySelectorAll(".tab-content")
    .forEach((aba) => aba.classList.remove("active"));
  document
    .querySelectorAll(".nav-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.getElementById(`aba-${nomeAba}`).classList.add("active");
  event.currentTarget.classList.add("active");
}

// 🪐 FUNÇÃO DO ALERTA ESPACIAL ESTILIZADO
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

  // 🔒 TRAVA DE DISPOSITIVO: Impede múltiplos envios da mesma máquina
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
    .then((response) => {
      if (response.ok) {
        msg.style.color = "#00ff66";
        msg.innerText = `🚀 Sucesso, ${nome}! Seus palpites de grupos foram computados!`;

        // 🛑 ATIVA A TRAVA NO NAVEGADOR DO USUÁRIO APÓS O SUCESSO
        localStorage.setItem("bolao_hexa_enviado", "true");

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
      } else {
        msg.style.color = "#ff3333";
        msg.innerText = "❌ Falha ao salvar no servidor.";
      }
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

  let apiKey = localStorage.getItem("zhavia_gemini_key");
  if (!apiKey) {
    apiKey = prompt(
      "🔑 CONEXÃO SEGURA: Insira a Gemini API Key da Zhavia para ativar o Oráculo (Apenas uma vez por máquina):",
    );
    if (!apiKey) return;
    localStorage.setItem("zhavia_gemini_key", apiKey.trim());
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const instrucao = `Você é o Oráculo Espacial da empresa Zhavia Aerospace. Responda de forma corta (máximo 3 linhas) e bem-humorada sobre futebol, espaço e zoeira corporativa leve.`;

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
  } catch {
    mostrarAlertaCosmico(
      "Chave inválida ou problema de conexão. A memória local do Oráculo foi resetada.",
      "🛸 Falha do Sistema",
    );
    localStorage.removeItem("zhavia_gemini_key");
  }
}
