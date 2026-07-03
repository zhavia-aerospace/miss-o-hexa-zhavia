import { useEffect, useState } from 'react';
import { postPodio, getPodios, getNomesPalpites, getGruposReais } from '../../services/api.js';
import { useAlerta } from '../../context/AlertContext.jsx';
import AutocompleteNome from '../AutocompleteNome.jsx';
import AvatarNome from '../AvatarNome.jsx';
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

  // Identificação — passo único antes de poder chutar
  const [nomeInput, setNomeInput] = useState('');

  // Formulário de chute (só aparece após identificar)
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [p3, setP3] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [msgEnvio, setMsgEnvio] = useState('');

  // Radar de pódios da tripulação
  const [podios, setPodios] = useState([]);
  const [filtro, setFiltro] = useState('');

  const identificado = meuNome.trim().length > 0;

  useEffect(() => {
    // podioLiberado ainda vem do gabarito
    fetch((import.meta.env.VITE_API_URL ?? '') + '/api/gabarito')
      .then((r) => r.json())
      .then((d) => setPodioLiberado(d.podioLiberado === true))
      .catch(() => {})
      .finally(() => setCarregando(false));

    // classificados vêm da API real: apenas times ainda vivos no torneio
    getGruposReais()
      .then((res) => {
        const ativos = res.data?.classificadosAtivos ?? [];
        setClassificados(ativos.map(toBolaoName).sort());
      })
      .catch(() => {});

    getPodios().then(setPodios).catch(() => {});
    getNomesPalpites().then(setNomesExistentes).catch(() => {});
  }, []);

  const temPodio = podios.some((p) => p.nome.trim().toLowerCase() === meuNome.trim().toLowerCase());
  const meuPodio = podios.find((p) => p.nome.trim().toLowerCase() === meuNome.trim().toLowerCase());
  const podiosFiltrados = podios.filter((p) =>
    p.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  function handleIdentificar() {
    if (!nomeInput.trim()) {
      mostrarAlerta('Digite seu nome para continuar.', '🛸 Identificação Necessária');
      return;
    }
    onIdentificar(nomeInput.trim());
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
      ) : !podioLiberado ? (
        <div className="cosmic-panel painel-bloqueado">
          <span className="lock-icon">🔒</span>
          <h2 style={{ color: '#ff3333', marginBottom: 10 }}>Transmissão Bloqueada pelo Comando Geral</h2>
          <p style={{ color: '#ccc', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            A simulação dos três primeiros colocados da Copa do Mundo está desativada no momento. Esta seção será liberada manualmente pelo comando da <strong>Zhavia Aerospace</strong> assim que os confrontos das Oitavas de Final forem decididos.
          </p>
        </div>
      ) : !identificado ? (
        <div className="cosmic-panel" style={{ borderColor: 'var(--galaxy-gold)' }}>
          <h2>🛸 Identifique-se, Astronauta</h2>
          <p style={{ color: '#aaa', marginBottom: 20 }}>
            Confirme seu nome para chutar o pódio — ou para ver seu chute, caso já tenha enviado.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <AutocompleteNome
              value={nomeInput}
              onChange={setNomeInput}
              onEnter={handleIdentificar}
              sugestoes={Array.from(new Set([...nomesExistentes, ...podios.map((p) => p.nome)]))}
              placeholder="Digite seu nome completo..."
            />
            <button
              onClick={handleIdentificar}
              style={{ background: 'var(--cosmic-blue)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
            >
              Confirmar 🚀
            </button>
          </div>
        </div>
      ) : temPodio ? (
        <div className="cosmic-panel" style={{ borderColor: 'var(--galaxy-gold)' }}>
          <h2>👑 Seu Pódio Supremo</h2>
          {meuPodio && (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0 24px', padding: '14px 18px', borderRadius: 8, border: '1px solid rgba(255,204,0,0.3)', background: 'rgba(255,204,0,0.05)' }}>
              <span style={{ color: 'var(--galaxy-gold)', fontWeight: 'bold' }}>🥇 {meuPodio.p1}</span>
              <span style={{ color: '#d1d1d1', fontWeight: 'bold' }}>🥈 {meuPodio.p2}</span>
              <span style={{ color: '#cd7f32', fontWeight: 'bold' }}>🥉 {meuPodio.p3}</span>
            </div>
          )}

          <h3 style={{ color: 'var(--nebula-green)', marginBottom: 12, fontSize: '1.05rem' }}>🛰️ Pódio da Tripulação</h3>
          <div className="user-identity" style={{ margin: '0 0 15px' }}>
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
                    <tr key={item._id}>
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
        </div>
      ) : (
        <div className="cosmic-panel" style={{ borderColor: 'var(--galaxy-gold)' }}>
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
                <select
                  id={id}
                  className="select-space-custom"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                >
                  <option value="">{placeholder}</option>
                  {classificados
                    .filter((t) => !outros.includes(t))
                    .map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                </select>
              </div>
            ))}
          </div>

          <button
            className="btn-orbit"
            style={{ maxWidth: 350 }}
            onClick={enviarPodio}
            disabled={enviando}
          >
            {enviando ? 'Transmitindo pódio à base...' : 'GRAVAR PÓDIO NA BASE 🚀'}
          </button>
          {msgEnvio && (
            <p className="success-text" style={{ color: msgEnvio.startsWith('❌') ? '#ff3333' : 'var(--nebula-green)' }}>
              {msgEnvio}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
