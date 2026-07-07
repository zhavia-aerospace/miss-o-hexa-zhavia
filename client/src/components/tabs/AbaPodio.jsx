import { useEffect, useState } from 'react';
import { postPodio, getPodios, getNomesPalpites, getGruposReais, getPalpites } from '../../services/api.js'; // <-- Importado getPalpites
import { useAlerta } from '../../context/AlertContext.jsx';
import AutocompleteNome from '../AutocompleteNome.jsx';
import AvatarNome from '../AvatarNome.jsx';
import DetalhesAstronauta from '../DetalhesAstronauta.jsx'; // <-- Importado o Modal de Detalhes
import { definicaoGrupos } from '../../data/grupos.js';

const _allBolaoNames = Object.values(definicaoGrupos).flat();
function toBolaoName(realNome) {
  return _allBolaoNames.find((b) => b.startsWith(realNome)) ?? realNome;
}

export default function AbaPodio({ meuNome, onIdentificar }) {
  const { mostrarAlerta } = useAlerta();
  const [podioLiberado, setPodioLiberado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [classificados, setClassificados] = useState([]);
  const [nomesExistentes, setNomesExistentes] = useState([]);
  const [palpites, setPalpites] = useState([]); // <-- Estado para guardar os palpites de grupos

  // Identificação e login
  const [nomeLogin, setNomeLogin] = useState('');
  const [msgLogin, setMsgLogin] = useState('');

  // Formulário de chute
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [p3, setP3] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [msgEnvio, setMsgEnvio] = useState('');

  // Radar de pódios da tripulação e modal
  const [podios, setPodios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [astronautaSelecionado, setAstronautaSelecionado] = useState(null); // <-- Estado do astronauta clicado

  const identificado = meuNome.trim().length > 0;

  useEffect(() => {
    // podioLiberado vem da API
    fetch((import.meta.env.VITE_API_URL ?? '') + '/api/gabarito')
      .then((r) => r.json())
      .then((d) => setPodioLiberado(d.podioLiberado === true))
      .catch(() => {})
      .finally(() => setCarregando(false));

    // classificados vêm da API real
    getGruposReais()
      .then((res) => {
        const ativos = res.data?.classificadosAtivos ?? [];
        setClassificados(ativos.map(toBolaoName).sort());
      })
      .catch(() => {});

    getPodios().then(setPodios).catch(() => {});
    getPalpites().then(setPalpites).catch(() => {}); // <-- Busca os palpites de grupos para o modal cruzar dados
    getNomesPalpites().then(setNomesExistentes).catch(() => {});
  }, []);

  // ==========================================
  // MÁGICA DO TRAVAMENTO DO SCROLL (FORÇA BRUTA JS)
  // ==========================================
  useEffect(() => {
    if (astronautaSelecionado) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      const root = document.getElementById('root');
      if (root) root.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      const root = document.getElementById('root');
      if (root) root.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      const root = document.getElementById('root');
      if (root) root.style.overflow = '';
    };
  }, [astronautaSelecionado]);

  const temPodio = podios.some((p) => p.nome.trim().toLowerCase() === meuNome.trim().toLowerCase());
  const meuPodio = podios.find((p) => p.nome.trim().toLowerCase() === meuNome.trim().toLowerCase());
  const podiosFiltrados = podios.filter((p) =>
    p.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  function handleLogin() {
    if (!nomeLogin.trim()) {
      setMsgLogin('⚠️ Digite seu nome para continuar.');
      return;
    }
    onIdentificar(nomeLogin.trim());
    setMsgLogin('');
  }

  // Função que busca os dados completos do colega ao clicar na linha
  function abrirTelemetria(nomeAstronauta) {
    const nomeNorm = nomeAstronauta.trim().toLowerCase();
    const palpiteGrupo = palpites.find((p) => p.nome.trim().toLowerCase() === nomeNorm);
    
    if (palpiteGrupo) {
      setAstronautaSelecionado(palpiteGrupo);
    } else {
      // Caso o colega tenha pódio mas não tenha grupo (segurança contra bugs)
      setAstronautaSelecionado({ nome: nomeAstronauta, grupos: {} });
    }
  }

  async function enviarPodio() {
    if (!p1 || !p2 || !p3) {
      mostrarAlerta('Selecione os três colocados do pódio!', '👑 Pódio Incompleto');
      return;
    }
    if (p1 === p2 || p1 === p3 || p2 === p3) {
      mostrarAlerta('Não é permitido repetir a mesma nação no pódio.', '🚫 Seleção Duplicada');
      return;
    }

    setEnviando(true);
    setMsgEnvio('');
    try {
      await postPodio(meuNome, p1, p2, p3);
      getPodios().then(setPodios).catch(() => {});
    } catch (err) {
      if (err.message === 'Já existe um pódio com este nome') {
        getPodios().then(setPodios).catch(() => {});
      } else {
        setMsgEnvio(`❌ ${err.message}`);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="tab-content">
      {carregando ? (
        <div className="cosmic-panel" style={{ textAlign: 'center', color: '#aaa' }}>Verificando status da transmissão...</div>
      ) : (
        <>
          {/* PAINEL 1: FORMULÁRIO / PÓDIO / AVISO DE TRAVA */}
          <div className="cosmic-panel" style={{ borderColor: 'var(--galaxy-gold)' }}>
            
            {!podioLiberado ? (
              <>
                <div style={{ background: 'rgba(255,51,51,0.08)', border: '2px solid #ff3333', borderRadius: 10, padding: '24px 20px', marginBottom: 24, textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🔒</div>
                  <h3 style={{ color: '#ff5555', margin: '0 0 8px', fontSize: '1.2rem' }}>Transmissão Bloqueada pelo Comando Geral</h3>
                  <p style={{ color: '#aaa', margin: 0, fontSize: '0.95rem' }}>O palpite dos três primeiros colocados da Copa do Mundo está desativada no momento.</p>
                </div>

                {!identificado && (
                  <div style={{ padding: '16px', border: '1px solid rgba(0,102,255,0.35)', borderRadius: 8, background: 'rgba(0,102,255,0.06)' }}>
                    <p style={{ color: '#aaa', marginBottom: 10, fontSize: '0.9rem' }}>Confirme seu nome para desbloquear o radar da tripulação:</p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <AutocompleteNome
                        value={nomeLogin}
                        onChange={(v) => { setNomeLogin(v); setMsgLogin(''); }}
                        onEnter={handleLogin}
                        sugestoes={Array.from(new Set([...nomesExistentes, ...podios.map((p) => p.nome)]))}
                        placeholder="Seu nome..."
                      />
                      <button
                        onClick={handleLogin}
                        style={{ background: 'var(--cosmic-blue)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                      >
                        Confirmar 🚀
                      </button>
                    </div>
                    {msgLogin && <p style={{ marginTop: 8, fontSize: '0.88rem', color: '#ff6666' }}>{msgLogin}</p>}
                  </div>
                )}

                {identificado && temPodio && (
                  <div style={{ marginTop: 10 }}>
                    <h3 style={{ color: 'var(--galaxy-gold)', marginBottom: 12 }}>👑 Seu Pódio Supremo</h3>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '14px 18px', borderRadius: 8, border: '1px solid rgba(255,204,0,0.3)', background: 'rgba(255,204,0,0.05)' }}>
                      <span style={{ color: 'var(--galaxy-gold)', fontWeight: 'bold' }}>🥇 {meuPodio.p1}</span>
                      <span style={{ color: '#d1d1d1', fontWeight: 'bold' }}>🥈 {meuPodio.p2}</span>
                      <span style={{ color: '#cd7f32', fontWeight: 'bold' }}>🥉 {meuPodio.p3}</span>
                    </div>
                  </div>
                )}
              </>
            ) : 

            temPodio ? (
              <>
                <h2>👑 Seu Pódio Supremo</h2>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0 0', padding: '14px 18px', borderRadius: 8, border: '1px solid rgba(255,204,0,0.3)', background: 'rgba(255,204,0,0.05)' }}>
                  <span style={{ color: 'var(--galaxy-gold)', fontWeight: 'bold' }}>🥇 {meuPodio.p1}</span>
                  <span style={{ color: '#d1d1d1', fontWeight: 'bold' }}>🥈 {meuPodio.p2}</span>
                  <span style={{ color: '#cd7f32', fontWeight: 'bold' }}>🥉 {meuPodio.p3}</span>
                </div>
              </>
            ) : 

            !identificado ? (
              <>
                <h2>🛸 Identifique-se, Astronauta</h2>
                <p style={{ color: '#aaa', marginBottom: 20 }}>
                  Confirme seu nome para configurar o pódio da Copa ou ver a tabela da tripulação.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <AutocompleteNome
                    value={nomeLogin}
                    onChange={(v) => { setNomeLogin(v); setMsgLogin(''); }}
                    onEnter={handleLogin}
                    sugestoes={Array.from(new Set([...nomesExistentes, ...podios.map((p) => p.nome)]))}
                    placeholder="Digite seu nome completo..."
                  />
                  <button
                    onClick={handleLogin}
                    style={{ background: 'var(--cosmic-blue)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                  >
                    Confirmar 🚀
                  </button>
                </div>
                {msgLogin && <p style={{ marginTop: 8, fontSize: '0.88rem', color: '#ff6666' }}>{msgLogin}</p>}
              </>
            ) : 

            (
              <>
                <h2>👑 Configuração do Pódio Supremo</h2>
                <p style={{ color: '#aaa', marginBottom: 8 }}>
                  Astronauta: <strong style={{ color: 'var(--nebula-green)' }}>{meuNome}</strong>
                </p>
                <p style={{ color: '#aaa', marginBottom: 20 }}>Aponte quem terminará no topo imperial do campeonato:</p>

                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 25 }}>
                  {[
                    { id: 'p1', label: '🥇 1º Lugar (Campeão):', cor: 'var(--galaxy-gold)', placeholder: '-- Selecione o Campeão --', value: p1, set: setP1, outros: [p2, p3] },
                    { id: 'p2', label: '🥈 2º Lugar (Vice-Campeão):', cor: '#ddd', placeholder: '-- Selecione o Vice --', value: p2, set: setP2, outros: [p1, p3] },
                    { id: 'p3', label: '🥉 3º Lugar:', cor: '#b87333', placeholder: '-- Selecione o 3º Colocado --', value: p3, set: setP3, outros: [p1, p2] },
                  ].map(({ id, label, cor, placeholder, value, set, outros }) => (
                    <div key={id} className="user-identity" style={{ flex: 1, minWidth: 220 }}>
                      <label style={{ color: cor }}>{label}</label>
                      <select id={id} className="select-space-custom" value={value} onChange={(e) => set(e.target.value)}>
                        <option value="">{placeholder}</option>
                        {classificados.filter((t) => !outros.includes(t)).map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <button className="btn-orbit" style={{ maxWidth: 350 }} onClick={enviarPodio} disabled={enviando}>
                  {enviando ? 'Transmitindo pódio à base...' : 'GRAVAR PÓDIO NA BASE 🚀'}
                </button>
                {msgEnvio && (
                  <p className="success-text" style={{ color: msgEnvio.startsWith('❌') ? '#ff3333' : 'var(--nebula-green)' }}>
                    {msgEnvio}
                  </p>
                )}
              </>
            )}
          </div>

          {/* PAINEL 2: RADAR DA TRIPULAÇÃO */}
          <div className="cosmic-panel">
            <h2>🏆 Radar de Pódios da Tripulação</h2>
            
            {!identificado ? (
              <div style={{ marginTop: 15 }}>
                <div style={{ textAlign: 'center', padding: '24px 10px', border: '1px dashed #ffcc00', background: 'rgba(255,204,0,0.03)', borderRadius: 8 }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 10 }}>👁️‍🗨️</span>
                  <h3 style={{ color: 'var(--galaxy-gold)', marginBottom: 8 }}>Transmissão em Ponto Cego</h3>
                  <p style={{ color: '#ccc', maxWidth: 500, margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    Para visualizar os pódios da tripulação, <strong>confirme seu nome</strong> no painel superior.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="user-identity" style={{ margin: '15px 0' }}>
                  <input
                    type="text"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    placeholder="🔍 Rastrear por nome do colega..."
                  />
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="ranking-table">
                    <thead>
                      <tr>
                        <th>Astronauta</th>
                        <th>🥇 1º Lugar</th>
                        <th>🥈 2º Lugar</th>
                        <th>🥉 3º Lugar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {podiosFiltrados.length === 0 ? (
                        <tr><td colSpan={4} style={{ textAlign: 'center', color: '#aaa' }}>Nenhum pódio encontrado.</td></tr>
                      ) : (
                        podiosFiltrados.map((item) => (
                          <tr 
                            key={item._id}
                            style={{ cursor: 'pointer' }} // Torna a linha visualmente clicável
                            onClick={() => abrirTelemetria(item.nome)} // Dispara o modal ao clicar
                          >
                            <td style={{ fontWeight: 'bold', color: '#fff' }}>
                              <AvatarNome nome={item.nome} />
                            </td>
                            <td>{item.p1}</td>
                            <td>{item.p2}</td>
                            <td>{item.p3}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* RENDERIZAÇÃO DO MODAL DE TELEMETRIA COMPLETA */}
      {astronautaSelecionado && (
        <DetalhesAstronauta
          palpite={astronautaSelecionado}
          podio={podios.find(p => p.nome.trim().toLowerCase() === astronautaSelecionado.nome.trim().toLowerCase())}
          meuNome={meuNome}
          listaPodios={podios}
          onFechar={() => setAstronautaSelecionado(null)}
        />
      )}
    </section>
  );
}