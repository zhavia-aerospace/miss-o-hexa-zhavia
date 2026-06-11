import { useEffect, useState } from 'react';
import { getJogos } from '../services/api.js';

const BASE = import.meta.env.VITE_API_URL ?? '';
const POLL_INTERVAL = 15 * 60 * 1000; // sincronizado com cache do servidor

export default function PainelLateralJogos() {
  const [aberto, setAberto] = useState(false);
  const [jogos, setJogos] = useState([]);
  const [subAba, setSubAba] = useState('live');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');

  useEffect(() => {
    fetch(`${BASE}/api/gabarito`)
      .then((r) => r.json())
      .then((g) => setYoutubeVideoId(g.youtubeVideoId ?? ''))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const carregar = () => getJogos().then((r) => setJogos(r.data ?? [])).catch(() => {});
    carregar();
    const id = setInterval(carregar, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const jogosOrdenados = [...jogos].sort(
    (a, b) => new Date(a.fixture.date) - new Date(b.fixture.date)
  );

  const jogosFiltrados = jogosOrdenados.filter(({ fixture }) => {
    const s = fixture.status.short;
    if (subAba === 'live') return ['1H', '2H', 'HT', 'ET', 'P', 'NS'].includes(s);
    return s === 'FT';
  });

  return (
    <aside
      id="painel-lateral-jogos"
      className={`cosmic-panel ${aberto ? 'painel-lateral-expandido' : 'painel-lateral-oculto'}`}
    >
      {aberto ? (
        <>
          <div className="cabecalho-radar">
            <h3 className="titulo-radar">
              <span className="radar-ping" />
              🎥 Central de Transmissão
            </h3>
            <button className="switch-btn-espacial" onClick={() => setAberto(false)}>
              <span className="switch-icon">🛰️</span> Ocultar
            </button>
          </div>

          <div>
            {/* Player YouTube */}
            <div style={{ marginBottom: 20 }}>
              {youtubeVideoId ? (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 6, border: '1px solid #1c233a' }}>
                  <iframe
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="Transmissão ao vivo"
                  />
                </div>
              ) : (
                <a
                  href="https://www.youtube.com/@CazeTV/live"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#ff0000', color: '#fff', fontWeight: 'bold', fontSize: '0.95rem', padding: '14px', borderRadius: 8, textDecoration: 'none', border: 'none' }}
                >
                  📺 Assistir ao Vivo — CazéTV
                </a>
              )}
            </div>

            <hr style={{ border: 0, borderTop: '1px solid rgba(0,102,255,0.2)', margin: '15px 0' }} />

            <h3 style={{ color: 'var(--nebula-green)', fontSize: '1.05rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              ⚽ Placar Orbital Live
            </h3>

            {/* Sub-abas */}
            <div style={{ display: 'flex', gap: 5, marginBottom: 12, borderBottom: '1px solid rgba(0,102,255,0.2)', paddingBottom: 8 }}>
              {['live', 'hist'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSubAba(tab)}
                  style={{
                    flex: 1,
                    background: subAba === tab ? 'var(--cosmic-blue)' : 'rgba(255,255,255,0.05)',
                    border: subAba === tab ? 'none' : '1px solid #222',
                    color: subAba === tab ? '#fff' : '#aaa',
                    padding: 6,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  {tab === 'live' ? 'AO VIVO / HOJE' : 'RESULTADOS'}
                </button>
              ))}
            </div>

            {/* Lista de jogos */}
            <div style={{ maxHeight: subAba === 'hist' ? 250 : 'none', overflowY: 'auto' }}>
              {jogosFiltrados.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', fontSize: '0.8rem', padding: 10 }}>
                  {subAba === 'live' ? 'Nenhum jogo rolando ou agendado para hoje.' : 'Nenhum resultado computado ainda.'}
                </p>
              ) : (
                jogosFiltrados.map(({ fixture, teams, goals }) => {
                  const s = fixture.status.short;
                  const ehLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(s);
                  const tempo = ehLive
                    ? `LIVE • ${fixture.status.elapsed}'`
                    : s === 'FT'
                    ? 'Encerrado'
                    : new Date(fixture.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
                  const cor = ehLive ? 'var(--nebula-green)' : s === 'FT' ? '#667099' : '#aaa';

                  return (
                    <div key={fixture.id} style={{ background: 'rgba(0,0,0,0.4)', padding: 10, borderRadius: 6, border: '1px solid rgba(255,255,255,0.03)', marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 'bold', color: cor }}>
                        <span>🎯 {fixture.status.long}</span>
                        <span>{tempo}</span>
                      </div>
                      {[{ t: teams.home, g: goals.home }, { t: teams.away, g: goals.away }].map(({ t, g }) => (
                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span style={{ color: '#fff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <img src={t.logo} alt="" style={{ width: 14, height: 14 }} /> {t.name}
                          </span>
                          <strong style={{ color: 'var(--galaxy-gold)', fontSize: '1rem' }}>{g ?? '-'}</strong>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      ) : (
        <div
          id="radar-minimizado-trigger"
          onClick={() => setAberto(true)}
          style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <div className="sonar-wrapper">
            <div className="sonar-wave" />
            <span className="radar-icon-mini">📺</span>
          </div>
        </div>
      )}
    </aside>
  );
}
