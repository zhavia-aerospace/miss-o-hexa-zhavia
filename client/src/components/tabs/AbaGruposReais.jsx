import { useEffect, useState } from 'react';
import { getGruposReais } from '../../services/api.js';

const CLASSIFICADOS_3OS = 8;

export default function AbaGruposReais() {
  const [grupos, setGrupos] = useState([]);
  const [terceiros, setTerceiros] = useState([]);
  const [mataMata, setMataMata] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    getGruposReais()
      .then((res) => {
        setGrupos(res.data?.grupos ?? []);
        setTerceiros(res.data?.terceiros ?? []);
        setMataMata(res.data?.mataMata ?? []);
      })
      .catch(() => setErro('❌ Falha ao buscar a tabela real da Copa.'))
      .finally(() => setCarregando(false));
  }, []);

  const nomesClassificados3os = new Set(
    terceiros.slice(0, CLASSIFICADOS_3OS).map((t) => t.time.nome)
  );

  function corPosicao(posicao, nomeTime) {
    if (posicao === 1 || posicao === 2) return 'var(--nebula-green)';
    if (posicao === 3) return nomesClassificados3os.has(nomeTime) ? 'var(--galaxy-gold)' : '#666';
    return '#666';
  }

  return (
    <section className="tab-content">
      
      {/* CSS DO NOVO CARD DO MATA-MATA */}
      <style>{`
        /* NOVO: Container Flex para centralizar os itens que sobram na linha de baixo */
        .matches-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
        }

        .real-match-card {
          flex: 0 1 320px; /* Mantém o card com largura fixa e alinhado */
          width: 100%;
          background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
          border: 1px solid #334155;
          border-radius: 10px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          position: relative;
        }

        .real-match-card.finished {
          border-color: rgba(74, 222, 128, 0.4);
          box-shadow: 0 4px 15px -3px rgba(74, 222, 128, 0.15);
        }

        .real-match-card:hover {
          transform: translateY(-3px);
          border-color: var(--cosmic-blue, #3b82f6);
          box-shadow: 0 8px 20px -5px rgba(59, 130, 246, 0.3);
        }

        .match-origin-badge {
          background-color: rgba(15, 23, 42, 0.8);
          color: var(--galaxy-gold, #fbbf24);
          font-size: 0.65rem;
          text-align: center;
          padding: 6px 0;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          border-bottom: 1px solid #334155;
          font-weight: 700;
        }

        .team-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #e2e8f0;
          transition: background-color 0.2s;
        }

        .team-row.winner {
          background-color: rgba(74, 222, 128, 0.1);
          color: var(--nebula-green, #4ade80);
          font-weight: 700;
        }

        .team-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .team-flag {
          width: 22px;
          height: 15px;
          border-radius: 2px;
          object-fit: cover;
          box-shadow: 0 1px 3px rgba(0,0,0,0.6);
        }

        @keyframes pulseSearch {
          0% { opacity: 0.3; background-color: #334155; }
          50% { opacity: 0.8; background-color: #475569; }
          100% { opacity: 0.3; background-color: #334155; }
        }

        .pulsing-flag {
          background-color: #334155;
          animation: pulseSearch 2s infinite ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 0.6rem;
          font-weight: bold;
        }

        .match-divider {
          height: 1px;
          background-color: rgba(51, 65, 85, 0.5);
          margin: 0;
        }
        
        .empty-team {
          color: #64748b;
          font-style: italic;
          font-size: 0.85rem;
        }

        .score-info {
          font-family: monospace;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>

      {/* === FASE DE GRUPOS === */}
      <div className="cosmic-panel">
        <h2>📊 Fase de Grupos — Tabela Real</h2>
        <p style={{ color: '#aaa', marginBottom: 20 }}>
          Classificação real da Copa do Mundo, atualizada direto da fonte oficial.
        </p>

        {carregando ? (
          <div style={{ padding: '20px 0' }}>
            {/* Título fantasma pulsando */}
            <div style={{ width: '250px', height: '24px', backgroundColor: '#1e293b', borderRadius: '4px', marginBottom: '20px', animation: 'pulseSearch 2s infinite ease-in-out' }} />
            
            {/* Grid com 8 cards fantasmas (Skeletons) */}
            <div className="matches-grid">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="skeleton-card" />
              ))}
            </div>
          </div>
        ) : erro ? (
          <p style={{ color: '#ff6666', textAlign: 'center', padding: 30 }}>{erro}</p>
        ) : grupos.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: 30 }}>Nenhum dado disponível ainda.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: 20 }}>
            {grupos.map((g) => (
              <div key={g.grupo} style={{ border: '1px solid rgba(0,102,255,0.2)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ background: 'rgba(0,102,255,0.1)', padding: '10px 14px' }}>
                  <strong style={{ color: 'var(--galaxy-gold)' }}>Grupo {g.grupo}</strong>
                </div>
                <div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#888' }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left' }}>#</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left' }}>Seleção</th>
                        <th style={{ padding: '8px 6px' }}>P</th>
                        <th style={{ padding: '8px 6px' }}>J</th>
                        <th style={{ padding: '8px 6px' }}>V</th>
                        <th style={{ padding: '8px 6px' }}>E</th>
                        <th style={{ padding: '8px 6px' }}>D</th>
                        <th style={{ padding: '8px 6px' }}>SG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.tabela.map((linha) => (
                        <tr key={linha.time.nome} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 'bold', color: corPosicao(linha.posicao, linha.time.nome) }}>{linha.posicao}º</td>
                          <td style={{ padding: '8px 10px', color: '#fff', whiteSpace: 'nowrap' }}>
                            {linha.time.escudo && <img src={linha.time.escudo} alt="" style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} />}
                            {linha.time.nome}
                          </td>
                          <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 'bold', color: '#fff' }}>{linha.pontos}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'center', color: '#aaa' }}>{linha.jogos}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'center', color: '#aaa' }}>{linha.vitorias}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'center', color: '#aaa' }}>{linha.empates}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'center', color: '#aaa' }}>{linha.derrotas}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'center', color: '#aaa' }}>{linha.saldoGols}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === RANKING TERCEIROS === */}
      {!carregando && !erro && terceiros.length > 0 && (
        <div className="cosmic-panel">
          <h2>🏆 Ranking dos 3º Colocados</h2>
          <p style={{ color: '#aaa', marginBottom: 20 }}>
            Os {CLASSIFICADOS_3OS} melhores terceiros colocados garantem vaga na fase de mata-mata.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>RNK</th>
                  <th>Seleção</th>
                  <th>Grupo</th>
                  <th>PTS</th>
                  <th>SG</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {terceiros.map((t, i) => (
                  <tr key={t.grupo}>
                    <td style={{ fontWeight: 'bold', color: 'var(--galaxy-gold)' }}>{i + 1}º</td>
                    <td style={{ fontWeight: 'bold', color: '#fff' }}>
                      {t.time.escudo && <img src={t.time.escudo} alt="" style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} />}
                      {t.time.nome}
                    </td>
                    <td>Grupo {t.grupo}</td>
                    <td>{t.pontos}</td>
                    <td>{t.saldoGols}</td>
                    <td>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: 12,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          background: i < CLASSIFICADOS_3OS ? 'rgba(0,255,102,0.15)' : 'rgba(255,51,51,0.15)',
                          color: i < CLASSIFICADOS_3OS ? 'var(--nebula-green)' : '#ff5555',
                        }}
                      >
                        {i < CLASSIFICADOS_3OS ? 'CLASSIFICADO' : 'ELIMINADO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === CHAVEAMENTO REAL DO MATA-MATA (REFORMULADO E CENTRALIZADO) === */}
      {!carregando && !erro && mataMata.length > 0 && (
        <div className="cosmic-panel">
          <h2>⚔️ Chaveamento Real do Mata-Mata</h2>
          <p style={{ color: '#aaa', marginBottom: 20 }}>
            Confrontos reais da Copa, atualizados conforme a fase de grupos definir os classificados.
          </p>

          {mataMata.map(({ fase, jogos }) => (
            <div key={fase} style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <h3 style={{ margin: 0, color: 'var(--galaxy-gold)', fontSize: '1.2rem', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  {fase}
                </h3>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(251,191,36,0.5) 0%, transparent 100%)' }} />
              </div>
              
              {/* === AQUI MUDAMOS PARA O NOSSO NOVO CONTAINER CENTRALIZADO === */}
              <div className="matches-grid">
                {jogos.map((jogo, index) => {
                  const homeNome = jogo.home?.nome;
                  const awayNome = jogo.away?.nome;
                  const isFinished = !!jogo.vencedor;
                  const venceuHome = isFinished && jogo.vencedor === homeNome;
                  const venceuAway = isFinished && jogo.vencedor === awayNome;

                  return (
                    <div key={jogo.id} className={`real-match-card ${isFinished ? 'finished' : ''}`}>
                      <div className="match-origin-badge">
                        CONFRONTO {index + 1}
                      </div>
                      
                      <div className={`team-row ${venceuHome ? 'winner' : ''}`}>
                        <div className="team-info">
                          {jogo.home?.escudo ? (
                            <img src={jogo.home.escudo} alt={homeNome} className="team-flag" />
                          ) : (
                            <div className="team-flag pulsing-flag">?</div>
                          )}
                          <span className={!homeNome ? 'empty-team' : ''}>{homeNome ?? 'Vaga em aberto'}</span>
                        </div>
                        <div className="score-info">
                          {jogo.placarHome ?? '-'}
                          {venceuHome && '🏆'}
                        </div>
                      </div>
                      
                      <div className="match-divider" />
                      
                      <div className={`team-row ${venceuAway ? 'winner' : ''}`}>
                        <div className="team-info">
                          {jogo.away?.escudo ? (
                            <img src={jogo.away.escudo} alt={awayNome} className="team-flag" />
                          ) : (
                            <div className="team-flag pulsing-flag">?</div>
                          )}
                          <span className={!awayNome ? 'empty-team' : ''}>{awayNome ?? 'Vaga em aberto'}</span>
                        </div>
                        <div className="score-info">
                          {jogo.placarAway ?? '-'}
                          {venceuAway && '🏆'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}