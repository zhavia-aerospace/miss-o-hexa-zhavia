const definicaoGrupos = {
    "A": ["🇲🇽 México", "🇿🇦 África do Sul", "🇰🇷 Coreia do Sul", "🇨🇿 República Tcheca"],
    "B": ["🇨🇦 Canadá", "🇨🇭 Suíça", "🇶🇦 Catar", "🇧🇦 Bósnia e Herzegovina"],
    "C": ["🇧🇷 Brasil", "🇲🇦 Marrocos", "🇸🇨 Escócia", "🇭🇹 Haiti"],
    "D": ["🇺🇸 Estados Unidos", "🇵🇾 Paraguai", "🇦🇺 Austrália", "🇹🇷 Turquia"],
    "E": ["🇩🇪 Alemanha", "🇪🇨 Equador", "🇨🇮 Costa do Marfim", "🇨🇼 Curaçau"],
    "F": ["🇳🇱 Holanda", "🇯🇵 Japão", "🇹🇳 Tunísia", "🇸🇪 Suécia"],
    "G": ["🇧🇪 Bélgica", "🇮🇷 Irã", "🇪🇬 Egito", "🇳🇿 Nova Zelândia"],
    "H": ["🇪🇸 Espanha", "🇺🇾 Uruguai", "🇸🇦 Arábia Saudita", "🇨🇻 Cabo Verde"],
    "I": ["🇫🇷 França", "🇸🇳 Senegal", "🇳🇴 Noruega", "🇮🇶 Iraque"],
    "J": ["🇦🇷 Argentina", "🇦🇹 Áustria", "🇩🇿 Argélia", "🇯🇴 Jordânia"],
    "K": ["🇵🇹 Portugal", "🇨🇴 Colômbia", "🇺🇿 Uzbequistão", "🇨🇩 RD do Congo"],
    "L": ["🇪🇳 Inglaterra", "🇭🇷 Croácia", "🇵🇦 Panamá", "🇬🇭 Gana"]
};

// Estruturas de armazenamento em árvore límpida
let escolhasDosGrupos = { "A":[], "B":[], "C":[], "D":[], "E":[], "F":[], "G":[], "H":[], "I":[], "J":[], "K":[], "L":[] };
let r32 = { "d1":"", "d2":"", "d3":"", "d4":"", "d5":"", "d6":"", "d7":"", "d8":"" };
let quartas = { "q1":"", "q2":"", "q3":"", "q4":"" };
let semis = { "s1":"", "s2":"" };
let campeaoEscolhido = "";

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("stars-container");
    const starCount = 80;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement("div"); star.classList.add("star");
        const size = Math.random() * 3 + 1; star.style.width = `${size}px`; star.style.height = `${size}px`;
        star.style.top = `${Math.random() * 100}%`; star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 2}s`; container.appendChild(star);
    }
    document.getElementById("username").value = "";
    desenharPainelDeGrupos();
    carregarPalpitesDaPlanilha();
});

function mudarAba(nomeAba) {
    document.querySelectorAll(".tab-content").forEach(aba => aba.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
    document.getElementById(`aba-${nomeAba}`).classList.add("active");
    event.currentTarget.classList.add("active");
}

function voltarParaEtapa(passo) {
    document.querySelectorAll(".passo-simulador").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".etapa").forEach(e => e.classList.remove("active"));
    document.getElementById(`passo-${passo}`).classList.add("active");
    document.getElementById(`badge-passo-${passo}`).classList.add("active");
}

// 1. DESENHAR OS GRUPOS
function desenharPainelDeGrupos() {
    const grid = document.getElementById("macro-grid-grupos"); grid.innerHTML = "";
    Object.keys(definicaoGrupos).forEach(letra => {
        const card = document.createElement("div"); card.classList.add("card-grupo-space"); card.id = `card-grupo-${letra}`;
        let htmlTimes = `<h3>Grupo ${letra}</h3>`;
        definicaoGrupos[letra].forEach((time, idx) => {
            htmlTimes += `
                <div class="label-time-checkbox" id="time-${letra}-${idx}" onclick="selecionarPosicaoTime('${letra}', '${time}', ${idx})">
                    <span class="badge-posicao" id="badge-${letra}-${idx}" style="display:inline-block; width:24px; font-weight:bold; color:#666;">•</span>
                    <span style="color:#fff;">${time}</span>
                </div>`;
        });
        card.innerHTML = htmlTimes; grid.appendChild(card);
    });
}

function selecionarPosicaoTime(letra, time, idx) {
    const lista = escolhasDosGrupos[letra];
    if (lista.includes(time)) { lista.splice(lista.indexOf(time), 1); }
    else { if (lista.length >= 2) { alert(`⚠️ Grupo ${letra} completo!`); return; } lista.push(time); }
    atualizarVisualCardGrupo(letra);
}

function atualizarVisualCardGrupo(letra) {
    const lista = escolhasDosGrupos[letra];
    const card = document.getElementById(`card-grupo-${letra}`);
    definicaoGrupos[letra].forEach((time, idx) => {
        const el = document.getElementById(`time-${letra}-${idx}`);
        const badge = document.getElementById(`badge-${letra}-${idx}`);
        if (lista[0] === time) { el.style.background = "rgba(255, 204, 0, 0.15)"; badge.innerText = "1º"; badge.style.color = "var(--galaxy-gold)"; }
        else if (lista[1] === time) { el.style.background = "rgba(0, 255, 102, 0.15)"; badge.innerText = "2º"; badge.style.color = "var(--nebula-green)"; }
        else { el.style.background = "transparent"; badge.innerText = "•"; badge.style.color = "#666"; }
    });
    card.style.borderColor = (lista.length === 2) ? "var(--nebula-green)" : "var(--cosmic-blue)";
}

// 2. AVANÇAR PARA OS 16AVOS (ROUND OF 32)
function avancarParaR32() {
    let validacao = true;
    Object.keys(definicaoGrupos).forEach(l => { if(escolhasDosGrupos[l].length !== 2) validacao = false; });
    if (!validacao) { alert("⚠️ Escolha o 1º e 2º lugar de todos os 12 grupos!"); return; }

    voltarParaEtapa(2);
    const t = (letra, pos) => escolhasDosGrupos[letra][pos - 1];

    document.getElementById("grid-r32").innerHTML = `
        ${gerarCardDuelo('r32', 'd1', t('C',1), t('F',2), '1ºC', '2ºF')}
        ${gerarCardDuelo('r32', 'd2', t('F',1), t('C',2), '1ºF', '2ºC')}
        ${gerarCardDuelo('r32', 'd3', t('H',1), t('J',2), '1ºH', '2ºJ')}
        ${gerarCardDuelo('r32', 'd4', t('J',1), t('H',2), '1ºJ', '2ºH')}
        ${gerarCardDuelo('r32', 'd5', t('A',2), t('B',2), '2ºA', '2ºB')}
        ${gerarCardDuelo('r32', 'd6', t('E',2), t('I',2), '2ºE', '2ºI')}
        ${gerarCardDuelo('r32', 'd7', t('D',2), t('G',2), '2ºD', '2ºG')}
        ${gerarCardDuelo('r32', 'd8', t('K',2), t('L',2), '2ºK', '2ºL')}
    `;
}

// GERADOR DINÂMICO DE DUELOS (LIMPO - ESCONDE OS RÓTULOS SE FOREM IGUAIS AO TIME)
function gerarCardDuelo(fase, id, timeA, timeB, labelA, labelB) {
    const textoLabelA = (labelA === timeA) ? "" : `<span>${labelA}</span>`;
    const textoLabelB = (labelB === timeB) ? "" : `<span>${labelB}</span>`;

    return `
        <div class="arena-confronto" id="arena-${id}">
            <button class="botao-time-confronto" onclick="votarEtapaGenerica('${fase}', '${id}', '${timeA.replace(/'/g, "\\'")}')">
                ${textoLabelA} <strong>${timeA}</strong>
            </button>
            <div class="vs-space">— VS —</div>
            <button class="botao-time-confronto" onclick="votarEtapaGenerica('${fase}', '${id}', '${timeB.replace(/'/g, "\\'")}')">
                ${textoLabelB} <strong>${timeB}</strong>
            </button>
        </div>`;
}

function votarEtapaGenerica(fase, id, time) {
    if (fase === 'r32') r32[id] = time;
    if (fase === 'quartas') quartas[id] = time;
    if (fase === 'semis') semis[id] = time;
    if (fase === 'final') campeaoEscolhido = time;

    const arena = document.getElementById(`arena-${id}`);
    for(let btn of arena.getElementsByTagName("button")) {
        const check = btn.innerHTML.includes(time);
        btn.style.borderColor = check ? "var(--nebula-green)" : "rgba(255,255,255,0.1)";
        btn.style.background = check ? "rgba(0, 255, 102, 0.15)" : "rgba(255,255,255,0.02)";
    }
    arena.style.borderColor = "var(--nebula-green)";
}

// 3. AVANÇAR PARA AS QUARTAS DE FINAL (EXIBE CONFRONTOS DIRETOS LIMPOS)
function avancarParaQuartas() {
    for (let c in r32) { if(!r32[c]) { alert("⚠️ Escolha os vencedores de todos os confrontos de 16avos!"); return; } }
    voltarParaEtapa(3);

    document.getElementById("grid-quartas").innerHTML = `
        ${gerarCardDuelo('quartas', 'q1', r32['d1'], r32['d5'], r32['d1'], r32['d5'])}
        ${gerarCardDuelo('quartas', 'q2', r32['d2'], r32['d6'], r32['d2'], r32['d6'])}
        ${gerarCardDuelo('quartas', 'q3', r32['d3'], r32['d7'], r32['d3'], r32['d7'])}
        ${gerarCardDuelo('quartas', 'q4', r32['d4'], r32['d8'], r32['d4'], r32['d8'])}
    `;
}

// 4. AVANÇAR PARA AS SEMIFINAIS (EXIBE CONFRONTOS DIRETOS LIMPOS)
function avancarParaSemis() {
    for (let c in quartas) { if(!quartas[c]) { alert("⚠️ Escolha os vencedores de todas as chaves das Quartas!"); return; } }
    voltarParaEtapa(4);

    document.getElementById("grid-semis").innerHTML = `
        ${gerarCardDuelo('semis', 's1', quartas['q1'], quartas['q2'], quartas['q1'], quartas['q2'])}
        ${gerarCardDuelo('semis', 's2', quartas['q3'], quartas['q4'], quartas['q3'], quartas['q4'])}
    `;
}

// 5. AVANÇAR PARA A GRANDE FINAL (EXIBE ESTREITAMENTE OS 2 FINALISTAS)
function avancarParaFinal() {
    for (let c in semis) { if(!semis[c]) { alert("⚠️ Escolha os vencedores das duas Semifinais!"); return; } }
    voltarParaEtapa(5);

    document.getElementById("grid-final").innerHTML = `
        ${gerarCardDuelo('final', 'f1', semis['s1'], semis['s2'], 'Finalista 1', 'Finalista 2')}
    `;
}

// 6. SALVAR TUDO CONSOLIDADO NO SHEETDB
function salvarSimulacaoCompleta() {
    const nome = document.getElementById("username").value.trim();
    const msg = document.getElementById("saved-msg");
    const btn = document.getElementById("btn-enviar");

    if(!nome || !campeaoEscolhido) { alert("⚠️ Digite seu nome e coroe o Grande Campeão da Copa!"); return; }

    btn.innerText = "Sincronizando Árvore de Dados..."; btn.disabled = true;

    const payload = {
        "Nome": nome,
        "Campeao": campeaoEscolhido,
        "Data": new Date().toLocaleString("pt-BR")
    };

    Object.keys(escolhasDosGrupos).forEach(l => {
        payload[`Grupo_${l}`] = `1º: ${escolhasDosGrupos[l][0]} / 2º: ${escolhasDosGrupos[l][1]}`;
    });

    // Mapeamento dos 16avos (Round of 32)
    payload["Duelo_1C_2F"] = r32["d1"]; payload["Duelo_1F_2C"] = r32["d2"];
    payload["Duelo_1H_2J"] = r32["d3"]; payload["Duelo_1J_2H"] = r32["d4"];
    payload["Duelo_2A_2B"] = r32["d5"]; payload["Duelo_2E_2I"] = r32["d6"];
    payload["Duelo_2D_2G"] = r32["d7"]; payload["Duelo_2K_2L"] = r32["d8"];

    // Mapeamento das Quartas
    payload["Venc_Quartas_1"] = quartas["q1"]; payload["Venc_Quartas_2"] = quartas["q2"];
    payload["Venc_Quartas_3"] = quartas["q3"]; payload["Venc_Quartas_4"] = quartas["q4"];

    // Mapeamento das Semis
    payload["Venc_Semi_1"] = semis["s1"]; payload["Venc_Semi_2"] = semis["s2"];

    const urlPlanilha = "https://sheetdb.io/api/v1/uydiragrvi7jc";

    fetch(urlPlanilha, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [payload] })
    })
    .then(response => {
        if(response.ok) {
            msg.style.color = "#00ff66"; msg.innerText = `🚀 Sucesso, ${nome}! Seu mapa completo da Copa foi gravado!`;
            document.getElementById("username").value = "";
            escolhasDosGrupos = { "A":[], "B":[], "C":[], "D":[], "E":[], "F":[], "G":[], "H":[], "I":[], "J":[], "K":[], "L":[] };
            r32 = { "d1":"", "d2":"", "d3":"", "d4":"", "d5":"", "d6":"", "d7":"", "d8":"" };
            quartas = { "q1":"", "q2":"", "q3":"", "q4":"" }; semis = { "s1":"", "s2":"" }; campeaoEscolhido = "";
            voltarParaEtapa(1); desenharPainelDeGrupos(); carregarPalpitesDaPlanilha();
        } else { msg.style.color = "#ff3333"; msg.innerText = "❌ Falha ao gravar dados."; }
    })
    .catch(() => { msg.style.color = "#ff3333"; msg.innerText = "❌ Erro de conexão de rede."; })
    .finally(() => { btn.innerText = "Enviar Telemetria Completa 🏆"; btn.disabled = false; });
}

// CARREGAR HISTÓRICO COMPLETO
function carregarPalpitesDaPlanilha() {
    const urlPlanilha = "https://sheetdb.io/api/v1/uydiragrvi7jc";
    const cuerpoTabela = document.getElementById("tabela-palpites-corpo");
    fetch(urlPlanilha).then(r => r.json()).then(dados => {
        cuerpoTabela.innerHTML = "";
        if(!dados || dados.length === 0) { cuerpoTabela.innerHTML = `<tr><td colspan="25">Nenhum chaveamento computado nesta órbita ainda.</td></tr>`; return; }
        dados.reverse().forEach(item => {
            const linha = document.createElement("tr");
            linha.innerHTML = `
                <td style="font-weight:bold; color:#fff; position:sticky; left:0; background:var(--space-panel);">🛸 ${item.Nome}</td>
                <td>${item.Grupo_A || '-'}</td><td>${item.Grupo_B || '-'}</td><td>${item.Grupo_C || '-'}</td><td>${item.Grupo_D || '-'}</td><td>${item.Grupo_E || '-'}</td><td>${item.Grupo_F || '-'}</td><td>${item.Grupo_G || '-'}</td><td>${item.Grupo_H || '-'}</td><td>${item.Grupo_I || '-'}</td><td>${item.Grupo_J || '-'}</td><td>${item.Grupo_K || '-'}</td><td>${item.Grupo_L || '-'}</td>
                <td style="font-size:0.8rem; color:#aaa;">${item.Duelo_1C_2F || '-'}</td><td style="font-size:0.8rem; color:#aaa;">${item.Duelo_1F_2C || '-'}</td><td style="font-size:0.8rem; color:#aaa;">${item.Duelo_1H_2J || '-'}</td><td style="font-size:0.8rem; color:#aaa;">${item.Duelo_1J_2H || '-'}</td><td style="font-size:0.8rem; color:#aaa;">${item.Duelo_2A_2B || '-'}</td><td style="font-size:0.8rem; color:#aaa;">${item.Duelo_2E_2I || '-'}</td><td style="font-size:0.8rem; color:#aaa;">${item.Duelo_2D_2G || '-'}</td><td style="font-size:0.8rem; color:#aaa;">${item.Duelo_2K_2L || '-'}</td>
                <td style="font-size:0.8rem; color:var(--galaxy-gold);">${item.Venc_Quartas_1 || '-'}</td><td style="font-size:0.8rem; color:var(--galaxy-gold);">${item.Venc_Quartas_2 || '-'}</td><td style="font-size:0.8rem; color:var(--galaxy-gold);">${item.Venc_Quartas_3 || '-'}</td><td style="font-size:0.8rem; color:var(--galaxy-gold);">${item.Venc_Quartas_4 || '-'}</td>
                <td style="font-size:0.8rem; color:#fff;">${item.Venc_Semi_1 || '-'}</td><td style="font-size:0.8rem; color:#fff;">${item.Venc_Semi_2 || '-'}</td>
                <td style="background:rgba(255,204,0,0.15); font-weight:bold; color:var(--galaxy-gold); text-align:center;">👑 ${item.Campeao || '-'}</td>
                <td style="font-size:0.8rem; color:#aaa;">${item.Data}</td>`;
            cuerpoTabela.appendChild(linha);
        });
    }).catch(() => {});
}

function filtrarTabela() {
    const filtro = document.getElementById("busca-astronauta").value.toUpperCase();
    const linhas = document.getElementById("tabela-palpites-corpo").getElementsByTagName("tr");
    for (let i = 0; i < linhas.length; i++) {
        const col = linhas[i].getElementsByTagName("td")[0];
        if (col) { linhas[i].style.display = (col.textContent || col.innerText).toUpperCase().indexOf(filtro) > -1 ? "" : "none"; }
    }
}

function votarEnquete(ast) { document.getElementById("enquete-msg").innerText = `🌌 Voto computado para: ${ast}!`; }
function enviarMensagemMural() {
    const input = document.getElementById("input-mural"); const container = document.getElementById("mural-container"); const txt = input.value.trim();
    if (!txt) return; if (container.innerHTML.includes("Nenhuma mensagem")) container.innerHTML = "";
    const msg = document.createElement("p"); msg.style.marginBottom = "8px"; msg.innerHTML = `<span style="color:var(--nebula-green);">[👨‍🚀 TRIPULANTE]:</span> ${txt}`;
    container.insertBefore(msg, container.firstChild); input.value = "";
}

// 9. ORÁCULO INTELIGENTE DO GEMINI (BLINDADO CONTRA EXPULSÃO DO GITHUB)
async function consultarOraculo() {
    const pergunta = document.getElementById("pergunta-oraculo").value.trim();
    const box = document.getElementById("resposta-oraculo-box"); const txt = document.getElementById("resposta-oraculo-texto");
    
    if (!pergunta) { alert("⚠️ O Oráculo exige um questionamento! Digite uma pergunta antes de consultar os astros."); return; }
    
    // Tenta puxar a chave salva localmente na máquina do usuário
    let apiKey = localStorage.getItem("zhavia_gemini_key");
    
    // Se for o primeiro acesso no computador, ele solicita a chave uma única vez
    if (!apiKey) {
        apiKey = prompt("🔑 CONEXÃO SEGURA: Insira a Gemini API Key da Zhavia para ativar o Oráculo (Isso é feito apenas uma vez por computador):");
        if (!apiKey) return;
        localStorage.setItem("zhavia_gemini_key", apiKey.trim());
    }

    txt.innerText = "Decodificando resposta cósmica do Oráculo..."; box.style.display = "block";
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const instrucao = `Você é o Oráculo Espacial da empresa Zhavia Aerospace. Seu objetivo é responder perguntas dos colaboradores sobre a Copa do Mundo ou sobre a rotina da empresa durante os jogos. Aja como uma Inteligência Artificial alienígena bem-humorada, fanática pela seleção brasileira, que ama o Neymar e usa termos espaciais misturados com futebol e zoeira corporativa leve. Dê respostas curtas (máximo 3 linhas), engraçadas e diretas. Se a pergunta for sobre folga, dinheiro ou chefe, faça uma piada sobre "orçamento intergaláctico" ou "buraco negro no financeiro".`;
    
    try {
        const r = await fetch(url, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ contents: [{ parts: [{ text: `${instrucao}\n\nPergunta: ${pergunta}` }] }] }) 
        });
        
        const d = await r.json(); 
        
        if (d.candidates && d.candidates[0].content.parts[0].text) {
            txt.innerText = d.candidates[0].content.parts[0].text;
            document.getElementById("pergunta-oraculo").value = "";
        } else {
            throw new Error("Chave inválida");
        }
    } catch { 
        txt.innerText = "🛸 ERROR: Falha na autenticação ou chave inválida. O Oráculo resetou a memória, tente digitar a chave correta novamente."; 
        localStorage.removeItem("zhavia_gemini_key"); // Reseta se a chave falhar para o usuário reinserir
    }
}