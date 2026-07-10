import { useEffect, useState } from 'react';
import { getJogos, getGruposReais } from '../services/api.js'; // <-- Importamos getGruposReais

const BASE = import.meta.env.VITE_API_URL ?? '';
const POLL_INTERVAL = 15 * 60 * 1000;

// 1. DICIONÁRIO DE TRADUÇÃO DAS 48 SELEÇÕES DA SUPERCOPA ZHAVIA
const TRADUCOES_FRONT = {
  // AMÉRICAS
  "Canada": "Canadá", "United States": "Estados Unidos", "USA": "Estados Unidos", "Mexico": "México", "Argentina": "Argentina", "Brazil": "Brasil", "Colombia": "Colômbia", "Ecuador": "Equador", "Paraguay": "Paraguai", "Uruguay": "Uruguai", "Curaçao": "Curaçau", "Curacao": "Curaçau", "Haiti": "Haiti", "Panama": "Panamá",
  // EUROPA
  "Germany": "Alemanha", "Austria": "Áustria", "Belgium": "Bélgica", "Bosnia-Herzegovina": "Bósnia e Herzegovina", "Bosnia and Herzegovina": "Bósnia e Herzegovina", "Croatia": "Croácia", "Scotland": "Escócia", "Spain": "Espanha", "France": "França", "Netherlands": "Holanda", "Holland": "Holanda", "England": "Inglaterra", "Norway": "Noruega", "Portugal": "Portugal", "Czech Republic": "República Tcheca", "Czechia": "República Tcheca", "Sweden": "Suécia", "Switzerland": "Suíça", "Turkey": "Turquia", "Türkiye": "Turquia",
  // ÁFRICA
  "South Africa": "África do Sul", "Algeria": "Argélia", "Cape Verde": "Cabo Verde", "Cape Verde Islands": "Cabo Verde", "Ivory Coast": "Costa do Marfim", "Côte d'Ivoire": "Costa do Marfim", "Egypt": "Egito", "Ghana": "Gana", "Morocco": "Marrocos", "Congo DR": "RD Congo", "DR Congo": "RD Congo", "Democratic Republic of the Congo": "RD Congo", "Senegal": "Senegal", "Tunisia": "Tunísia",
  // ÁSIA E OCEANIA
  "Saudi Arabia": "Arábia Saudita", "Australia": "Austrália", "Qatar": "Catar", "South Korea": "Coreia do Sul", "Korea Republic": "Coreia do Sul", "Iran": "Irã", "Iraq": "Iraque", "Japan": "Japão", "Jordan": "Jordânia", "Uzbekistan": "Uzbequistão", "New Zealand": "Nova Zelândia"
};

function traduzir(nomeIngles) {
  return TRADUCOES_FRONT[nomeIngles] || nomeIngles;
}

export default function PainelLateralJogos() {
  const [aberto, setAberto] = useState(false);
  const [jogos, setJogos] = useState([]);
  const [mataMata, setMataMata] = useState([]); // <-- Guarda os dados reais do chaveamento
  const [subAba, setSubAba] = useState('live');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');

  useEffect(() => {
    fetch(`${BASE}/api/gabarito`)
      .then((r) => r.json())
      .then((g) => setYoutubeVideoId(g.youtubeVideoId ?? ''))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const carregar = async () => {
      try {
        // 1. Puxa os jogos brutos da API para a barra lateral
        const resJogos = await getJogos();
        setJogos(resJogos.data ?? []);

        // 2. Puxa a tabela do chaveamento real para cruzarmos os dados dos pênaltis
        const resGrupos = await getGruposReais();
        if (resGrupos.data && resGrupos.data.mataMata) {
          const todosMataMata = resGrupos.data.mataMata.flatMap(f => f.jogos).map(jogo => {
            // Vacina de segurança para alinhar com o front principal
            if (jogo.home?.nome === 'Austrália' && jogo.away?.nome === 'Egito') {
              return { ...jogo, placarHome: 1, placarAway: 1, penaltisHome: 2, penaltisAway: 4 };
            }
            return jogo;
          });
          setMataMata(todosMataMata);
        }
      } catch (e) {}
    };

    carregar();
    const id = setInterval(carregar, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const jogosOrdenados = [...jogos].sort((a, b) => {
    if (subAba === 'hist') return new Date(b.fixture.date) - new Date(a.fixture.date);
    return new Date(a.fixture.date) - new Date(b.fixture.date);
  });

  const jogosFiltrados = jogosOrdenados.filter(({ fixture }) => {
    const s = fixture.status.short;
    if (subAba === 'live') return ['1H', '2H', 'HT', 'ET', 'P', 'NS'].includes(s);
    return ['FT', 'AET', 'PEN'].includes(s);
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
            
            <div className="lista-jogos-lateral">
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
                    : ['FT', 'AET', 'PEN'].includes(s)
                    ? 'Encerrado'
                    : new Date(fixture.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
                  const cor = ehLive ? 'var(--nebula-green)' : ['FT', 'AET', 'PEN'].includes(s) ? '#667099' : '#aaa';

                  // ========================================================
                  // SOLUÇÃO: Cruzamento de Dados (Barra Lateral x Chaveamento)
                  // ========================================================
                  const homeTr = traduzir(teams.home.name);
                  const awayTr = traduzir(teams.away.name);

                  // Busca esse exato jogo na nossa base de dados do Chaveamento Real
                  const jogoBracket = mataMata.find(j => 
                    (j.home?.nome === homeTr && j.away?.nome === awayTr) ||
                    (j.home?.nome === awayTr && j.away?.nome === homeTr)
                  );

                  const getPlacarFinal = (isHome) => {
                    const timeAtualTr = isHome ? homeTr : awayTr;
                    const golBruto = isHome ? goals?.home : goals?.away;

                    // Se encontrou o jogo no chaveamento e ele foi para os pênaltis
                    if (jogoBracket && jogoBracket.penaltisHome != null && jogoBracket.penaltisAway != null) {
                      const ehCasaNoBracket = jogoBracket.home?.nome === timeAtualTr;
                      
                      // Extrai o placar limpo (tempo normal) e os pênaltis separados
                      const placarNormal = ehCasaNoBracket ? jogoBracket.placarHome : jogoBracket.placarAway;
                      const penaltis = ehCasaNoBracket ? jogoBracket.penaltisHome : jogoBracket.penaltisAway;
                      
                      return { placar: placarNormal, pen: penaltis };
                    }

                    // Se não for jogo de mata-mata ou não teve pênaltis, usa o gol normal da API
                    return { placar: golBruto, pen: null };
                  };

                  const homeScore = getPlacarFinal(true);
                  const awayScore = getPlacarFinal(false);

                  return (
                    <div key={fixture.id} style={{ background: 'rgba(0,0,0,0.4)', padding: 10, borderRadius: 6, border: '1px solid rgba(255,255,255,0.03)', marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 'bold', color: cor }}>
                        <span>🎯 {fixture.status.long}</span>
                        <span>{tempo}</span>
                      </div>
                      {[
                        { t: teams.home, ...homeScore },
                        { t: teams.away, ...awayScore }
                      ].map(({ t, placar, pen }) => (
                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span style={{ color: '#fff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <img src={t.logo} alt="" style={{ width: 14, height: 14 }} /> {traduzir(t.name)}
                          </span>
                          <strong style={{ color: 'var(--galaxy-gold)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {placar ?? '-'}
                            {pen !== null && pen !== undefined && (
                              <span style={{ 
                                fontSize: '0.85rem', 
                                color: '#ffffff', /* Branco puro para dar contraste com o dourado */
                                fontWeight: 'normal'
                              }}>
                                ({pen})
                              </span>
                            )}
                          </strong>
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