import { useCallback, useEffect, useRef, useState } from 'react';
import { definicaoGrupos, escolhasIniciais, LETRAS_GRUPOS } from '../../data/grupos.js';
import { getPalpites, postPalpite } from '../../services/api.js';
import { useAlerta } from '../../context/AlertContext.jsx';
import DetalhesAstronauta from '../DetalhesAstronauta.jsx';

const JA_ENVIOU_KEY = 'bolao_hexa_enviado';

export default function AbaPalpites({ onPalpiteEnviado }) {
  const { mostrarAlerta } = useAlerta();
  const [nome, setNome] = useState('');
  const [escolhas, setEscolhas] = useState(escolhasIniciais);
  const [enviando, setEnviando] = useState(false);
  const [msgEnvio, setMsgEnvio] = useState('');
  const [jaEnviou, setJaEnviou] = useState(() => localStorage.getItem(JA_ENVIOU_KEY) === 'true');
  const [palpites, setPalpites] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [astronautaSelecionado, setAstronautaSelecionado] = useState(null);
  const gridRef = useRef(null);

  const carregarPalpites = useCallback(async () => {
    try {
      const dados = await getPalpites();
      setPalpites(dados);
    } catch {
      // silencia
    }
  }, []);

  useEffect(() => {
    if (jaEnviou) carregarPalpites();
  }, [jaEnviou, carregarPalpites]);

  // Aplica Twemoji no grid quando as escolhas mudam
  useEffect(() => {
    if (gridRef.current && window.twemoji) {
      window.twemoji.parse(gridRef.current);
    }
  }, [escolhas]);

  function selecionarTime(letra, time) {
    setEscolhas((prev) => {
      const lista = [...prev[letra]];
      if (lista.includes(time)) {
        return { ...prev, [letra]: lista.filter((t) => t !== time) };
      }
      if (lista.length >= 2) {
        mostrarAlerta(
          `O Grupo ${letra} já possui os dois classificados definidos! Desmarque uma seleção para alterar.`
        );
        return prev;
      }
      return { ...prev, [letra]: [...lista, time] };
    });
  }

  async function enviarPalpite() {
    if (localStorage.getItem(JA_ENVIOU_KEY) === 'true') {
      mostrarAlerta(
        'Sua telemetria já foi transmitida para a base! Não é permitido enviar múltiplos palpites do mesmo dispositivo.',
        '🛰️ Missão Já Registrada'
      );
      return;
    }
    if (!nome.trim()) {
      mostrarAlerta('Identifique-se com seu nome de astronauta!', '🛸 Identificação Necessária');
      return;
    }
    const incompleto = LETRAS_GRUPOS.some((l) => escolhas[l].length !== 2);
    if (incompleto) {
      mostrarAlerta(
        'Telemetria incompleta! Escolha exatamente 2 classificados em cada um dos 12 grupos.',
        '🛰️ Falha de Varredura'
      );
      return;
    }

    setEnviando(true);
    setMsgEnvio('');
    try {
      await postPalpite(nome.trim(), escolhas);
      localStorage.setItem(JA_ENVIOU_KEY, 'true');
      setJaEnviou(true);
      onPalpiteEnviado?.();
      setMsgEnvio(`🚀 Sucesso, ${nome.trim()}! Seus palpites foram computados!`);
      setNome('');
      setEscolhas(escolhasIniciais());
      carregarPalpites();
    } catch (err) {
      if (err.message === 'Já existe um palpite com este nome') {
        localStorage.setItem(JA_ENVIOU_KEY, 'true');
        setJaEnviou(true);
        onPalpiteEnviado?.();
        carregarPalpites();
        setMsgEnvio(`✅ Identificamos que "${nome.trim()}" já enviou os palpites! Ranking liberado.`);
      } else {
        setMsgEnvio(`❌ ${err.message}`);
      }
    } finally {
      setEnviando(false);
    }
  }

  const palpitesFiltrados = palpites.filter((p) =>
    p.nome.toUpperCase().includes(filtro.toUpperCase())
  );

  return (
    <section className="tab-content">
      {/* Formulário de palpite */}
      <div className="cosmic-panel">
        <div style={{ background: 'rgba(255,204,0,0.07)', border: '1px dashed var(--galaxy-gold)', padding: '12px 15px', borderRadius: 6, marginBottom: 20, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>⚠️</span>
          <span style={{ color: '#fff' }}><strong>Atenção Tripulante:</strong> Só é possível enviar seus palpites <strong>uma única vez.</strong></span>
        </div>

        <h2>🔮 Simulador de Classificados da Fase de Grupos</h2>
        <p style={{ marginBottom: 20, color: '#aaa' }}>
          Selecione <strong>exatamente 2 nações</strong> por grupo:
        </p>

        <div className="user-identity" style={{ marginBottom: 25 }}>
          <label htmlFor="username">Nome do Astronauta:</label>
          <input
            id="username"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite seu nome completo"
            autoComplete="off"
          />
        </div>

        {/* Grid de grupos */}
        <div className="grid-grupos-bolao" ref={gridRef}>
          {LETRAS_GRUPOS.map((letra) => {
            const lista = escolhas[letra];
            return (
              <div
                key={letra}
                className="card-grupo-space"
                style={{ borderColor: lista.length === 2 ? 'var(--nebula-green)' : 'var(--cosmic-blue)' }}
              >
                <h3>Grupo {letra}</h3>
                {definicaoGrupos[letra].map((time) => {
                  const pos = lista.indexOf(time);
                  const selecionado = pos !== -1;
                  return (
                    <div
                      key={time}
                      className="label-time-checkbox"
                      onClick={() => selecionarTime(letra, time)}
                      style={{
                        background: pos === 0
                          ? 'rgba(255,204,0,0.15)'
                          : pos === 1
                          ? 'rgba(0,255,102,0.15)'
                          : 'transparent',
                      }}
                    >
                      <span style={{
                        display: 'inline-block',
                        width: 24,
                        fontWeight: 'bold',
                        color: pos === 0 ? 'var(--galaxy-gold)' : pos === 1 ? 'var(--nebula-green)' : '#666',
                      }}>
                        {pos === 0 ? '1º' : pos === 1 ? '2º' : '•'}
                      </span>
                      <span style={{ color: '#fff', fontSize: '1.1rem' }}>{time}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <button
          className="btn-orbit"
          style={{ maxWidth: 350, marginTop: 30 }}
          onClick={enviarPalpite}
          disabled={enviando}
        >
          {enviando ? 'Transmitindo dados à base...' : 'Computar Classificados 🚀'}
        </button>
        {msgEnvio && (
          <p className="success-text" style={{ color: msgEnvio.startsWith('❌') ? '#ff3333' : 'var(--nebula-green)' }}>
            {msgEnvio}
          </p>
        )}
      </div>

      {/* Radar — tabela de palpites */}
      <div className="cosmic-panel">
        <h2>🏆 Radar de Grupos da Tripulação</h2>

        {!jaEnviou ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', border: '1px dashed #ffcc00', background: 'rgba(255,204,0,0.03)', borderRadius: 8, marginTop: 15 }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 10 }}>👁️‍🗨️</span>
            <h3 style={{ color: 'var(--galaxy-gold)', marginBottom: 8 }}>Transmissão em Ponto Cego</h3>
            <p style={{ color: '#ccc', maxWidth: 500, margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Para visualizar os palpites da tripulação, <strong>envie os seus classificados</strong> primeiro!
            </p>
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
              <table className="ranking-table" style={{ minWidth: 1400 }}>
                <thead>
                  <tr>
                    <th>Astronauta</th>
                    {LETRAS_GRUPOS.map((l) => <th key={l}>Gr. {l}</th>)}
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {palpitesFiltrados.length === 0 ? (
                    <tr><td colSpan={15} style={{ textAlign: 'center', color: '#aaa' }}>Nenhum palpite encontrado.</td></tr>
                  ) : (
                    palpitesFiltrados.map((item) => (
                      <tr key={item._id}>
                        <td
                          style={{ fontWeight: 'bold', color: '#fff', position: 'sticky', left: 0, background: 'var(--space-panel)', cursor: 'pointer' }}
                          onClick={() => setAstronautaSelecionado(item)}
                        >
                          🛸 {item.nome}
                        </td>
                        {LETRAS_GRUPOS.map((l) => (
                          <td key={l} style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                            {item.grupos?.[l]
                              ? `1º: ${item.grupos[l][0]} / 2º: ${item.grupos[l][1]}`
                              : '-'}
                          </td>
                        ))}
                        <td style={{ fontSize: '0.8rem', color: '#aaa' }}>
                          {new Date(item.createdAt).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal de detalhes */}
      {astronautaSelecionado && (
        <DetalhesAstronauta
          palpite={astronautaSelecionado}
          onFechar={() => setAstronautaSelecionado(null)}
        />
      )}
    </section>
  );
}
