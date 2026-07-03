import { useEffect, useState } from 'react';
import { getGruposReais } from '../../services/api.js';

const CLASSIFICADOS_3OS = 8;

function preencher(jogos, inicio, fim) {
  return Array.from({ length: fim - inicio }, (_, i) => jogos[inicio + i]);
}

// === CARD DE JOGO REAL ===
function RealMatchCard({ jogo, isFinal, isThird }) {
  if (!jogo) return <div className="match-card empty" style={{ opacity: 0.3 }}>A definir</div>;

  const homeNome = jogo.home?.nome;
  const awayNome = jogo.away?.nome;
  const venceuHome = jogo.vencedor && jogo.vencedor === homeNome;
  const venceuAway = jogo.vencedor && jogo.vencedor === awayNome;
  const isDecided = !!jogo.vencedor;

  return (
    <div className={`match-card ${isFinal ? 'final-card' : ''} ${isThird ? 'third-place-card' : ''} ${isDecided ? 'decided-card' : ''}`}>
      {/* TIME DA CASA */}
      <div className={`player-row ${venceuHome ? 'winner' : ''}`}>
        <span className="player-name" title={homeNome ?? 'A definir...'}>
          {jogo.home?.escudo ? (
            <img src={jogo.home.escudo} alt="" style={{ width: 12, height: 12, marginRight: 4, verticalAlign: 'middle' }} />
          ) : (
            <div className="placeholder-flag-blink">?</div>
          )}
          <span style={{ opacity: homeNome ? 1 : 0.6 }}>
            {homeNome ?? 'A definir...'}
          </span>
        </span>
        <span>
          {jogo.placarHome ?? ''}
          {jogo.penaltisHome != null && <span style={{ color: 'var(--galaxy-gold)', fontWeight: 'bold' }}> ({jogo.penaltisHome})</span>}
        </span>
      </div>
      
      <div className="divider" style={isFinal ? { backgroundColor: 'rgba(251, 191, 36, 0.2)' } : {}}></div>
      
      {/* TIME VISITANTE */}
      <div className={`player-row ${venceuAway ? 'winner' : ''}`}>
        <span className="player-name" title={awayNome ?? 'A definir...'}>
          {jogo.away?.escudo ? (
            <img src={jogo.away.escudo} alt="" style={{ width: 12, height: 12, marginRight: 4, verticalAlign: 'middle' }} />
          ) : (
            <div className="placeholder-flag-blink">?</div>
          )}
          <span style={{ opacity: awayNome ? 1 : 0.6 }}>
            {awayNome ?? 'A definir...'}
          </span>
        </span>
        <span>
          {jogo.placarAway ?? ''}
          {jogo.penaltisAway != null && <span style={{ color: 'var(--galaxy-gold)', fontWeight: 'bold' }}> ({jogo.penaltisAway})</span>}
        </span>
      </div>
      
      <div className="match-date-footer">
        📅 {jogo.data
          ? new Date(jogo.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
          : 'Data a confirmar'}
      </div>
    </div>
  );
}

// === CÉLULA DO CHAVEAMENTO REAL ===
function RealBracketCell({ jogo, side, phase, index, totalItems }) {
  const isLeft = side === 'left';
  const isRight = side === 'right';

  const hasParents = phase !== 'Rodada de 32';
  const hasChildren = true;
  const needsVertical = totalItems > 1;

  const colorOff = 'rgba(96, 165, 250, 0.25)';
  const colorOn = 'var(--galaxy-gold, #fbbf24)';

  const outGold = jogo?.vencedor ? colorOn : colorOff;
  const inGold = (jogo?.home?.nome || jogo?.away?.nome) ? colorOn : colorOff;

  return (
    <div className="bracket-cell">
      {hasParents && isLeft && <div className="line-h line-in-left" style={{ backgroundColor: inGold }}></div>}
      {hasParents && isRight && <div className="line-h line-in-right" style={{ backgroundColor: inGold }}></div>}

      <div style={{ position: 'relative', width: '100%', zIndex: 10 }}>
        <RealMatchCard jogo={jogo} isFinal={false} />
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
              
              {/* LADO ESQUERDO */}
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

              {/* COLUNA CENTRAL */}
              <div className="bracket-column" style={{ flex: 1.5, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 20px' }}>
                <div style={{ width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', gap: '50px' }}>
                  <div style={{ position: 'absolute', left: '-20px', top: '85px', bottom: '55px', width: '20px', borderLeft: '2px solid rgba(96, 165, 250, 0.3)', borderTop: '2px solid rgba(96, 165, 250, 0.3)', borderBottom: '2px solid rgba(96, 165, 250, 0.3)', zIndex: 1 }}></div>
                  <div style={{ position: 'absolute', right: '-20px', top: '85px', bottom: '55px', width: '20px', borderRight: '2px solid rgba(96, 165, 250, 0.3)', borderTop: '2px solid rgba(96, 165, 250, 0.3)', borderBottom: '2px solid rgba(96, 165, 250, 0.3)', zIndex: 1 }}></div>

                  {/* FINAL */}
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <div className="floating-trophy-large">
                      {final?.vencedor && <div className="champion-label">⭐ {final.vencedor} ⭐</div>}
                      🏆
                    </div>
                    <div className="column-title" style={{ color: 'var(--galaxy-gold, #fbbf24)', textShadow: '0 0 10px rgba(251, 191, 36, 0.4)' }}>Grande Final</div>
                    <RealMatchCard jogo={final} isFinal={true} />
                  </div>

                  {/* 3º LUGAR */}
                  {terceiroLugar && (
                    <div style={{ position: 'relative', zIndex: 10 }}>
                      <div className="column-title" style={{ color: '#cd7f32', textShadow: '0 0 10px rgba(205, 127, 50, 0.4)' }}>Disputa de 3º Lugar</div>
                      <RealMatchCard jogo={terceiroLugar} isThird={true} />
                    </div>
                  )}
                </div>
              </div>

              {/* LADO DIREITO */}
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
        </>
      )}

      {/* =========================================================
          A MÁGICA ACONTECE AQUI: GRUPOS E TERCEIROS LADO A LADO
          ========================================================= */}
      <div className="container-fase-grupos cosmic-panel" style={{ padding: '20px', background: 'transparent', border: 'none', boxShadow: 'none' }}>
        
        {/* COLUNA ESQUERDA: FASE DE GRUPOS */}
        <div className="coluna-grupos">
          <h2>📊 Fase de Grupos — Tabela Real</h2>
          
          {carregando ? (
            <p>Carregando...</p>
          ) : erro ? (
            <p style={{ color: '#ff6666' }}>{erro}</p>
          ) : grupos.length === 0 ? (
            <p style={{ color: '#888' }}>Nenhum dado disponível ainda.</p>
          ) : (
            <div className="grid-grupos-bolao">
              {grupos.map((g) => (
                <div key={g.grupo} style={{ border: '1px solid rgba(0,102,255,0.2)', borderRadius: 8, overflow: 'hidden', background: 'var(--space-panel)' }}>
                  <div style={{ background: 'rgba(0,102,255,0.1)', padding: '10px 14px' }}>
                    <strong style={{ color: 'var(--galaxy-gold)' }}>Grupo {g.grupo}</strong>
                  </div>
                  <div>
                    <table className="ranking-table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#888' }}>
                          <th>#</th>
                          <th>Seleção</th>
                          <th>P</th>
                          <th>J</th>
                          <th>V</th>
                          <th>E</th>
                          <th>D</th>
                          <th>SG</th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.tabela.map((linha) => (
                          <tr key={linha.time.nome} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ fontWeight: 'bold', color: corPosicao(linha.posicao, linha.time.nome) }}>{linha.posicao}º</td>
                            <td style={{ color: '#fff' }}>
                              {linha.time.escudo && <img src={linha.time.escudo} alt="" style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} />}
                              {linha.time.nome}
                            </td>
                            <td style={{ fontWeight: 'bold', color: '#fff' }}>{linha.pontos}</td>
                            <td style={{ color: '#aaa' }}>{linha.jogos}</td>
                            <td style={{ color: '#aaa' }}>{linha.vitorias}</td>
                            <td style={{ color: '#aaa' }}>{linha.empates}</td>
                            <td style={{ color: '#aaa' }}>{linha.derrotas}</td>
                            <td style={{ color: '#aaa' }}>{linha.saldoGols}</td>
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

        {/* COLUNA DIREITA: RANKING DOS 3º COLOCADOS */}
        {!carregando && !erro && terceiros.length > 0 && (
          <div 
            className="coluna-terceiros cosmic-panel" 
            style={{ 
              padding: '15px', 
              display: 'flex', 
              flexDirection: 'column', 
              margin: 0 /* A MÁGICA DO ALINHAMENTO: tira a margem padrão que estava encurtando o painel */
            }}
          >
            <div style={{ background: 'rgba(0,102,255,0.1)', padding: '10px 14px', borderRadius: '6px', borderBottom: '1px solid rgba(0,102,255,0.2)', marginBottom: '15px' }}>
  <h3 style={{ color: 'var(--galaxy-gold)', margin: 0, fontSize: '1.1rem', textAlign: 'center' }}>
    🏆 Ranking dos 3º Colocados
  </h3>
</div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <table className="ranking-table" style={{ height: '100%', marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: '12%', textAlign: 'center' }}>RNK</th>
                    <th style={{ width: '46%', textAlign: 'left' }}>Seleção</th>
                    <th style={{ width: '14%', textAlign: 'center' }}>GRP</th> {/* NOVA COLUNA DE GRUPO */}
                    <th style={{ width: '14%', textAlign: 'center' }}>PTS</th>
                    <th style={{ width: '14%', textAlign: 'center' }}>SG</th>
                  </tr>
                </thead>
                <tbody>
                  {terceiros.map((t, i) => (
                    <tr 
                      key={t.grupo}
                      style={{
                        backgroundColor: i < CLASSIFICADOS_3OS ? 'rgba(0, 255, 102, 0.12)' : 'rgba(255, 51, 51, 0.12)',
                      }}
                    >
                      <td style={{ fontWeight: 'bold', color: 'var(--galaxy-gold)', borderBottom: '1px solid rgba(0,0,0,0.2)', textAlign: 'center' }}>{i + 1}º</td>
                      <td style={{ fontWeight: 'bold', color: '#fff', borderBottom: '1px solid rgba(0,0,0,0.2)', whiteSpace: 'nowrap', textAlign: 'left' }}>
                        {t.time.escudo && <img src={t.time.escudo} alt="" style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} />}
                        {t.time.nome}
                      </td>
                      <td style={{ borderBottom: '1px solid rgba(0,0,0,0.2)', textAlign: 'center', color: '#ccc', fontWeight: 'bold' }}>{t.grupo}</td>
                      <td style={{ borderBottom: '1px solid rgba(0,0,0,0.2)', textAlign: 'center' }}>{t.pontos}</td>
                      <td style={{ borderBottom: '1px solid rgba(0,0,0,0.2)', textAlign: 'center' }}>{t.saldoGols}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.75rem', color: '#aaa' }}>
              *Top {CLASSIFICADOS_3OS} avançam para a fase eliminatória.
            </div>
          </div>
        )}

      </div>
    </section>
  );
}