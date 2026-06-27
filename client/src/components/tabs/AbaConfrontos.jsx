import { useState, useEffect } from 'react';

const BASE = import.meta.env.VITE_API_URL ?? '';

export default function AbaConfrontos() {
  const [confrontos, setConfrontos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfrontos = async () => {
      try {
        const response = await fetch(`${BASE}/api/confrontos`);
        const data = await response.json();
        setConfrontos(data);
      } catch (error) {
        console.error("Erro ao buscar confrontos:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfrontos();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--nebula-green)', textAlign: 'center', marginTop: '40px' }}>Carregando radar de confrontos... 🚀</div>;
  }

  // === SEPARAÇÃO EXATA DOS LADOS ===
  const leftFase1 = [
    confrontos.find(j => j.idJogo === 1),
    { idJogo: 'bye-leo', isBye: true, nome: 'Leo' },
    confrontos.find(j => j.idJogo === 2), confrontos.find(j => j.idJogo === 3),
    confrontos.find(j => j.idJogo === 4), confrontos.find(j => j.idJogo === 5),
    confrontos.find(j => j.idJogo === 6), confrontos.find(j => j.idJogo === 7)
  ];
  
  const rightFase1 = [
    confrontos.find(j => j.idJogo === 8),
    { idJogo: 'bye-kahoe', isBye: true, nome: 'Kahoe' },
    confrontos.find(j => j.idJogo === 9), confrontos.find(j => j.idJogo === 10),
    confrontos.find(j => j.idJogo === 11), confrontos.find(j => j.idJogo === 12),
    confrontos.find(j => j.idJogo === 13), confrontos.find(j => j.idJogo === 14)
  ];

  const leftOitavas = [confrontos.find(j => j.idJogo === 15), confrontos.find(j => j.idJogo === 16), confrontos.find(j => j.idJogo === 17), confrontos.find(j => j.idJogo === 18)];
  const rightOitavas = [confrontos.find(j => j.idJogo === 19), confrontos.find(j => j.idJogo === 20), confrontos.find(j => j.idJogo === 21), confrontos.find(j => j.idJogo === 22)];

  const leftQuartas = [confrontos.find(j => j.idJogo === 23), confrontos.find(j => j.idJogo === 24)];
  const rightQuartas = [confrontos.find(j => j.idJogo === 25), confrontos.find(j => j.idJogo === 26)];

  const leftSemi = [confrontos.find(j => j.idJogo === 27)];
  const rightSemi = [confrontos.find(j => j.idJogo === 28)];

  const final = confrontos.find(j => j.fase === 'Final');

  // === CARD DE JOGO ===
  const MatchCard = ({ jogo, isFinal }) => {
    if (!jogo) return <div className="match-card empty" style={{ opacity: 0.3 }}>A definir</div>;
    
    // Card Elegante para o Leo e Kahoe
    if (jogo.isBye) {
      return (
        <div className="match-card" style={{ borderColor: 'var(--galaxy-gold, #fbbf24)' }}>
          <div className="match-header" style={{ color: 'var(--galaxy-gold, #fbbf24)' }}>VAGA GARANTIDA</div>
          <div className="player-row winner"><span className="player-name">{jogo.nome}</span><span className="trophy">🚀</span></div>
          <div className="divider" style={{ backgroundColor: 'rgba(251,191,36,0.2)' }}></div>
          <div className="player-row"><span className="player-name" style={{ color: '#666' }}>-</span></div>
        </div>
      );
    }

    const venceu1 = jogo.vencedor && jogo.vencedor === jogo.jogador1;
    const venceu2 = jogo.vencedor && jogo.vencedor === jogo.jogador2;

    return (
      <div className={`match-card ${isFinal ? 'final-card' : ''}`}>
        <div className="match-header" style={isFinal ? { color: 'var(--galaxy-gold, #fbbf24)' } : {}}>Jogo {jogo.idJogo}</div>
        <div className={`player-row ${venceu1 ? 'winner' : ''}`}>
          <span className="player-name" title={jogo.jogador1}>{jogo.jogador1 || 'A definir...'}</span>
          {venceu1 && <span className="trophy">🏆</span>}
        </div>
        <div className="divider" style={isFinal ? { backgroundColor: 'rgba(251, 191, 36, 0.2)' } : {}}></div>
        <div className={`player-row ${venceu2 ? 'winner' : ''}`}>
          <span className="player-name" title={jogo.jogador2}>{jogo.jogador2 || 'A definir...'}</span>
          {venceu2 && <span className="trophy">🏆</span>}
        </div>
      </div>
    );
  };

  // === CÉLULA MILIMÉTRICA DAS LINHAS ===
  const BracketCell = ({ jogo, side, phase, index, totalItems }) => {
    const isLeft = side === 'left';
    const isRight = side === 'right';
    const isCenter = side === 'center';

    const hasParents = phase !== 'Fase 1';
    const hasChildren = phase !== 'Final';
    const needsVertical = hasChildren && totalItems > 1;

    const colorOff = 'rgba(96, 165, 250, 0.25)';
    const colorOn = 'var(--galaxy-gold, #fbbf24)';

    const outGold = jogo?.vencedor || jogo?.isBye ? colorOn : colorOff;
    const inGold = (jogo?.jogador1 || jogo?.jogador2) ? colorOn : colorOff;

    return (
      <div className="bracket-cell">
        {/* === RECEBENDO DOS PAIS === */}
        {hasParents && isLeft && <div className="line-h line-in-left" style={{ backgroundColor: inGold }}></div>}
        {hasParents && isRight && <div className="line-h line-in-right" style={{ backgroundColor: inGold }}></div>}
        {isCenter && (
          <>
            <div className="line-h line-in-left" style={{ backgroundColor: jogo?.jogador1 ? colorOn : colorOff }}></div>
            <div className="line-h line-in-right" style={{ backgroundColor: jogo?.jogador2 ? colorOn : colorOff }}></div>
          </>
        )}

        {/* CONTAINER DO CARD COM A TAÇA FLUTUANTE AUMENTADA */}
        <div style={{ position: 'relative', width: '100%', zIndex: 10 }}>
          
          {/* 🏆 A TAÇA SÓ APARECE NO CENTRO DA GRANDE FINAL */}
          {isCenter && (
            <div className="floating-trophy-large">
              
              {/* === NOME DO CAMPEÃO BRILHANDO JUNTO COM A TAÇA === */}
              {jogo?.vencedor && (
                <div className="champion-label">
                  ⭐ {jogo.vencedor} ⭐
                </div>
              )}
              
              🏆
            </div>
          )}
          
          <MatchCard jogo={jogo} isFinal={isCenter} />
        </div>

        {/* === ENVIANDO PARA OS FILHOS === */}
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
  };

  return (
    <div className="bracket-full-width-container">
      
      {/* === CSS MILIMÉTRICO DAS LINHAS E ANIMAÇÕES === */}
      <style>{`
        .bracket-full-width-container {
          width: 100vw; position: relative; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw;
          background-color: transparent; overflow-x: auto; padding: 10px 0 80px 0;
        }
        .bracket-wrapper {
          display: flex; justify-content: space-between; align-items: stretch;
          width: 98vw; min-width: 1200px; margin: 0 auto;
        }
        .bracket-column {
          display: flex; flex-direction: column; justify-content: space-around; flex: 1; min-width: 110px;
        }
        .bracket-cell {
          flex: 1; display: flex; flex-direction: column; justify-content: center; position: relative;
          padding: 5px 20px;
        }
        .column-title {
          text-align: center; color: var(--cosmic-blue, #60a5fa); font-weight: bold; text-transform: uppercase;
          font-size: 0.8rem; margin-bottom: 20px; letter-spacing: 2px;
        }
        
        /* CARD STYLES */
        .match-card {
          background-color: rgba(15, 23, 42, 0.95); border: 1px solid #334155; border-radius: 6px; padding: 8px;
          width: 100%; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); transition: transform 0.2s, border-color 0.2s;
          position: relative; z-index: 5;
        }
        .match-card:hover { transform: scale(1.05); border-color: var(--cosmic-blue, #3b82f6); z-index: 10; }
        .match-header { font-size: 0.65rem; color: #94a3b8; text-align: center; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
        .player-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; padding: 3px 4px; border-radius: 4px; color: #cbd5e1; }
        .player-row.winner { background-color: rgba(21, 128, 61, 0.2); color: var(--nebula-green, #4ade80); font-weight: bold; }
        .player-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80px; }
        .divider { height: 1px; background-color: #1e293b; margin: 4px 0; }
        .final-card { border-color: var(--galaxy-gold, #fbbf24); background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); transform: scale(1.1); }
        .final-card:hover { transform: scale(1.15); box-shadow: 0 0 15px rgba(251, 191, 36, 0.2); }

        /* === 🏆 ESTILO DA TAÇA E DO NOME DO CAMPEÃO === */
        .floating-trophy-large {
          position: absolute;
          top: -210px;
          left: 50%;
          font-size: 9rem;
          pointer-events: none; 
          animation: floatTrophyLarge 3.5s ease-in-out infinite; 
          z-index: 0;
          /* Mantém o texto dentro do escudo alinhado */
          display: flex;
          justify-content: center;
        }

        .champion-label {
          position: absolute;
          top: -30px; /* Posiciona logo acima da taça grandona */
          font-size: 1.8rem;
          font-weight: 900;
          color: #fff;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 0 0 10px rgba(251, 191, 36, 0.8), 0 0 20px rgba(251, 191, 36, 1), 0 0 40px rgba(251, 191, 36, 1);
          line-height: 1;
        }

        @keyframes floatTrophyLarge {
          0% { 
            transform: translate(-50%, 0px) scale(1); 
            filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.4)); 
          }
          50% { 
            transform: translate(-50%, -25px) scale(1.1); 
            filter: drop-shadow(0 0 45px rgba(251, 191, 36, 1)); 
          }
          100% { 
            transform: translate(-50%, 0px) scale(1); 
            filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.4)); 
          }
        }

        /* === MÁGICA DAS LINHAS EXATAS === */
        .line-h { position: absolute; height: 2px; top: calc(50% - 1px); z-index: 1; transition: background-color 0.3s; }
        .line-out-left, .line-in-left { left: 0; width: 20px; }
        .line-out-right, .line-in-right { right: 0; width: 20px; }

        .line-v { position: absolute; width: 2px; z-index: 1; transition: background-color 0.3s; }
        .line-v-down-right { right: 0; top: calc(50% - 1px); bottom: 0; }
        .line-v-up-right { right: 0; top: 0; height: calc(50% + 1px); }
        .line-v-down-left { left: 0; top: calc(50% - 1px); bottom: 0; }
        .line-v-up-left { left: 0; top: 0; height: calc(50% + 1px); }
      `}</style>

      <div className="bracket-wrapper">
        
        {/* ================= LADO ESQUERDO ================= */}
        <div className="bracket-column">
          <div className="column-title">Fase 1</div>
          {leftFase1.map((jogo, i) => <BracketCell key={`l-f1-${i}`} jogo={jogo} side="left" phase="Fase 1" index={i} totalItems={8} />)}
        </div>
        
        <div className="bracket-column">
          <div className="column-title">Oitavas</div>
          {leftOitavas.map((jogo, i) => <BracketCell key={`l-oit-${i}`} jogo={jogo} side="left" phase="Oitavas" index={i} totalItems={4} />)}
        </div>

        <div className="bracket-column">
          <div className="column-title">Quartas</div>
          {leftQuartas.map((jogo, i) => <BracketCell key={`l-qua-${i}`} jogo={jogo} side="left" phase="Quartas" index={i} totalItems={2} />)}
        </div>

        <div className="bracket-column">
          <div className="column-title">Semifinal</div>
          {leftSemi.map((jogo, i) => <BracketCell key={`l-sem-${i}`} jogo={jogo} side="left" phase="Semifinal" index={i} totalItems={1} />)}
        </div>

        {/* ================= O CENTRO (FINAL) ================= */}
        <div className="bracket-column" style={{ flex: 1.2 }}>
          <div className="column-title" style={{ color: 'var(--galaxy-gold, #fbbf24)', textShadow: '0 0 10px rgba(251, 191, 36, 0.4)' }}>Grande Final</div>
          <BracketCell jogo={final} side="center" phase="Final" index={0} totalItems={1} />
        </div>

        {/* ================= LADO DIREITO ================= */}
        <div className="bracket-column">
          <div className="column-title">Semifinal</div>
          {rightSemi.map((jogo, i) => <BracketCell key={`r-sem-${i}`} jogo={jogo} side="right" phase="Semifinal" index={i} totalItems={1} />)}
        </div>

        <div className="bracket-column">
          <div className="column-title">Quartas</div>
          {rightQuartas.map((jogo, i) => <BracketCell key={`r-qua-${i}`} jogo={jogo} side="right" phase="Quartas" index={i} totalItems={2} />)}
        </div>

        <div className="bracket-column">
          <div className="column-title">Oitavas</div>
          {rightOitavas.map((jogo, i) => <BracketCell key={`r-oit-${i}`} jogo={jogo} side="right" phase="Oitavas" index={i} totalItems={4} />)}
        </div>

        <div className="bracket-column">
          <div className="column-title">Fase 1</div>
          {rightFase1.map((jogo, i) => <BracketCell key={`r-f1-${i}`} jogo={jogo} side="right" phase="Fase 1" index={i} totalItems={8} />)}
        </div>

      </div>
    </div>
  );
}