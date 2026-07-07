import { useEffect, useState } from 'react';
import { getRanking, getPalpites, getPodios } from '../../services/api.js';
import AvatarNome from '../AvatarNome.jsx';
import DetalhesAstronauta from '../DetalhesAstronauta.jsx';

// ==========================================
// COMPONENTE: CONTADOR ESTELAR (Animação fluida)
// ==========================================
const AnimatedNumber = ({ endValue }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1000; // 1 segundo de animação

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Curva matemática (easeOut) para o número "frear" ao chegar perto do valor final
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeOut * endValue));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [endValue]);

  return <>{count}</>;
};

export default function AbaRanking({ meuNome }) {
  const [ranking, setRanking] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [palpites, setPalpites] = useState([]);
  const [podios, setPodios] = useState([]);
  const [astronautaSelecionado, setAstronautaSelecionado] = useState(null);
  const [podioSelecionado, setPodioSelecionado] = useState(null);

  useEffect(() => {
    getRanking()
      .then(setRanking)
      .catch(() => setErro('❌ Falha na conexão com o satélite de pontuação.'))
      .finally(() => setCarregando(false));
    getPalpites().then(setPalpites).catch(() => {});
    getPodios().then(setPodios).catch(() => {});
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

  function abrirTelemetria(nomeAstronauta) {
    const nomeNorm = nomeAstronauta.trim().toLowerCase();
    const palpite = palpites.find((p) => p.nome.trim().toLowerCase() === nomeNorm);
    if (palpite) {
      setAstronautaSelecionado(palpite);
      setPodioSelecionado(podios.find((p) => p.nome.trim().toLowerCase() === nomeNorm) ?? null);
    }
  }

  const CLASSE_PODIO = { 1: 'podio-1', 2: 'podio-2', 3: 'podio-3' };

  return (
    <section className="tab-content">
      <div className="cosmic-panel">
        <h2>🏆 Painel de Liderança</h2>
        <p style={{ color: '#aaa', marginBottom: 20 }}>
          Acompanhe as pontuações. Os dados são recalculados a cada atualização de gabarito na base!
        </p>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #222', textAlign: 'left' }}>
                <th style={{ padding: '12px 8px', color: 'var(--galaxy-gold)', fontSize: '1rem', width: '15%' }}>Posição 🪐</th>
                <th style={{ padding: '12px 8px', color: '#fff', fontSize: '1rem', width: '55%' }}>Astronauta 🛸</th>
                <th style={{ padding: '12px 8px', color: 'var(--nebula-green)', fontSize: '1rem', width: '30%', textAlign: 'right' }}>Pontuação Total 🏆</th>
              </tr>
            </thead>
              <tbody>
              {carregando && (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>Sincronizando com os satélites de pontuação...</td></tr>
              )}
              {!carregando && erro && (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#ff3333' }}>{erro}</td></tr>
              )}
              {!carregando && !erro && ranking.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>🛸 Aguardando computação de pontos na base...</td></tr>
              )}
              {!carregando && !erro && ranking.map((item) => {
                
                // === DESTAQUE DA NAVE: Verifica se a linha atual é a do próprio usuário ===
                const isMe = meuNome && item.astronauta.trim().toLowerCase() === meuNome.trim().toLowerCase();

                return (
  <tr
    key={item._id}
    className={`ranking-row-clicavel ${CLASSE_PODIO[item.posicao] ?? ''}`}
    style={{ 
      borderBottom: '1px solid #222', 
      cursor: palpites.some((p) => p.nome.trim().toLowerCase() === item.astronauta.trim().toLowerCase()) ? 'pointer' : 'default',
      background: isMe ? 'rgba(0, 255, 102, 0.05)' : 'transparent'
    }}
    onClick={() => abrirTelemetria(item.astronauta)}
  >
    {/* VERSÃO DEFINITIVA: Apenas a barra lateral de 4px, sem caixotes, filtros ou sombras */}
    <td 
      className="posicao-num" 
      style={{ 
        padding: '14px 8px', 
        fontWeight: 'bold', 
        color: 'var(--galaxy-gold)', 
        fontSize: '1.1rem',
        borderLeft: isMe ? '4px solid var(--nebula-green)' : ''
      }}
    >
      {item.posicao}º
    </td>
                    <td style={{ padding: '14px 8px', fontWeight: 'bold', color: isMe ? 'var(--nebula-green)' : '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AvatarNome nome={item.astronauta} size={36} fontSize="0.9rem" />
                        {isMe && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--nebula-green)', border: '1px solid var(--nebula-green)', padding: '2px 6px', borderRadius: '10px', fontWeight: 'normal', opacity: 0.8 }}>
                            Você
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'right', fontWeight: 'bold', color: 'var(--nebula-green)', fontSize: '1.15rem' }}>
                      <AnimatedNumber endValue={item.pontuacao} /> pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {astronautaSelecionado && (
        <DetalhesAstronauta
          palpite={astronautaSelecionado}
          podio={podioSelecionado}
          meuNome={meuNome}
          listaPodios={podios}
          onFechar={() => {
            setAstronautaSelecionado(null);
            setPodioSelecionado(null);
          }}
        />
      )}
    </section>
  );
}