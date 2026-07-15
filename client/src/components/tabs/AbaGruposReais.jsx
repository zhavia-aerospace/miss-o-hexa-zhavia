import { useEffect, useState } from 'react';
import { getGruposReais } from '../../services/api.js';

const CLASSIFICADOS_3OS = 8;

function preencher(jogos, inicio, fim) {
  return Array.from({ length: fim - inicio }, (_, i) => jogos[inicio + i]);
}

// === CARD DE JOGO REAL ===
function RealMatchCard({ jogo, isFinal, isThird, selectedTeam, setSelectedTeam }) {
  if (!jogo) return <div className="match-card empty" style={{ opacity: 0.3 }}>A definir</div>;

  const homeNome = jogo.home?.nome;
  const awayNome = jogo.away?.nome;
  const venceuHome = jogo.vencedor && jogo.vencedor === homeNome;
  const venceuAway = jogo.vencedor && jogo.vencedor === awayNome;
  const isDecided = !!jogo.vencedor;

  // Lógica de Foco
  const isHighlighted = selectedTeam && (homeNome === selectedTeam || awayNome === selectedTeam);
  const isDimmed = selectedTeam && !isHighlighted;
  
  let cardClasses = `match-card ${isFinal ? 'final-card' : ''} ${isThird ? 'third-place-card' : ''} ${isDecided ? 'decided-card' : ''}`;
  if (isHighlighted) cardClasses += ' highlighted-card';
  if (isDimmed) cardClasses += ' dimmed-card';

  const handleTeamClick = (teamName, e) => {
    e.stopPropagation();
    if (!teamName) return;
    setSelectedTeam(prev => prev === teamName ? null : teamName);
  };

  return (
    <div className={cardClasses}>
      
      {/* TIME DA CASA */}
      <div 
        className={`player-row ${venceuHome ? 'winner' : ''} clickable-row`}
        onClick={(e) => handleTeamClick(homeNome, e)}
        title="Clique para mapear o percurso desta seleção"
      >
        <span className="player-name">
          {jogo.home?.escudo ? (
            <img src={jogo.home.escudo} alt="" style={{ width: 12, height: 12, marginRight: 4, verticalAlign: 'middle' }} />
          ) : (
            <div className="placeholder-flag-blink">?</div>
          )}
          <span style={{ opacity: homeNome ? 1 : 0.6 }}>{homeNome ?? 'A definir...'}</span>
        </span>
        <span>
          {jogo.placarHome ?? ''}
          {jogo.penaltisHome != null && <span style={{ color: 'var(--galaxy-gold)', fontWeight: 'bold' }}> ({jogo.penaltisHome})</span>}
        </span>
      </div>
      
      <div className="divider" style={isFinal ? { backgroundColor: 'rgba(251, 191, 36, 0.2)' } : {}}></div>
      
      {/* TIME VISITANTE */}
      <div 
        className={`player-row ${venceuAway ? 'winner' : ''} clickable-row`}
        onClick={(e) => handleTeamClick(awayNome, e)}
        title="Clique para mapear o percurso desta seleção"
      >
        <span className="player-name">
          {jogo.away?.escudo ? (
            <img src={jogo.away.escudo} alt="" style={{ width: 12, height: 12, marginRight: 4, verticalAlign: 'middle' }} />
          ) : (
            <div className="placeholder-flag-blink">?</div>
          )}
          <span style={{ opacity: awayNome ? 1 : 0.6 }}>{awayNome ?? 'A definir...'}</span>
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
function RealBracketCell({ jogo, side, phase, index, totalItems, selectedTeam, setSelectedTeam }) {
  const isLeft = side === 'left';
  const isRight = side === 'right';
  const hasParents = phase !== 'Rodada de 32';
  const hasChildren = true;
  const needsVertical = totalItems > 1;

  const colorOff = 'rgba(96, 165, 250, 0.25)';
  const colorOn = 'var(--galaxy-gold, #fbbf24)';

  const outGold = jogo?.vencedor ? colorOn : colorOff;
  const inGold = (jogo?.home?.nome || jogo?.away?.nome) ? colorOn : colorOff;

  const isTeamInMatch = selectedTeam && (jogo?.home?.nome === selectedTeam || jogo?.away?.nome === selectedTeam);
  const teamAdvanced = selectedTeam && (phase === 'Semifinal' ? isTeamInMatch : jogo?.vencedor === selectedTeam);

  let lineInClass = '';
  let lineOutClass = '';

  if (selectedTeam) {
    lineInClass = isTeamInMatch ? 'line-highlight' : 'line-dimmed';
    lineOutClass = teamAdvanced ? 'line-highlight' : 'line-dimmed';
  }

  return (
    <div className="bracket-cell">
      {hasParents && isLeft && <div className={`line-h line-in-left ${lineInClass}`} style={{ backgroundColor: lineInClass ? '' : inGold }}></div>}
      {hasParents && isRight && <div className={`line-h line-in-right ${lineInClass}`} style={{ backgroundColor: lineInClass ? '' : inGold }}></div>}

      <div style={{ position: 'relative', width: '100%', zIndex: 10 }}>
        <RealMatchCard jogo={jogo} isFinal={false} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />
      </div>

      {hasChildren && isLeft && (
        <>
          <div className={`line-h line-out-right ${lineOutClass}`} style={{ backgroundColor: lineOutClass ? '' : outGold }}></div>
          {needsVertical && index % 2 === 0 && <div className={`line-v line-v-down-right ${lineOutClass}`} style={{ backgroundColor: lineOutClass ? '' : outGold }}></div>}
          {needsVertical && index % 2 === 1 && <div className={`line-v line-v-up-right ${lineOutClass}`} style={{ backgroundColor: lineOutClass ? '' : outGold }}></div>}
        </>
      )}
      {hasChildren && isRight && (
        <>
          <div className={`line-h line-out-left ${lineOutClass}`} style={{ backgroundColor: lineOutClass ? '' : outGold }}></div>
          {needsVertical && index % 2 === 0 && <div className={`line-v line-v-down-left ${lineOutClass}`} style={{ backgroundColor: lineOutClass ? '' : outGold }}></div>}
          {needsVertical && index % 2 === 1 && <div className={`line-v line-v-up-left ${lineOutClass}`} style={{ backgroundColor: lineOutClass ? '' : outGold }}></div>}
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
  
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    const handleGlobalClick = () => setSelectedTeam(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    getGruposReais()
      .then((res) => {
        setGrupos(res.data?.grupos ?? []);
        setTerceiros(res.data?.terceiros ?? []);
        
        let mataMataLimpo = res.data?.mataMata ?? [];
        mataMataLimpo = mataMataLimpo.map(fase => {
          return {
            ...fase,
            jogos: fase.jogos.map(jogo => {
              if (jogo.home?.nome === 'Austrália' && jogo.away?.nome === 'Egito') {
                return { ...jogo, placarHome: 1, placarAway: 1, penaltisHome: 2, penaltisAway: 4, vencedor: 'Egito' };
              }
              if (fase.fase === 'Oitavas de Final') {
                if (jogo.home?.nome === 'Argentina' && !jogo.away?.nome) {
                  return { ...jogo, away: { nome: 'Egito', escudo: 'https://crests.football-data.org/825.svg' } };
                }
                if (jogo.away?.nome === 'Argentina' && !jogo.home?.nome) {
                  return { ...jogo, home: { nome: 'Egito', escudo: 'https://crests.football-data.org/825.svg' } };
                }
              }
              return jogo;
            })
          };
        });

        setMataMata(mataMataLimpo);
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
  let terceiroLugar = porFase['Disputa de 3º Lugar']?.[0];
  let final = porFase['Final']?.[0];

  let vencedorEsqNome = null;
  let perdedorEsqNome = null;
  let vencedorDirNome = null;
  let perdedorDirNome = null;

  if (final || terceiroLugar) {
    final = final ? { ...final } : null;
    terceiroLugar = terceiroLugar ? { ...terceiroLugar } : null;

    const semiEsq = semifinal[0];
    const semiDir = semifinal[1];

    if (semiEsq?.vencedor) {
      vencedorEsqNome = semiEsq.vencedor;
      perdedorEsqNome = semiEsq.vencedor === semiEsq.home?.nome ? semiEsq.away?.nome : semiEsq.home?.nome;
      
      const vencedorEsq = semiEsq.vencedor === semiEsq.home?.nome ? semiEsq.home : semiEsq.away;
      const perdedorEsq = semiEsq.vencedor === semiEsq.home?.nome ? semiEsq.away : semiEsq.home;
      if (final && !final.home?.nome) final.home = vencedorEsq;
      if (terceiroLugar && !terceiroLugar.home?.nome) terceiroLugar.home = perdedorEsq;
    }

    if (semiDir?.vencedor) {
      vencedorDirNome = semiDir.vencedor;
      perdedorDirNome = semiDir.vencedor === semiDir.home?.nome ? semiDir.away?.nome : semiDir.home?.nome;

      const vencedorDir = semiDir.vencedor === semiDir.home?.nome ? semiDir.home : semiDir.away;
      const perdedorDir = semiDir.vencedor === semiDir.home?.nome ? semiDir.away : semiDir.home;
      if (final && !final.away?.nome) final.away = vencedorDir;
      if (terceiroLugar && !terceiroLugar.away?.nome) terceiroLugar.away = perdedorDir;
    }
  }

  // ============================================================================
  // ✨ ENGENHARIA DE LUZ Z-INDEX E GEOMETRIA PIXEL-PERFECT
  // ============================================================================
  const getLineStyle = (isFinished, winnerName, loserName, isTopPath) => {
    const colorOn = 'var(--galaxy-gold, #fbbf24)';
    const colorOff = 'rgba(96, 165, 250, 0.3)';
    const colorDimmed = 'rgba(96, 165, 250, 0.05)';

    let color = isFinished ? colorOn : colorOff;
    let opacity = 1;
    let filter = 'none';
    let zIndex = 1;

    if (selectedTeam) {
      const isMyPath = isTopPath ? (selectedTeam === winnerName) : (selectedTeam === loserName);
      if (isMyPath) {
        color = colorOn;
        filter = 'drop-shadow(0 0 4px var(--galaxy-gold))';
        opacity = 1;
        zIndex = 2; // Linha acesa vem para a frente!
      } else {
        color = colorDimmed;
        opacity = 0.2;
        zIndex = 1; // Linha apagada vai para trás!
      }
    }
    return { color, opacity, filter, zIndex };
  };

  const styleTopLeft = getLineStyle(!!semifinal[0]?.vencedor, vencedorEsqNome, perdedorEsqNome, true);
  const styleBotLeft = getLineStyle(!!semifinal[0]?.vencedor, vencedorEsqNome, perdedorEsqNome, false);
  const styleTopRight = getLineStyle(!!semifinal[1]?.vencedor, vencedorDirNome, perdedorDirNome, true);
  const styleBotRight = getLineStyle(!!semifinal[1]?.vencedor, vencedorDirNome, perdedorDirNome, false);

  if (carregando) {
    return (
      <section className="tab-content" style={{ padding: '20px' }}>
        <div className="skeleton-card" style={{ width: '300px', height: '35px', marginBottom: '40px', borderRadius: '6px' }}></div>
        <div className="bracket-full-width-container" style={{ display: 'flex', gap: '20px', justifyContent: 'center', padding: '10px 20px 40px 20px' }}>
          <div className="skeleton-card" style={{ width: '220px' }}></div>
          <div className="skeleton-card" style={{ width: '250px', transform: 'scale(1.1)', border: '1px solid rgba(251, 191, 36, 0.5)' }}></div>
          <div className="skeleton-card" style={{ width: '220px' }}></div>
        </div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div className="skeleton-card" style={{ flex: '2 1 500px', height: '400px', borderRadius: '12px' }}></div>
          <div className="skeleton-card" style={{ flex: '1 1 300px', height: '400px', borderRadius: '12px' }}></div>
        </div>
      </section>
    );
  }

  return (
    <section className="tab-content">

      {!erro && rodada32.length > 0 && (
        <>
          <h2 style={{ padding: '0 20px' }}>⚔️ Chaveamento Real do Mata-Mata</h2>
          <p style={{ color: '#aaa', marginBottom: 10, padding: '0 20px' }}>
            Clique sobre uma seleção para mapear a rota exata dela no torneio.
          </p>

          <div className="bracket-full-width-container">
            <div className="bracket-wrapper">
              
              {/* LADO ESQUERDO */}
              <div className="bracket-column">
                <div className="column-title">Rodada de 32</div>
                {preencher(rodada32, 0, 8).map((jogo, i) => <RealBracketCell key={`l-32-${i}`} jogo={jogo} side="left" phase="Rodada de 32" index={i} totalItems={8} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />)}
              </div>
              <div className="bracket-column">
                <div className="column-title">Oitavas</div>
                {preencher(oitavas, 0, 4).map((jogo, i) => <RealBracketCell key={`l-oit-${i}`} jogo={jogo} side="left" phase="Oitavas" index={i} totalItems={4} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />)}
              </div>
              <div className="bracket-column">
                <div className="column-title">Quartas</div>
                {preencher(quartas, 0, 2).map((jogo, i) => <RealBracketCell key={`l-qua-${i}`} jogo={jogo} side="left" phase="Quartas" index={i} totalItems={2} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />)}
              </div>
              <div className="bracket-column">
                <div className="column-title">Semifinal</div>
                {preencher(semifinal, 0, 1).map((jogo, i) => <RealBracketCell key={`l-sem-${i}`} jogo={jogo} side="left" phase="Semifinal" index={i} totalItems={1} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />)}
              </div>

              {/* COLUNA CENTRAL */}
              <div className="bracket-column" style={{ flex: 1.5, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 20px' }}>
                <div style={{ width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', gap: '50px' }}>
                  
                  {/* ESQUERDA - CAMINHO PARA A FINAL (CIMA) - Ajuste milimétrico de -19px na junção */}
                  <div style={{ position: 'absolute', left: '-20px', top: '85px', bottom: 'calc(50% - 19px)', width: '20px', borderLeft: `2px solid ${styleTopLeft.color}`, borderTop: `2px solid ${styleTopLeft.color}`, zIndex: styleTopLeft.zIndex, transition: 'all 0.4s ease', opacity: styleTopLeft.opacity, filter: styleTopLeft.filter }}></div>
                  
                  {/* ESQUERDA - CAMINHO PARA 3º LUGAR (BAIXO) - Ajuste milimétrico de +17px na junção */}
                  <div style={{ position: 'absolute', left: '-20px', top: 'calc(50% + 17px)', bottom: '55px', width: '20px', borderLeft: `2px solid ${styleBotLeft.color}`, borderBottom: `2px solid ${styleBotLeft.color}`, zIndex: styleBotLeft.zIndex, transition: 'all 0.4s ease', opacity: styleBotLeft.opacity, filter: styleBotLeft.filter }}></div>

                  {/* DIREITA - CAMINHO PARA A FINAL (CIMA) */}
                  <div style={{ position: 'absolute', right: '-20px', top: '85px', bottom: 'calc(50% - 19px)', width: '20px', borderRight: `2px solid ${styleTopRight.color}`, borderTop: `2px solid ${styleTopRight.color}`, zIndex: styleTopRight.zIndex, transition: 'all 0.4s ease', opacity: styleTopRight.opacity, filter: styleTopRight.filter }}></div>
                  
                  {/* DIREITA - CAMINHO PARA 3º LUGAR (BAIXO) */}
                  <div style={{ position: 'absolute', right: '-20px', top: 'calc(50% + 17px)', bottom: '55px', width: '20px', borderRight: `2px solid ${styleBotRight.color}`, borderBottom: `2px solid ${styleBotRight.color}`, zIndex: styleBotRight.zIndex, transition: 'all 0.4s ease', opacity: styleBotRight.opacity, filter: styleBotRight.filter }}></div>

                  {/* FINAL */}
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <div className="floating-trophy-large">
                      {final?.vencedor && <div className="champion-label">⭐ {final.vencedor} ⭐</div>}
                      🏆
                    </div>
                    <div className="column-title" style={{ color: 'var(--galaxy-gold, #fbbf24)', textShadow: '0 0 10px rgba(251, 191, 36, 0.4)' }}>Grande Final</div>
                    <RealMatchCard jogo={final} isFinal={true} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />
                  </div>

                  {/* 3º LUGAR */}
                  {terceiroLugar && (
                    <div style={{ position: 'relative', zIndex: 10 }}>
                      <div className="column-title" style={{ color: '#cd7f32', textShadow: '0 0 10px rgba(205, 127, 50, 0.4)' }}>Disputa de 3º Lugar</div>
                      <RealMatchCard jogo={terceiroLugar} isThird={true} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />
                    </div>
                  )}
                </div>
              </div>

              {/* LADO DIREITO */}
              <div className="bracket-column">
                <div className="column-title">Semifinal</div>
                {preencher(semifinal, 1, 2).map((jogo, i) => <RealBracketCell key={`r-sem-${i}`} jogo={jogo} side="right" phase="Semifinal" index={i} totalItems={1} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />)}
              </div>
              <div className="bracket-column">
                <div className="column-title">Quartas</div>
                {preencher(quartas, 2, 4).map((jogo, i) => <RealBracketCell key={`r-qua-${i}`} jogo={jogo} side="right" phase="Quartas" index={i} totalItems={2} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />)}
              </div>
              <div className="bracket-column">
                <div className="column-title">Oitavas</div>
                {preencher(oitavas, 4, 8).map((jogo, i) => <RealBracketCell key={`r-oit-${i}`} jogo={jogo} side="right" phase="Oitavas" index={i} totalItems={4} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />)}
              </div>
              <div className="bracket-column">
                <div className="column-title">Rodada de 32</div>
                {preencher(rodada32, 8, 16).map((jogo, i) => <RealBracketCell key={`r-32-${i}`} jogo={jogo} side="right" phase="Rodada de 32" index={i} totalItems={8} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />)}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="container-fase-grupos cosmic-panel" style={{ padding: '20px', background: 'transparent', border: 'none', boxShadow: 'none' }}>
        
        {/* COLUNA ESQUERDA: FASE DE GRUPOS */}
        <div className="coluna-grupos">
          <h2>📊 Fase de Grupos — Tabela Real</h2>
          
          {erro ? (
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
        {!erro && terceiros.length > 0 && (
          <div 
            className="coluna-terceiros cosmic-panel" 
            style={{ 
              padding: '15px', 
              display: 'flex', 
              flexDirection: 'column', 
              margin: 0
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
                    <th style={{ width: '14%', textAlign: 'center' }}>GRP</th>
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