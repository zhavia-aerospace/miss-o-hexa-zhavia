import React, { useEffect, useState } from 'react';
import { LETRAS_GRUPOS, definicaoGrupos } from '../data/grupos.js';
import AvatarNome from './AvatarNome.jsx';

const _allBolaoNamesAdmin = Object.values(definicaoGrupos).flat();
function toBolaoNameAdmin(realNome) {
  return _allBolaoNamesAdmin.find((b) => b.startsWith(realNome)) ?? realNome;
}

const BASE = import.meta.env.VITE_API_URL ?? '';

async function getAdmin() {
  const r = await fetch(`${BASE}/api/admin`);
  return r.json();
}

async function getGabarito() {
  const r = await fetch(`${BASE}/api/gabarito`);
  return r.json();
}

async function salvarGabarito(grupos, podio) {
  const r = await fetch(`${BASE}/api/gabarito`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grupos, podio }),
  });
  return r.json();
}

async function calcularPontuacoes() {
  const r = await fetch(`${BASE}/api/calcular`, { method: 'POST' });
  return r.json();
}

async function zerarTodosPalpites() {
  const r = await fetch(`${BASE}/api/admin/palpites`, { method: 'DELETE' });
  return r.json();
}

async function deletarPalpite(id) {
  const r = await fetch(`${BASE}/api/admin/palpites/${id}`, { method: 'DELETE' });
  return r.json();
}

async function deletarPodio(id) {
  const r = await fetch(`${BASE}/api/podio/${id}`, { method: 'DELETE' });
  return r.json();
}

async function salvarRanking(ranking) {
  const r = await fetch(`${BASE}/api/admin/ranking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ranking }),
  });
  return r.json();
}

const ABA_LABELS = ['palpites', 'podio', 'gabarito', 'ranking', 'confrontos'];
const ABA_ICONS = { palpites: '🔮', podio: '👑', gabarito: '📋', ranking: '🏆', confrontos: '⚔️' };

export default function AbaAdmin() {
  const [aba, setAba] = useState('palpites');
  const [dados, setDados] = useState({ palpites: [], podios: [], ranking: [] });
  const [carregando, setCarregando] = useState(true);
  const [filtroPalpites, setFiltroPalpites] = useState('');
  const [filtroPodio, setFiltroPodio] = useState('');

  // Estado do editor de ranking
  const [linhasRanking, setLinhasRanking] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [msgRanking, setMsgRanking] = useState('');
  const [selecionadoRanking, setSelecionadoRanking] = useState(null);

  // Estado do gabarito
  const [gabGrupos, setGabGrupos] = useState(() =>
    Object.fromEntries(LETRAS_GRUPOS.map((l) => [l, ['', '']]))
  );
  const [gabPodio, setGabPodio] = useState({ p1: '', p2: '', p3: '' });
  const [podioLiberado, setPodioLiberado] = useState(false);
  const [palpitesTravados, setPalpitesTravados] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [msgYoutube, setMsgYoutube] = useState('');
  const [salvandoGab, setSalvandoGab] = useState(false);
  const [msgGab, setMsgGab] = useState('');

  // Estado do cálculo
  const [calculando, setCalculando] = useState(false);
  const [resultadoCalculo, setResultadoCalculo] = useState(null);
  const [msgCalculo, setMsgCalculo] = useState('');

  // Times classificados reais (API football-data.org): top-2 por grupo + top-8 terceiros
  const [gruposReais, setGruposReais] = useState([]);
  const [terceirosReais, setTerceirosReais] = useState([]);

  // === ESTADOS DOS CONFRONTOS & MODAL ===
  const [confrontos, setConfrontos] = useState([]);
  const [carregandoConfrontos, setCarregandoConfrontos] = useState(false);
  const [modalConfirmacao, setModalConfirmacao] = useState({ aberto: false, titulo: '', mensagem: '', acao: null, executando: false });

  async function fetchConfrontos() {
    setCarregandoConfrontos(true);
    try {
      const r = await fetch(`${BASE}/api/confrontos`);
      const data = await r.json();
      setConfrontos(data);
    } catch (e) {
      console.error('Erro ao buscar confrontos:', e);
    } finally {
      setCarregandoConfrontos(false);
    }
  }

  // Define um vencedor disparando via API
  async function executarDefinirVencedor(idJogo, vencedor, proximoJogoId) {
    try {
      const r = await fetch(`${BASE}/api/confrontos/${idJogo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vencedor, proximoJogoId })
      });
      if (r.ok) fetchConfrontos();
    } catch (error) {
      console.error(error);
    }
  }

  // Reverte um vencedor disparando via API
  async function executarReverterVencedor(idJogo, vencedor, proximoJogoId) {
    try {
      const r = await fetch(`${BASE}/api/confrontos/${idJogo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vencedor, proximoJogoId, reverter: true })
      });
      if (r.ok) fetchConfrontos();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchConfrontos();
    fetch(`${BASE}/api/grupos-reais`)
      .then((r) => r.json())
      .then((res) => {
        setGruposReais(res.data?.grupos ?? []);
        setTerceirosReais(res.data?.terceiros ?? []);
      })
      .catch(() => {});
    Promise.all([getAdmin(), getGabarito()])
      .then(([d, gab]) => {
        setDados(d);
        setLinhasRanking(
          d.ranking.length > 0
            ? d.ranking.map((r) => ({ astronauta: r.astronauta, pontuacao: String(r.pontuacao) }))
            : [{ astronauta: '', pontuacao: '' }]
        );
        if (gab.grupos) {
          setGabGrupos(
            Object.fromEntries(
              LETRAS_GRUPOS.map((l) => [l, gab.grupos[l]?.length === 2 ? gab.grupos[l] : ['', '']])
            )
          );
        }
        if (gab.podio) setGabPodio({ p1: gab.podio.p1 ?? '', p2: gab.podio.p2 ?? '', p3: gab.podio.p3 ?? '' });
        setPodioLiberado(gab.podioLiberado === true);
        setPalpitesTravados(gab.palpitesTravados === true);
        setYoutubeVideoId(gab.youtubeVideoId ?? '');
      })
      .finally(() => setCarregando(false));
  }, []);

  async function handleSalvarYoutube() {
    setMsgYoutube('');
    try {
      const r = await fetch(`${BASE}/api/gabarito/youtube-id`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: youtubeVideoId }),
      });
      const res = await r.json();
      setMsgYoutube(res.success ? '✅ Salvo!' : `❌ ${res.error}`);
    } catch {
      setMsgYoutube('❌ Falha na conexão.');
    }
  }

  async function handleTogglePalpites() {
    const novoEstado = !palpitesTravados;
    try {
      const r = await fetch(`${BASE}/api/gabarito/palpites-travados`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ travado: novoEstado }),
      });
      const res = await r.json();
      if (res.success) setPalpitesTravados(novoEstado);
    } catch {
      // silencia
    }
  }

  async function handleTogglePodio() {
    const novoEstado = !podioLiberado;
    try {
      const r = await fetch(`${BASE}/api/gabarito/podio-liberado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liberado: novoEstado }),
      });
      const res = await r.json();
      if (res.success) setPodioLiberado(novoEstado);
    } catch {
      // silencia
    }
  }

  function recarregar() {
    setCarregando(true);
    fetchConfrontos();
    Promise.all([getAdmin(), getGabarito()])
      .then(([d, gab]) => {
        setDados(d);
        setLinhasRanking(
          d.ranking.map((r) => ({ astronauta: r.astronauta, pontuacao: String(r.pontuacao) }))
        );
        if (gab.grupos) {
          setGabGrupos(
            Object.fromEntries(
              LETRAS_GRUPOS.map((l) => [l, gab.grupos[l]?.length === 2 ? gab.grupos[l] : ['', '']])
            )
          );
        }
        if (gab.podio) setGabPodio({ p1: gab.podio.p1 ?? '', p2: gab.podio.p2 ?? '', p3: gab.podio.p3 ?? '' });
      })
      .finally(() => setCarregando(false));
  }

  async function handleSalvarGabarito() {
    setSalvandoGab(true);
    setMsgGab('');
    try {
      const res = await salvarGabarito(gabGrupos, gabPodio);
      setMsgGab(res.success ? '✅ Gabarito salvo!' : `❌ ${res.error}`);
    } catch {
      setMsgGab('❌ Falha na conexão.');
    } finally {
      setSalvandoGab(false);
    }
  }

  async function handleCalcular() {
    setCalculando(true);
    setMsgCalculo('');
    setResultadoCalculo(null);
    try {
      const res = await calcularPontuacoes();
      if (Array.isArray(res)) {
        setResultadoCalculo(res);
        // Pré-popula o editor de ranking com os valores calculados
        setLinhasRanking(res.map((r) => ({ astronauta: r.nome, pontuacao: String(r.total) })));
        setAba('ranking');
        setMsgRanking('⚡ Ranking pré-preenchido com a pontuação calculada. Revise e salve!');
      } else {
        setMsgCalculo(`❌ ${res.error}`);
      }
    } catch {
      setMsgCalculo('❌ Falha no cálculo.');
    } finally {
      setCalculando(false);
    }
  }

  // --- Editor de ranking ---
  function addLinha() {
    setLinhasRanking((prev) => [...prev, { astronauta: '', pontuacao: '' }]);
  }

  function removeLinha(idx) {
    setLinhasRanking((prev) => prev.filter((_, i) => i !== idx));
  }

  function editarLinha(idx, campo, valor) {
    setLinhasRanking((prev) => prev.map((l, i) => (i === idx ? { ...l, [campo]: valor } : l)));
  }

  function getPalpitePessoa(nome) {
    return dados.palpites.find(p => p.nome.toLowerCase() === nome.toLowerCase());
  }

  function getPodioPessoa(nome) {
    return dados.podios.find(p => p.nome.toLowerCase() === nome.toLowerCase());
  }

  async function handleSalvarRanking() {
    const validas = linhasRanking.filter((l) => l.astronauta.trim() && l.pontuacao !== '');
    if (validas.length === 0) return;
    setSalvando(true);
    setMsgRanking('');
    try {
      const res = await salvarRanking(validas);
      if (res.success) {
        setMsgRanking(`✅ Ranking salvo com ${res.total} participantes!`);
        recarregar();
      } else {
        setMsgRanking(`❌ ${res.error}`);
      }
    } catch {
      setMsgRanking('❌ Falha na conexão com o servidor.');
    } finally {
      setSalvando(false);
    }
  }

  const palpitesFiltrados = dados.palpites.filter((p) =>
    p.nome.toLowerCase().includes(filtroPalpites.toLowerCase())
  );
  const podiosFiltrados = dados.podios.filter((p) =>
    p.nome.toLowerCase().includes(filtroPodio.toLowerCase())
  );

  // Times classificados: top-2 de cada grupo + top-8 terceiros da API real
  const classificados = Array.from(new Set([
    ...gruposReais.flatMap((g) =>
      g.tabela.filter((l) => l.posicao <= 2).map((l) => toBolaoNameAdmin(l.time.nome))
    ),
    ...terceirosReais.slice(0, 8).map((t) => toBolaoNameAdmin(t.time.nome)),
  ])).sort();

  // === LÓGICA DE AGRUPAMENTO DOS CONFRONTOS ===
  const fasesOrdem = ['Fase 1', 'Oitavas', 'Quartas', 'Semifinal', 'Final'];
  const confrontosAgrupados = confrontos.reduce((acc, jogo) => {
    if (!acc[jogo.fase]) acc[jogo.fase] = [];
    acc[jogo.fase].push(jogo);
    return acc;
  }, {});

  if (carregando) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--space-dark)' }}>
        <p style={{ color: 'var(--nebula-green)', fontSize: '1.2rem' }}>🛰️ Sincronizando dados...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--space-dark)', padding: '30px 20px', maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
      
      {/* === MODAL CUSTOMIZADO (ALERTA BONITO) === */}
      {modalConfirmacao.aberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#0b0f19', padding: '30px', borderRadius: '12px', border: '1px solid var(--cosmic-blue)', maxWidth: '420px', width: '90%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0, 102, 255, 0.2)' }}>
            <h2 style={{ color: 'var(--galaxy-gold)', margin: '0 0 15px 0', fontSize: '1.5rem' }}>{modalConfirmacao.titulo}</h2>
            <p style={{ color: '#ccc', marginBottom: '25px', fontSize: '1.05rem', lineHeight: 1.4 }}>{modalConfirmacao.mensagem}</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => setModalConfirmacao({ aberto: false, titulo: '', mensagem: '', acao: null, executando: false })}
                style={{ background: 'transparent', border: '1px solid #555', color: '#bbb', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                disabled={modalConfirmacao.executando}
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setModalConfirmacao(prev => ({ ...prev, executando: true }));
                  await modalConfirmacao.acao();
                  setModalConfirmacao({ aberto: false, titulo: '', mensagem: '', acao: null, executando: false });
                }}
                style={{ background: 'var(--cosmic-blue)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                disabled={modalConfirmacao.executando}
              >
                {modalConfirmacao.executando ? 'Processando...' : 'Confirmar 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <div style={{ color: 'var(--cosmic-blue)', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>
          Zhavia Aerospace
        </div>
        <h1 style={{ fontSize: '2rem', color: 'var(--galaxy-gold)', textShadow: '0 0 20px rgba(255,204,0,0.4)', margin: 0 }}>
          Painel de Controle 🛸
        </h1>
      </div>

      {/* Cards de resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Palpites enviados', valor: dados.palpites.length, cor: 'var(--cosmic-blue)' },
          { label: 'Pódios registrados', valor: dados.podios.length, cor: 'var(--galaxy-gold)' },
          { label: 'No ranking', valor: dados.ranking.length, cor: 'var(--nebula-green)' },
        ].map(({ label, valor, cor }) => (
          <div key={label} className="cosmic-panel" style={{ textAlign: 'center', padding: '18px 12px', margin: 0 }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: cor }}>{valor}</div>
            <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Navegação de abas */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid rgba(0,102,255,0.2)', paddingBottom: 10, overflowX: 'auto' }}>
        {ABA_LABELS.map((id) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            style={{
              background: aba === id ? 'var(--cosmic-blue)' : 'transparent',
              border: `1px solid ${aba === id ? 'var(--cosmic-blue)' : '#333'}`,
              color: aba === id ? '#fff' : '#aaa',
              padding: '8px 20px',
              borderRadius: 20,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {ABA_ICONS[id]} {id.charAt(0).toUpperCase() + id.slice(1)}
          </button>
        ))}
        <button
          onClick={recarregar}
          style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid #333', color: '#667', padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
        >
          🔄 Atualizar
        </button>
      </div>

      {/* ABA: PALPITES */}
      {aba === 'palpites' && (
        <div className="cosmic-panel" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>🔮 Palpites de Grupos ({palpitesFiltrados.length})</h2>
            <button
              onClick={async () => {
                if (!window.confirm('⚠️ Tem certeza? Isso apaga TODOS os palpites de grupos do banco. Ação irreversível.')) return;
                const res = await zerarTodosPalpites();
                if (res.success) {
                  setDados((d) => ({ ...d, palpites: [] }));
                }
              }}
              style={{ background: '#5a0000', border: '1px solid #c00', color: '#ff6666', padding: '6px 14px', borderRadius: 5, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
            >
              🗑️ Zerar todos
            </button>
            <button
              onClick={handleTogglePalpites}
              style={{
                padding: '6px 16px',
                borderRadius: 20,
                border: `2px solid ${palpitesTravados ? 'var(--nebula-green)' : '#ff3333'}`,
                background: 'transparent',
                color: palpitesTravados ? 'var(--nebula-green)' : '#ff3333',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
              }}
            >
              {palpitesTravados ? '🔓 Reabrir palpites' : '🔒 Travar palpites'}
            </button>
            <input
              type="text"
              value={filtroPalpites}
              onChange={(e) => setFiltroPalpites(e.target.value)}
              placeholder="🔍 Filtrar por nome..."
              style={{ background: 'var(--space-dark)', border: '1px solid #444', color: '#fff', padding: '8px 12px', borderRadius: 5, fontSize: '0.9rem', width: 220 }}
            />
          </div>

          {palpitesFiltrados.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: 30 }}>Nenhum palpite encontrado.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.08)' }}>
                    <th style={thStyle}>Astronauta</th>
                    {LETRAS_GRUPOS.map((l) => <th key={l} style={{ ...thStyle, minWidth: 90 }}>Gr. {l}</th>)}
                    <th style={thStyle}>Enviado em</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {palpitesFiltrados.map((p, i) => (
                    <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td style={{ ...tdStyle, fontWeight: 'bold', color: 'var(--galaxy-gold)', whiteSpace: 'nowrap' }}>
                        <AvatarNome nome={p.nome} size={28} fontSize="0.75rem" />
                      </td>
                      {LETRAS_GRUPOS.map((l) => (
                        <td key={l} style={{ ...tdStyle, fontSize: '0.78rem', color: '#ccc' }}>
                          {p.grupos?.[l] ? (
                            <>
                              <span style={{ color: 'var(--galaxy-gold)' }}>1º</span> {p.grupos[l][0]}<br />
                              <span style={{ color: 'var(--nebula-green)' }}>2º</span> {p.grupos[l][1]}
                            </>
                          ) : '—'}
                        </td>
                      ))}
                      <td style={{ ...tdStyle, color: '#667', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(p.createdAt).toLocaleString('pt-BR')}
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Remover o palpite de "${p.nome}"?`)) return;
                            const res = await deletarPalpite(p._id);
                            if (res.success) setDados((d) => ({ ...d, palpites: d.palpites.filter((x) => x._id !== p._id) }));
                          }}
                          style={{ background: '#3a0000', border: '1px solid #900', color: '#ff6666', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ABA: PÓDIO */}
      {aba === 'podio' && (
        <div className="cosmic-panel" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>👑 Pódios Registrados ({podiosFiltrados.length})</h2>
            <input
              type="text"
              value={filtroPodio}
              onChange={(e) => setFiltroPodio(e.target.value)}
              placeholder="🔍 Filtrar por nome..."
              style={{ background: 'var(--space-dark)', border: '1px solid #444', color: '#fff', padding: '8px 12px', borderRadius: 5, fontSize: '0.9rem', width: 220 }}
            />
          </div>

          {podiosFiltrados.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: 30 }}>Nenhum pódio registrado ainda.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.08)' }}>
                  <th style={thStyle}>Astronauta</th>
                  <th style={{ ...thStyle, color: 'var(--galaxy-gold)' }}>🥇 1º Lugar</th>
                  <th style={{ ...thStyle, color: '#d1d1d1' }}>🥈 2º Lugar</th>
                  <th style={{ ...thStyle, color: '#cd7f32' }}>🥉 3º Lugar</th>
                  <th style={thStyle}>Enviado em</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {podiosFiltrados.map((p, i) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td style={{ ...tdStyle, fontWeight: 'bold', color: 'var(--galaxy-gold)' }}><AvatarNome nome={p.nome} size={28} fontSize="0.75rem" /></td>
                    <td style={tdStyle}>{p.p1}</td>
                    <td style={tdStyle}>{p.p2}</td>
                    <td style={tdStyle}>{p.p3}</td>
                    <td style={{ ...tdStyle, color: '#667', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {new Date(p.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={async () => {
                          if (!window.confirm(`Remover o pódio de "${p.nome}"?`)) return;
                          const res = await deletarPodio(p._id);
                          if (res.success) setDados((d) => ({ ...d, podios: d.podios.filter((x) => x._id !== p._id) }));
                        }}
                        style={{ background: '#3a0000', border: '1px solid #900', color: '#ff6666', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ABA: GABARITO */}
      {aba === 'gabarito' && (
        <div className="cosmic-panel" style={{ margin: 0 }}>
          <h2 style={{ margin: '0 0 6px' }}>📋 Gabarito Oficial</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 24 }}>
            Informe os <strong>2 classificados reais</strong> de cada grupo (1º e 2º lugar) e o pódio final.<br />
            Após salvar, clique em <strong>"⚡ Calcular Pontuações"</strong> para gerar o ranking automaticamente.
          </p>

          {/* YouTube Video ID */}
          <div style={{ marginBottom: 28, padding: '14px 18px', borderRadius: 8, border: '1px solid rgba(0,102,255,0.25)', background: 'rgba(0,0,0,0.3)' }}>
            <label style={{ color: 'var(--nebula-green)', fontWeight: 'bold', fontSize: '0.9rem', display: 'block', marginBottom: 8 }}>📺 Video ID do YouTube (painel ao vivo)</label>
            <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: 10 }}>Cole o ID do vídeo (ex: <code style={{ color: '#aaa' }}>dQw4w9WgXcQ</code>) da transmissão ao vivo. Deixe vazio para mostrar botão de link.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                value={youtubeVideoId}
                onChange={(e) => { setYoutubeVideoId(e.target.value); setMsgYoutube(''); }}
                placeholder="Ex: dQw4w9WgXcQ"
                style={{ background: 'var(--space-dark)', border: '1px solid #444', color: '#fff', padding: '8px 12px', borderRadius: 5, fontSize: '0.9rem', flex: 1, minWidth: 200 }}
              />
              <button
                onClick={handleSalvarYoutube}
                style={{ background: 'rgba(0,102,255,0.3)', border: '1px solid var(--cosmic-blue)', color: '#fff', padding: '8px 18px', borderRadius: 5, cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              >
                💾 Salvar
              </button>
            </div>
            {msgYoutube && <p style={{ marginTop: 8, fontSize: '0.85rem', color: msgYoutube.startsWith('❌') ? '#ff6666' : 'var(--nebula-green)' }}>{msgYoutube}</p>}
          </div>

          {/* Grupos */}
          <h3 style={{ color: 'var(--nebula-green)', marginBottom: 16, fontSize: '1rem' }}>⚽ Grupos A – L</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 28 }}>
            {LETRAS_GRUPOS.map((letra) => (
              <div key={letra} style={{ background: 'rgba(0,0,0,0.3)', padding: 14, borderRadius: 8, border: '1px solid rgba(0,102,255,0.2)' }}>
                <div style={{ color: 'var(--galaxy-gold)', fontWeight: 'bold', marginBottom: 8, fontSize: '0.9rem' }}>
                  Grupo {letra}
                </div>
                {[0, 1].map((pos) => (
                  <div key={pos} style={{ marginBottom: pos === 0 ? 6 : 0 }}>
                    <label style={{ color: pos === 0 ? 'var(--galaxy-gold)' : 'var(--nebula-green)', fontSize: '0.75rem', display: 'block', marginBottom: 3 }}>
                      {pos === 0 ? '🥇 1º Classificado' : '🥈 2º Classificado'}
                    </label>
                    <select
                      value={gabGrupos[letra][pos]}
                      onChange={(e) => {
                        const nova = [...gabGrupos[letra]];
                        nova[pos] = e.target.value;
                        setGabGrupos((prev) => ({ ...prev, [letra]: nova }));
                      }}
                      style={{ ...selectStyle }}
                    >
                      <option value="">-- Selecione --</option>
                      {definicaoGrupos[letra].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Toggle palpites de grupos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, padding: '14px 18px', borderRadius: 8, border: `2px solid ${palpitesTravados ? '#ff3333' : 'var(--nebula-green)'}`, background: palpitesTravados ? 'rgba(255,51,51,0.05)' : 'rgba(0,255,102,0.05)' }}>
            <span style={{ fontSize: '1.8rem' }}>{palpitesTravados ? '🔒' : '🔓'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', color: palpitesTravados ? '#ff3333' : 'var(--nebula-green)' }}>
                Aba 1 (Palpites de Grupos) — {palpitesTravados ? 'TRAVADA (novos palpites bloqueados)' : 'ABERTA para envio'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 3 }}>
                {palpitesTravados ? 'Participantes veem aviso de encerramento.' : 'Participantes podem enviar palpites agora.'}
              </div>
            </div>
            <button
              onClick={handleTogglePalpites}
              style={{
                padding: '9px 20px',
                borderRadius: 20,
                border: `2px solid ${palpitesTravados ? 'var(--nebula-green)' : '#ff3333'}`,
                background: 'transparent',
                color: palpitesTravados ? 'var(--nebula-green)' : '#ff3333',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
              }}
            >
              {palpitesTravados ? '🔓 Reabrir' : '🔒 Travar'}
            </button>
          </div>

          {/* Toggle liberação do pódio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, padding: '14px 18px', borderRadius: 8, border: `2px solid ${podioLiberado ? 'var(--nebula-green)' : '#ff3333'}`, background: podioLiberado ? 'rgba(0,255,102,0.05)' : 'rgba(255,51,51,0.05)' }}>
            <span style={{ fontSize: '1.8rem' }}>{podioLiberado ? '🔓' : '🔒'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', color: podioLiberado ? 'var(--nebula-green)' : '#ff3333' }}>
                Aba 3 (Pódio Final) — {podioLiberado ? 'LIBERADA para todos' : 'BLOQUEADA (transmissão fechada)'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 3 }}>
                {podioLiberado ? 'Participantes podem enviar o pódio agora.' : 'Participantes veem a mensagem de bloqueio.'}
              </div>
            </div>
            <button
              onClick={handleTogglePodio}
              style={{
                padding: '9px 20px',
                borderRadius: 20,
                border: `2px solid ${podioLiberado ? '#ff3333' : 'var(--nebula-green)'}`,
                background: 'transparent',
                color: podioLiberado ? '#ff3333' : 'var(--nebula-green)',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
              }}
            >
              {podioLiberado ? '🔒 Bloquear' : '🔓 Liberar'}
            </button>
          </div>

          {/* Pódio */}
          <h3 style={{ color: 'var(--nebula-green)', marginBottom: 6, fontSize: '1rem' }}>👑 Pódio Final (opcional)</h3>
          <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: 16 }}>
            Só aparecem aqui os times classificados na Copa real (top-2 de cada grupo + top-8 terceiros).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { key: 'p1', label: '🥇 1º Lugar (Campeão)', cor: 'var(--galaxy-gold)' },
              { key: 'p2', label: '🥈 2º Lugar (Vice)', cor: '#d1d1d1' },
              { key: 'p3', label: '🥉 3º Lugar', cor: '#cd7f32' },
            ].map(({ key, label, cor }) => (
              <div key={key}>
                <label style={{ color: cor, fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>{label}</label>
                <select
                  value={gabPodio[key]}
                  onChange={(e) => setGabPodio((prev) => ({ ...prev, [key]: e.target.value }))}
                  style={selectStyle}
                >
                  <option value="">-- Selecione --</option>
                  {classificados.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-orbit"
              style={{ maxWidth: 220, margin: 0 }}
              onClick={handleSalvarGabarito}
              disabled={salvandoGab}
            >
              {salvandoGab ? 'Salvando...' : '💾 Salvar Gabarito'}
            </button>
            <button
              className="btn-orbit"
              style={{ maxWidth: 260, margin: 0, borderColor: 'var(--galaxy-gold)', color: 'var(--galaxy-gold)' }}
              onClick={handleCalcular}
              disabled={calculando}
            >
              {calculando ? 'Calculando...' : '⚡ Calcular Pontuações'}
            </button>
            {msgGab && <span style={{ color: msgGab.startsWith('✅') ? 'var(--nebula-green)' : '#ff4444', fontWeight: 'bold', fontSize: '0.9rem' }}>{msgGab}</span>}
            {msgCalculo && <span style={{ color: '#ff4444', fontWeight: 'bold', fontSize: '0.9rem' }}>{msgCalculo}</span>}
          </div>

          {/* Preview do cálculo */}
          {resultadoCalculo && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ color: 'var(--nebula-green)', marginBottom: 12, fontSize: '1rem' }}>📊 Preview — Pontuação Calculada</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ ...thStyle, width: 40 }}>#</th>
                      <th style={thStyle}>Participante</th>
                      <th style={{ ...thStyle, color: 'var(--cosmic-blue)' }}>Grupos</th>
                      <th style={{ ...thStyle, color: 'var(--galaxy-gold)' }}>Pódio</th>
                      <th style={{ ...thStyle, color: 'var(--nebula-green)' }}>Total</th>
                      <th style={thStyle}>Detalhes grupos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultadoCalculo.map((r, i) => (
                      <tr key={r.nome} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                        <td style={{ ...tdStyle, color: 'var(--galaxy-gold)', fontWeight: 'bold', textAlign: 'center' }}>{i + 1}º</td>
                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>👨‍🚀 {r.nome}</td>
                        <td style={{ ...tdStyle, color: 'var(--cosmic-blue)', textAlign: 'center' }}>{r.pontuacaoGrupos}</td>
                        <td style={{ ...tdStyle, color: 'var(--galaxy-gold)', textAlign: 'center' }}>{r.pontuacaoPodio}</td>
                        <td style={{ ...tdStyle, color: 'var(--nebula-green)', fontWeight: 'bold', textAlign: 'center', fontSize: '1.1rem' }}>{r.total}</td>
                        <td style={{ ...tdStyle, fontSize: '0.75rem', color: '#667' }}>
                          {LETRAS_GRUPOS.map((l) => {
                            const d = r.detalhesGrupos?.[l];
                            if (!d || d.pendente) return null;
                            return (
                              <span key={l} style={{ marginRight: 6, color: d.pontos >= 8 ? 'var(--nebula-green)' : d.pontos >= 4 ? 'var(--galaxy-gold)' : '#555' }}>
                                {l}:{d.pontos}
                              </span>
                            );
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ color: '#888', fontSize: '0.8rem', marginTop: 10 }}>
                ✅ O editor de Ranking foi pré-preenchido com esses valores. Vá para a aba <strong>🏆 Ranking</strong> para revisar e publicar.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ABA: RANKING */}
      {aba === 'ranking' && (
        <div className="cosmic-panel" style={{ margin: 0 }}>
          <h2 style={{ margin: '0 0 6px' }}>🏆 Editar Ranking</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 20 }}>
            Preencha nome e pontuação. A posição é calculada automaticamente por pontuação decrescente ao salvar.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ ...thStyle, width: 50 }}>#</th>
                  <th style={thStyle}>Nome</th>
                  <th style={{ ...thStyle, width: 130 }}>Pontuação</th>
                  <th style={{ ...thStyle, width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {linhasRanking.map((linha, i) => {
                  const palpiteEncontrado = getPalpitePessoa(linha.astronauta);
                  const podioEncontrado = getPodioPessoa(linha.astronauta);
                  const temDetalhes = Boolean(palpiteEncontrado || podioEncontrado);
                  const estaAberto = selecionadoRanking === i;

                  return (
                    <React.Fragment key={i}>
                      <tr
                        style={{
                          borderBottom: estaAberto ? 'none' : '1px solid rgba(255,255,255,0.04)',
                          background: estaAberto ? 'rgba(0,102,255,0.1)' : 'transparent',
                          cursor: temDetalhes ? 'pointer' : 'default',
                        }}
                        onClick={() => temDetalhes && setSelecionadoRanking(estaAberto ? null : i)}
                      >
                        <td style={{ ...tdStyle, color: '#667', textAlign: 'center' }}>{i + 1}</td>
                        <td style={{ ...tdStyle, fontWeight: temDetalhes ? 'bold' : 'normal' }}>
                          {temDetalhes && <span style={{ color: 'var(--nebula-green)', marginRight: 5, cursor: 'pointer' }}>👁️</span>}
                          <input
                            value={linha.astronauta}
                            onChange={(e) => editarLinha(i, 'astronauta', e.target.value)}
                            placeholder="Nome do participante"
                            style={inputStyle}
                          />
                        </td>
                        <td style={tdStyle}>
                          <input
                            type="number"
                            value={linha.pontuacao}
                            onChange={(e) => editarLinha(i, 'pontuacao', e.target.value)}
                            placeholder="0"
                            style={{ ...inputStyle, textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <button
                            onClick={() => removeLinha(i)}
                            style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1rem' }}
                            title="Remover"
                          >✕</button>
                        </td>
                      </tr>

                      {estaAberto && temDetalhes && (
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,102,255,0.08)' }}>
                          <td colSpan="4" style={{ padding: '16px 12px' }}>
                            <div style={{ color: '#ccc', fontSize: '0.85rem', marginBottom: 16 }}>
                              <div style={{ color: 'var(--galaxy-gold)', fontWeight: 'bold', marginBottom: 10 }}>👑 Pódio Chutado:</div>
                              {podioEncontrado ? (
                                <div style={{ display: 'flex', gap: 14, paddingLeft: 12 }}>
                                  <span style={{ color: 'var(--galaxy-gold)' }}>🥇 {podioEncontrado.p1}</span>
                                  <span style={{ color: '#d1d1d1' }}>🥈 {podioEncontrado.p2}</span>
                                  <span style={{ color: '#cd7f32' }}>🥉 {podioEncontrado.p3}</span>
                                </div>
                              ) : (
                                <span style={{ color: '#666', paddingLeft: 12 }}>(sem pódio enviado)</span>
                              )}
                            </div>
                            {palpiteEncontrado && (
                              <div style={{ color: '#ccc', fontSize: '0.85rem' }}>
                                <div style={{ color: 'var(--nebula-green)', fontWeight: 'bold', marginBottom: 10 }}>📋 Palpites de Grupos:</div>
                                {LETRAS_GRUPOS.map((l) => (
                                  <div key={l} style={{ marginBottom: 8, paddingLeft: 12 }}>
                                    <span style={{ color: 'var(--galaxy-gold)', fontWeight: 'bold' }}>Grupo {l}:</span>
                                    {palpiteEncontrado.grupos?.[l] ? (
                                      <>
                                        <span style={{ color: 'var(--galaxy-gold)' }}> 1º {palpiteEncontrado.grupos[l][0]}</span>
                                        {' • '}
                                        <span style={{ color: 'var(--nebula-green)' }}>2º {palpiteEncontrado.grupos[l][1]}</span>
                                      </>
                                    ) : (
                                      <span style={{ color: '#666' }}> (sem palpite)</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn-orbit" style={{ maxWidth: 200, margin: 0 }} onClick={addLinha}>
              + Adicionar linha
            </button>
            <button
              className="btn-orbit"
              style={{ maxWidth: 200, margin: 0, borderColor: 'var(--galaxy-gold)', color: 'var(--galaxy-gold)' }}
              onClick={handleSalvarRanking}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : '💾 Salvar Ranking'}
            </button>
            {msgRanking && (
              <span style={{ color: msgRanking.startsWith('✅') ? 'var(--nebula-green)' : '#ff4444', fontWeight: 'bold', fontSize: '0.9rem' }}>
                {msgRanking}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ABA: CONFRONTOS (COM NOVO LAYOUT DE FASES DIVIDIDAS) */}
      {aba === 'confrontos' && (
        <div className="cosmic-panel" style={{ margin: 0 }}>
          <h2 style={{ margin: '0 0 6px' }}>⚔️ Gerenciar Vencedores</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 20 }}>
            Defina quem venceu os duelos ou desfaça resultados incorretos. O sistema avançará o ganhador automaticamente.
          </p>

          {carregandoConfrontos ? (
            <p style={{ color: 'var(--nebula-green)', padding: 20, textAlign: 'center' }}>Carregando a chave do torneio...</p>
          ) : (
            fasesOrdem.map(fase => {
              const jogosDaFase = confrontosAgrupados[fase];
              // Se não houver jogos para essa fase, não renderiza nada
              if (!jogosDaFase || jogosDaFase.length === 0) return null;

              return (
                <div key={fase} style={{ marginBottom: '40px' }}>
                  
                  {/* === CABEÇALHO DIVISOR DA FASE === */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: 'var(--galaxy-gold)', fontSize: '1.4rem', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '2px' }}>
                      {fase}
                    </h3>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,204,0,0.5) 0%, transparent 100%)' }}></div>
                  </div>

                  {/* === GRID DE JOGOS DESSA FASE === */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 15 }}>
                    {jogosDaFase.map(jogo => (
                      <div key={jogo.idJogo} style={{ 
                        border: jogo.vencedor ? '1px solid rgba(0,255,102,0.3)' : '1px solid rgba(0,102,255,0.2)', 
                        padding: '16px', borderRadius: '8px', 
                        background: jogo.vencedor ? 'rgba(0,255,102,0.05)' : 'rgba(0,0,0,0.3)' 
                      }}>
                        <p style={{ margin: '0 0 12px 0', color: 'var(--cosmic-blue)', fontSize: '13px', fontWeight: 'bold' }}>
                          Jogo {jogo.idJogo}
                          {jogo.proximoJogoId ? <span style={{ color: '#888', fontWeight: 'normal' }}> (Avança p/ {jogo.proximoJogoId})</span> : <span style={{ color: 'var(--galaxy-gold)', fontWeight: 'normal' }}> (Grande Final)</span>}
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button 
                            onClick={() => setModalConfirmacao({
                              aberto: true, titulo: '✅ Confirmar Vitória',
                              mensagem: `Deseja cravar ${jogo.jogador1} como grande vencedor do Jogo ${jogo.idJogo}?`,
                              acao: () => executarDefinirVencedor(jogo.idJogo, jogo.jogador1, jogo.proximoJogoId)
                            })}
                            disabled={!jogo.jogador1 || jogo.vencedor}
                            style={{
                              padding: '10px 14px', cursor: (!jogo.jogador1 || jogo.vencedor) ? 'not-allowed' : 'pointer',
                              background: jogo.vencedor === jogo.jogador1 ? 'rgba(0,255,102,0.15)' : 'transparent', 
                              color: jogo.vencedor === jogo.jogador1 ? 'var(--nebula-green)' : (jogo.jogador1 ? '#fff' : '#666'), 
                              border: `1px solid ${jogo.vencedor === jogo.jogador1 ? 'var(--nebula-green)' : '#444'}`, 
                              borderRadius: '6px', fontWeight: 'bold', textAlign: 'left', display: 'flex', justifyContent: 'space-between'
                            }}
                          >
                            <span>{jogo.jogador1 || 'Aguardando...'}</span>
                            {jogo.vencedor === jogo.jogador1 && <span>🏆</span>}
                          </button>

                          <button 
                            onClick={() => setModalConfirmacao({
                              aberto: true, titulo: '✅ Confirmar Vitória',
                              mensagem: `Deseja cravar ${jogo.jogador2} como grande vencedor do Jogo ${jogo.idJogo}?`,
                              acao: () => executarDefinirVencedor(jogo.idJogo, jogo.jogador2, jogo.proximoJogoId)
                            })}
                            disabled={!jogo.jogador2 || jogo.vencedor}
                            style={{
                              padding: '10px 14px', cursor: (!jogo.jogador2 || jogo.vencedor) ? 'not-allowed' : 'pointer',
                              background: jogo.vencedor === jogo.jogador2 ? 'rgba(0,255,102,0.15)' : 'transparent', 
                              color: jogo.vencedor === jogo.jogador2 ? 'var(--nebula-green)' : (jogo.jogador2 ? '#fff' : '#666'), 
                              border: `1px solid ${jogo.vencedor === jogo.jogador2 ? 'var(--nebula-green)' : '#444'}`, 
                              borderRadius: '6px', fontWeight: 'bold', textAlign: 'left', display: 'flex', justifyContent: 'space-between'
                            }}
                          >
                            <span>{jogo.jogador2 || 'Aguardando...'}</span>
                            {jogo.vencedor === jogo.jogador2 && <span>🏆</span>}
                          </button>

                          {jogo.vencedor && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                              <button
                                onClick={() => setModalConfirmacao({
                                  aberto: true, titulo: '⏪ Desfazer Resultado',
                                  mensagem: `Tem certeza? Isso removerá a vitória de ${jogo.vencedor} do Jogo ${jogo.idJogo} e apagará ele da próxima fase.`,
                                  acao: () => executarReverterVencedor(jogo.idJogo, jogo.vencedor, jogo.proximoJogoId)
                                })}
                                style={{ background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                              >
                                ⏪ Desfazer Jogo {jogo.idJogo}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}

const thStyle = {
  padding: '10px 12px',
  textAlign: 'left',
  color: 'var(--galaxy-gold)',
  fontSize: '0.85rem',
  fontWeight: 'bold',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '10px 12px',
  color: '#ddd',
  verticalAlign: 'top',
};

const inputStyle = {
  width: '100%',
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid #333',
  color: '#fff',
  padding: '6px 10px',
  borderRadius: 4,
  fontSize: '0.9rem',
};

const selectStyle = {
  width: '100%',
  background: '#111424',
  border: '1px solid #333',
  color: '#fff',
  padding: '7px 10px',
  borderRadius: 4,
  fontSize: '0.85rem',
  cursor: 'pointer',
};