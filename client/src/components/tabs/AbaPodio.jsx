import { useEffect, useState } from 'react';
import { timesPodio } from '../../data/times.js';
import { postPodio } from '../../services/api.js';
import { useAlerta } from '../../context/AlertContext.jsx';

const JA_ENVIOU_PODIO_KEY = 'bolao_podio_enviado';

export default function AbaPodio() {
  const { mostrarAlerta } = useAlerta();
  const [podioLiberado, setPodioLiberado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState('');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [p3, setP3] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [msgEnvio, setMsgEnvio] = useState('');

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL ?? '') + '/api/gabarito')
      .then((r) => r.json())
      .then((d) => setPodioLiberado(d.podioLiberado === true))
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  async function enviarPodio() {
    if (localStorage.getItem(JA_ENVIOU_PODIO_KEY) === 'true') {
      mostrarAlerta('Sua telemetria de campeões já foi transmitida!', '🛰️ Pódio Já Registrado');
      return;
    }
    if (!nome.trim()) {
      mostrarAlerta('Identifique-se com seu nome de astronauta!', '🛸 Identificação Necessária');
      return;
    }
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
      await postPodio(nome.trim(), p1, p2, p3);
      localStorage.setItem(JA_ENVIOU_PODIO_KEY, 'true');
      setMsgEnvio(`👑 Sucesso! O pódio do astronauta ${nome.trim()} foi eternizado!`);
      setNome('');
      setP1('');
      setP2('');
      setP3('');
    } catch (err) {
      setMsgEnvio(`❌ ${err.message}`);
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
      ) : (
        <div className="cosmic-panel" style={{ borderColor: 'var(--galaxy-gold)' }}>
          <h2>👑 Configuração do Pódio Supremo</h2>
          <p style={{ color: '#aaa', marginBottom: 20 }}>Aponte quem terminará no topo imperial do campeonato:</p>

          <div className="user-identity" style={{ marginBottom: 25 }}>
            <label htmlFor="username-podio">Nome do Astronauta:</label>
            <input
              id="username-podio"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome completo"
              autoComplete="off"
            />
          </div>

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
                  {timesPodio
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
