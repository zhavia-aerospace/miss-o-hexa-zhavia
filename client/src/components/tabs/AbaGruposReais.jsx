import { useEffect, useState } from 'react';
import { getGruposReais } from '../../services/api.js';

const CLASSIFICADOS_3OS = 8;

function preencher(jogos, inicio, fim) {
  return Array.from({ length: fim - inicio }, (_, i) => jogos[inicio + i]);
}

// === CARD DE JOGO REAL ===
function RealMatchCard({ jogo, isFinal }) {
  if (!jogo) return <div className="match-card empty" style={{ opacity: 0.3 }}>A definir</div>;

  const homeNome = jogo.home?.nome;
  const awayNome = jogo.away?.nome;
  const venceuHome = jogo.vencedor && jogo.vencedor === homeNome;
  const venceuAway = jogo.vencedor && jogo.vencedor === awayNome;
  const temPenaltis = jogo.penaltisHome != null || jogo.penaltisAway != null;

  return (
    <div className={`match-card ${isFinal ? 'final-card' : ''}`}>
      <div className={`player-row ${venceuHome ? 'winner' : ''}`}>
        <span className="player-name" title={homeNome}>
          {jogo.home?.escudo && <img src={jogo.home.escudo} alt="" style={{ width: 12, height: 12, marginRight: 4, verticalAlign: 'middle' }} />}
          {homeNome ?? 'A definir...'}
        </span>
        <span>{jogo.placarHome ?? ''}{venceuHome && ' 🏆'}</span>
      </div>
      <div className="divider" style={isFinal ? { backgroundColor: 'rgba(251, 191, 36, 0.2)' } : {}}></div>
      <div className={`player-row ${venceuAway ? 'winner' : ''}`}>
        <span className="player-name" title={awayNome}>
          {jogo.away?.escudo && <img src={jogo.away.escudo} alt="" style={{ width: 12, height: 12, marginRight: 4, verticalAlign: 'middle' }} />}
          {awayNome ?? 'A definir...'}
        </span>
        <span>{jogo.placarAway ?? ''}{venceuAway && ' 🏆'}</span>
      </div>
      {temPenaltis && (
        <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--galaxy-gold)', marginTop: 4, fontWeight: 'bold' }}>
          🥅 Pênaltis: {jogo.penaltisHome ?? 0} x {jogo.penaltisAway ?? 0}
        </div>
      )}
    </div>
  );
}

// === CÉLULA DO CHAVEAMENTO REAL (mesma mecânica de linhas da aba Confrontos) ===
function RealBracketCell({ jogo, side, phase, index, totalItems }) {
  const isLeft = side === 'left';
  const isRight = side === 'right';
  const isCenter = side === 'center';

  const hasParents = phase !== 'Rodada de 32';
  const hasChildren = phase !== 'Final';
  const needsVertical = hasChildren && totalItems > 1;

  const colorOff = 'rgba(96, 165, 250, 0.25)';
  const colorOn = 'var(--galaxy-gold, #fbbf24)';

  const outGold = jogo?.vencedor ? colorOn : colorOff;
  const inGold = (jogo?.home?.nome || jogo?.away?.nome) ? colorOn : colorOff;

  return (
    <div className="bracket-cell">
      {hasParents && isLeft && <div className="line-h line-in-left" style={{ backgroundColor: inGold }}></div>}
      {hasParents && isRight && <div className="line-h line-in-right" style={{ backgroundColor: inGold }}></div>}
      {isCenter && (
        <>
          <div className="line-h line-in-left" style={{ backgroundColor: jogo?.home?.nome ? colorOn : colorOff }}></div>
          <div className="line-h line-in-right" style={{ backgroundColor: jogo?.away?.nome ? colorOn : colorOff }}></div>
        </>
      )}

      <div style={{ position: 'relative', width: '100%', zIndex: 10 }}>
        {isCenter && (
          <div className="floating-trophy-large">
            {jogo?.vencedor && <div className="champion-label">⭐ {jogo.vencedor} ⭐</div>}
            🏆
          </div>
        )}
        <RealMatchCard jogo={jogo} isFinal={isCenter} />
      </div>

      {hasChildren && isLeft && (
        <>
          <div className="line-h line-out-right" style={{ backgroundColor: outGold }}></div>
          {needsVertical && index % 2 === 0 && <div className="line-v line-v-down-right" style={{ backgroundColor: outGold }}></div>}
          {needsVertical && index % 2 === 1 && <div className="line-v line-v-up-right" style={{ backgroundColor: outGold }}></div>}
        </>
      )}
      {hasChildren && isRight && (
        <>
          <div className="line-h line-out-left" style={{ backgroundColor: outGold }}></div>
          {needsVertical && index % 2 === 0 && <div className="line-v line-v-down-left" style={{ backgroundColor: outGold }}></div>}
          {needsVertical && index % 2 === 1 && <div className="line-v line-v-up-left" style={{ backgroundColor: outGold }}></div>}
        </>
      )}
    </div>
  );
}

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

  const porFase = Object.fromEntries(mataMata.map((f) => [f.fase, f.jogos]));
  const rodada32 = porFase['Rodada de 32'] ?? [];
  const oitavas = porFase['Oitavas de Final'] ?? [];
  const quartas = porFase['Quartas de Final'] ?? [];
  const semifinal = porFase['Semifinal'] ?? [];
  const terceiroLugar = porFase['Disputa de 3º Lugar']?.[0];
  const final = porFase['Final']?.[0];

  return (
    <section className="tab-content">

      {/* === CHAVEAMENTO REAL DO MATA-MATA === */}
      {!carregando && !erro && rodada32.length > 0 && (
        <>
          <h2 style={{ padding: '0 20px' }}>⚔️ Chaveamento Real do Mata-Mata</h2>
          <p style={{ color: '#aaa', marginBottom: 10, padding: '0 20px' }}>
            Confrontos reais da Copa, atualizados conforme a fase de grupos definir os classificados.
          </p>

          <div className="bracket-full-width-container">
            <div className="bracket-wrapper">
              <div className="bracket-column">
                <div className="column-title">Rodada de 32</div>
                {preencher(rodada32, 0, 8).map((jogo, i) => <RealBracketCell key={`l-32-${i}`} jogo={jogo} side="left" phase="Rodada de 32" index={i} totalItems={8} />)}
              </div>
              <div className="bracket-column">
                <div className="column-title">Oitavas</div>
                {preencher(oitavas, 0, 4).map((jogo, i) => <RealBracketCell key={`l-oit-${i}`} jogo={jogo} side="left" phase="Oitavas" index={i} totalItems={4} />)}
              </div>
              <div className="bracket-column">
                <div className="column-title">Quartas</div>
                {preencher(quartas, 0, 2).map((jogo, i) => <RealBracketCell key={`l-qua-${i}`} jogo={jogo} side="left" phase="Quartas" index={i} totalItems={2} />)}
              </div>
              <div className="bracket-column">
                <div className="column-title">Semifinal</div>
                {preencher(semifinal, 0, 1).map((jogo, i) => <RealBracketCell key={`l-sem-${i}`} jogo={jogo} side="left" phase="Semifinal" index={i} totalItems={1} />)}
              </div>

              <div className="bracket-column" style={{ flex: 1.2 }}>
                <div className="column-title" style={{ color: 'var(--galaxy-gold, #fbbf24)', textShadow: '0 0 10px rgba(251, 191, 36, 0.4)' }}>Grande Final</div>
                <RealBracketCell jogo={final} side="center" phase="Final" index={0} totalItems={1} />
              </div>

              <div className="bracket-column">
                <div className="column-title">Semifinal</div>
                {preencher(semifinal, 1, 2).map((jogo, i) => <RealBracketCell key={`r-sem-${i}`} jogo={jogo} side="right" phase="Semifinal" index={i} totalItems={1} />)}
              </div>
              <div className="bracket-column">
                <div className="column-title">Quartas</div>
                {preencher(quartas, 2, 4).map((jogo, i) => <RealBracketCell key={`r-qua-${i}`} jogo={jogo} side="right" phase="Quartas" index={i} totalItems={2} />)}
              </div>
              <div className="bracket-column">
                <div className="column-title">Oitavas</div>
                {preencher(oitavas, 4, 8).map((jogo, i) => <RealBracketCell key={`r-oit-${i}`} jogo={jogo} side="right" phase="Oitavas" index={i} totalItems={4} />)}
              </div>
              <div className="bracket-column">
                <div className="column-title">Rodada de 32</div>
                {preencher(rodada32, 8, 16).map((jogo, i) => <RealBracketCell key={`r-32-${i}`} jogo={jogo} side="right" phase="Rodada de 32" index={i} totalItems={8} />)}
              </div>
            </div>
          </div>

          {terceiroLugar && (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 30px' }}>
              <div style={{ width: 220 }}>
                <div className="column-title">🥉 Disputa de 3º Lugar</div>
                <RealMatchCard jogo={terceiroLugar} />
              </div>
            </div>
          )}
        </>
      )}

      {/* === FASE DE GRUPOS === */}
      <div className="cosmic-panel">
        <h2>📊 Fase de Grupos — Tabela Real</h2>
        <p style={{ color: '#aaa', marginBottom: 20 }}>
          Classificação real da Copa do Mundo, atualizada direto da fonte oficial.
        </p>

        {carregando ? (
          <div style={{ padding: '20px 0' }}>
            <div style={{ width: '250px', height: '24px', backgroundColor: '#1e293b', borderRadius: '4px', marginBottom: '20px' }} />
            <div className="grid-grupos-bolao">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="skeleton-card" style={{ height: '220px' }} />
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
    </section>
  );
}
