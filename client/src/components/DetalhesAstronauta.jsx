import { useState, useEffect } from 'react';
import { LETRAS_GRUPOS } from '../data/grupos.js';
import { getGruposReais } from '../services/api.js';

export default function DetalhesAstronauta({ palpite, podio, meuNome, listaPodios = [], onFechar }) {
  const [classificadosAtivos, setClassificadosAtivos] = useState([]);
  const [podioOficial, setPodioOficial] = useState({ p1: null, p2: null, p3: null, p4: null });
  const [gruposOficiais, setGruposOficiais] = useState({});
  const [carregou, setCarregou] = useState(false);
  
  const [finalistas, setFinalistas] = useState([]);
  const [disputantesTerceiro, setDisputantesTerceiro] = useState([]);
  
  // 💡 Novo estado para rastrear em qual fase os outros times caíram
  const [mapaEliminacoes, setMapaEliminacoes] = useState({});

  // =========================================================================
  // COMUNICAÇÃO COM O SATÉLITE
  // =========================================================================
  useEffect(() => {
    getGruposReais()
      .then((res) => {
        const ativos = res.data?.classificadosAtivos || [];
        setClassificadosAtivos(ativos.map(time => time.trim().toLowerCase()));

        const mataMata = res.data?.mataMata || [];
        const jogoFinal = mataMata.find(f => f.fase === 'Final')?.jogos?.[0];
        const jogoTerceiro = mataMata.find(f => f.fase === 'Disputa de 3º Lugar')?.jogos?.[0];

        const f1 = jogoFinal?.home?.nome?.trim().toLowerCase();
        const f2 = jogoFinal?.away?.nome?.trim().toLowerCase();
        setFinalistas([f1, f2].filter(Boolean));

        const t1 = jogoTerceiro?.home?.nome?.trim().toLowerCase();
        const t2 = jogoTerceiro?.away?.nome?.trim().toLowerCase();
        setDisputantesTerceiro([t1, t2].filter(Boolean));

        let p1 = null, p2 = null, p3 = null, p4 = null;

        if (jogoFinal?.vencedor) {
          p1 = jogoFinal.vencedor.trim().toLowerCase();
          const home = jogoFinal.home?.nome?.trim().toLowerCase();
          const away = jogoFinal.away?.nome?.trim().toLowerCase();
          p2 = (p1 === home) ? away : (p1 === away ? home : null);
        }

        if (jogoTerceiro?.vencedor) {
          p3 = jogoTerceiro.vencedor.trim().toLowerCase();
          const home = jogoTerceiro.home?.nome?.trim().toLowerCase();
          const away = jogoTerceiro.away?.nome?.trim().toLowerCase();
          p4 = (p3 === home) ? away : (p3 === away ? home : null);
        }

        setPodioOficial({ p1, p2, p3, p4 });

        // 💡 RASTREADOR DE ELIMINAÇÕES: Descobre onde cada time caiu no mata-mata
        const elim = {};
        mataMata.forEach(fase => {
          // Ignoramos finais porque esses vão pro Top 4
          if (fase.fase === 'Final' || fase.fase === 'Disputa de 3º Lugar') return;
          
          fase.jogos.forEach(jogo => {
            if (jogo.vencedor) {
              const home = jogo.home?.nome?.trim().toLowerCase();
              const away = jogo.away?.nome?.trim().toLowerCase();
              const vencedor = jogo.vencedor.trim().toLowerCase();
              const perdedor = (vencedor === home) ? away : (vencedor === away ? home : null);
              
              if (perdedor) {
                elim[perdedor] = fase.fase;
              }
            }
          });
        });
        setMapaEliminacoes(elim);

        const gruposApi = res.data?.grupos || [];
        const gruposMap = {};
        gruposApi.forEach(g => {
          if (g.tabela) {
            gruposMap[g.grupo] = {
              p1: g.tabela.find(t => t.posicao === 1)?.time?.nome?.trim().toLowerCase(),
              p2: g.tabela.find(t => t.posicao === 2)?.time?.nome?.trim().toLowerCase()
            };
          }
        });
        setGruposOficiais(gruposMap);

      })
      .catch((err) => console.error("Falha ao buscar dados da Copa:", err))
      .finally(() => setCarregou(true));
  }, []);

  if (!palpite) return null;

  const dadosPodio = podio || palpite.podio;

  const temNome = meuNome && meuNome.trim().length > 0;
  const isOlhandoParaMimMesmo = temNome && palpite.nome.trim().toLowerCase() === meuNome.trim().toLowerCase();
  const euJaEnvieiPodio = temNome && listaPodios.some(p => p.nome.trim().toLowerCase() === meuNome.trim().toLowerCase());
  const deveBloquear = listaPodios.length > 0 && !isOlhandoParaMimMesmo && !euJaEnvieiPodio;

  // =========================================================================
  // LÓGICAS DE ELIMINAÇÃO E ACERTO
  // =========================================================================
  const formataNome = (nome) => nome ? nome.trim().toLowerCase() : '';

  const isAcerto = (timeChutado, timeOficial) => {
    if (!timeChutado || !timeOficial) return false;
    return formataNome(timeChutado).startsWith(timeOficial);
  };

  const isEliminadoDoPodio = (time, posicaoDesejada) => {
    if (!time || !carregou || classificadosAtivos.length === 0) return false;
    const timeChutado = formataNome(time);

    if (podioOficial.p1 && isAcerto(timeChutado, podioOficial.p1) && posicaoDesejada !== 1) return true;
    if (podioOficial.p2 && isAcerto(timeChutado, podioOficial.p2) && posicaoDesejada !== 2) return true;
    if (podioOficial.p3 && isAcerto(timeChutado, podioOficial.p3) && posicaoDesejada !== 3) return true;

    const aindaTaNoTorneio = classificadosAtivos.some(ativo => timeChutado.startsWith(ativo));
    if (!aindaTaNoTorneio) return true;

    if (posicaoDesejada === 1 || posicaoDesejada === 2) {
      const taNaDisputaDeTerceiro = disputantesTerceiro.some(t => timeChutado.startsWith(t));
      if (taNaDisputaDeTerceiro) return true;
    }

    if (posicaoDesejada === 3) {
      const taNaFinal = finalistas.some(f => timeChutado.startsWith(f));
      if (taNaFinal) return true;
    }

    return false;
  };

  // 💡 Inteligência ampliada: Retorna ONDE o time parou (Top 4 ou Fases Anteriores)
  const getPosicaoRealInfo = (timeChutado) => {
    if (!timeChutado || !carregou) return null;
    const t = formataNome(timeChutado);
    
    // Cores de destaque para o Top 4
    const goldColor = { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)' };
    // Cores cinzas/neutras para quem caiu antes
    const silverColor = { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.2)' };

    // 1. O time chegou no Top 4?
    if (podioOficial.p1 && isAcerto(t, podioOficial.p1)) return { texto: 'Ficou em 1º', medal: '🥇', ...goldColor };
    if (podioOficial.p2 && isAcerto(t, podioOficial.p2)) return { texto: 'Ficou em 2º', medal: '🥈', ...goldColor };
    if (podioOficial.p3 && isAcerto(t, podioOficial.p3)) return { texto: 'Ficou em 3º', medal: '🥉', ...goldColor };
    if (podioOficial.p4 && isAcerto(t, podioOficial.p4)) return { texto: 'Ficou em 4º', medal: '🏅', ...goldColor };

    // 2. Se não tá no Top 4, o time já foi eliminado da Copa?
    const aindaTaNoTorneio = classificadosAtivos.some(ativo => t.startsWith(ativo));
    
    if (!aindaTaNoTorneio && classificadosAtivos.length > 0) {
      // Procura no registro de quedas do mata-mata
      for (const [perdedor, fase] of Object.entries(mapaEliminacoes)) {
        if (t.startsWith(perdedor) || perdedor.startsWith(t)) {
          if (fase === 'Quartas de Final') return { texto: 'Caiu nas Quartas', medal: '✈️', ...silverColor };
          if (fase === 'Oitavas de Final') return { texto: 'Caiu nas Oitavas', medal: '✈️', ...silverColor };
          if (fase === 'Rodada de 32') return { texto: 'Caiu nos 16-avos', medal: '✈️', ...silverColor };
          return { texto: `Caiu na ${fase}`, medal: '✈️', ...silverColor };
        }
      }
      // Se já caiu e não está no mata-mata, só pode ter caído nos grupos!
      return { texto: 'Caiu nos Grupos', medal: '🧳', ...silverColor };
    }

    return null; // Time segue vivo e ainda não definiu posição
  };

  const acertouP1 = isAcerto(dadosPodio?.p1, podioOficial.p1);
  const acertouP2 = isAcerto(dadosPodio?.p2, podioOficial.p2);
  const acertouP3 = isAcerto(dadosPodio?.p3, podioOficial.p3);

  const elimP1 = !acertouP1 && isEliminadoDoPodio(dadosPodio?.p1, 1);
  const elimP2 = !acertouP2 && isEliminadoDoPodio(dadosPodio?.p2, 2);
  const elimP3 = !acertouP3 && isEliminadoDoPodio(dadosPodio?.p3, 3);

  const infoRealP1 = getPosicaoRealInfo(dadosPodio?.p1);
  const infoRealP2 = getPosicaoRealInfo(dadosPodio?.p2);
  const infoRealP3 = getPosicaoRealInfo(dadosPodio?.p3);

  const getEstiloPodio = (medalha, acertou, eliminado, posRealInfo) => {
    let bg, border, shadow, color = '#fff', icon, decor = 'none', op = 1, filter = 'none';

    if (medalha === 'ouro') {
      bg = 'linear-gradient(180deg, rgba(251,191,36,0.15) 0%, rgba(0,0,0,0.3) 100%)';
      border = '1px solid rgba(251,191,36,0.4)'; shadow = '0 4px 10px rgba(251,191,36,0.1)'; icon = '🥇';
    } else if (medalha === 'prata') {
      bg = 'linear-gradient(180deg, rgba(209,209,209,0.15) 0%, rgba(0,0,0,0.3) 100%)';
      border = '1px solid rgba(209,209,209,0.4)'; shadow = '0 4px 10px rgba(209,209,209,0.1)'; icon = '🥈';
    } else {
      bg = 'linear-gradient(180deg, rgba(205,127,50,0.15) 0%, rgba(0,0,0,0.3) 100%)';
      border = '1px solid rgba(205,127,50,0.4)'; shadow = '0 4px 10px rgba(205,127,50,0.1)'; icon = '🥉';
    }

    if (eliminado) {
      bg = 'rgba(255, 51, 51, 0.05)'; border = '1px dashed rgba(255, 51, 51, 0.3)';
      shadow = 'none'; color = '#ff6666'; icon = '☠️'; decor = 'line-through'; 
      op = posRealInfo ? 0.9 : 0.6; 
      filter = posRealInfo ? 'none' : 'grayscale(100%)';
    } else if (acertou) {
      border = '1px solid #00ff66';
      shadow = '0 0 15px rgba(0, 255, 102, 0.3), inset 0 0 10px rgba(0, 255, 102, 0.1)';
      bg = 'linear-gradient(180deg, rgba(0,255,102,0.1) 0%, rgba(0,0,0,0.4) 100%)';
    }

    return { bg, border, shadow, color, icon, decor, op, filter };
  };

  const styleP1 = getEstiloPodio('ouro', acertouP1, elimP1, infoRealP1);
  const styleP2 = getEstiloPodio('prata', acertouP2, elimP2, infoRealP2);
  const styleP3 = getEstiloPodio('bronze', acertouP3, elimP3, infoRealP3);

  // =========================================================================
  // RENDERIZADOR DE PALPITES DOS GRUPOS
  // =========================================================================
  const renderPalpiteGrupo = (chute, posicao, letraGrupo) => {
    const baseStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '5px 8px',
      borderRadius: '4px',
      marginBottom: '4px',
      fontSize: '0.8rem',
      lineHeight: 1.2
    };

    if (!chute) {
      return (
        <div style={{ ...baseStyle, background: 'rgba(255,255,255,0.03)' }}>
          <span style={{ color: '#666' }}>{posicao}º: Não enviado</span>
        </div>
      );
    }

    const p1Oficial = gruposOficiais[letraGrupo]?.p1;
    const p2Oficial = gruposOficiais[letraGrupo]?.p2;
    
    if (!p1Oficial || !p2Oficial) {
      return (
        <div style={{ ...baseStyle, background: 'rgba(255,255,255,0.03)' }}>
          <span style={{ color: '#ccc' }}>
            <strong style={{ color: '#888', marginRight: '4px' }}>{posicao}º</strong> {chute}
          </span>
        </div>
      );
    }

    const acertouExato = isAcerto(chute, posicao === 1 ? p1Oficial : p2Oficial);
    const acertouOutraPosicao = isAcerto(chute, posicao === 1 ? p2Oficial : p1Oficial);

    if (acertouExato) {
      return (
        <div style={{ ...baseStyle, background: 'rgba(0, 255, 102, 0.08)', borderLeft: '2px solid #00ff66' }}>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>
            <strong style={{ color: '#00ff66', opacity: 0.8, marginRight: '4px' }}>{posicao}º</strong> {chute}
          </span>
          <span style={{ color: '#00ff66', fontWeight: 'bold', fontSize: '0.9rem' }}>✓</span>
        </div>
      );
    } 
    
    if (acertouOutraPosicao) {
      return (
        <div style={{ ...baseStyle, background: 'rgba(251, 191, 36, 0.08)', borderLeft: '2px solid #fbbf24' }}>
          <span style={{ color: '#fff' }}>
            <strong style={{ color: '#fbbf24', opacity: 0.8, marginRight: '4px' }}>{posicao}º</strong> {chute}
          </span>
          <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '1rem', lineHeight: 1 }}>⇆</span>
        </div>
      );
    }

    return (
      <div style={{ ...baseStyle, background: 'rgba(255, 51, 51, 0.05)', borderLeft: '2px solid #ff6666' }}>
        <span style={{ color: '#aaa' }}>
          <strong style={{ color: '#ff6666', opacity: 0.8, marginRight: '4px' }}>{posicao}º</strong> {chute}
        </span>
        <span style={{ color: '#ff6666', fontWeight: 'bold', fontSize: '0.9rem' }}>✕</span>
      </div>
    );
  };

  return (
    <div className="modal-detalhes-astronauta" onClick={onFechar}>
      <div className="modal-detalhes-content" style={{ maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-detalhes-fechar" onClick={onFechar}>✕</button>
        <h3 style={{ color: 'var(--galaxy-gold)', marginBottom: 15, fontSize: '1.25rem' }}>
          📊 Telemetria: {palpite.nome}
        </h3>

        <strong style={{ color: 'var(--galaxy-gold)', display: 'block', marginBottom: 12, fontSize: '0.9rem' }}>
          👑 Pódio Chutado
        </strong>
        
        {deveBloquear ? (
          <div style={{ background: 'rgba(255, 204, 0, 0.04)', border: '1px dashed var(--galaxy-gold)', borderRadius: '8px', padding: '15px', textAlign: 'center', marginBottom: '20px', boxShadow: '0 4px 15px rgba(255, 204, 0, 0.02)' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '6px' }}>🔒</span>
            <strong style={{ color: 'var(--galaxy-gold)', display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>CONTEÚDO CRIPTOGRAFADO</strong>
            <p style={{ color: '#aaa', fontSize: '0.8rem', margin: 0, lineHeight: 1.4, whiteSpace: 'normal', wordWrap: 'break-word' }}>
              Conteúdo restrito. <strong style={{ color: '#fff' }}>Envie o seu próprio pódio</strong> para desbloquear a visão dos concorrentes!
            </p>
          </div>
        ) : dadosPodio && (dadosPodio.p1 || dadosPodio.p2 || dadosPodio.p3) ? (
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            
            {/* CARD 1º LUGAR */}
            <div style={{ flex: 1, background: styleP1.bg, border: styleP1.border, borderRadius: '8px', padding: '12px 5px', textAlign: 'center', opacity: styleP1.op, filter: styleP1.filter, transition: 'all 0.5s ease', boxShadow: styleP1.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '6px' }}>{styleP1.icon}</span>
              <span style={{ color: styleP1.color, fontSize: '0.8rem', fontWeight: 'bold', textDecoration: styleP1.decor }}>{dadosPodio.p1 || '-'}</span>
              {elimP1 && infoRealP1 && (
                <div style={{ marginTop: '8px', padding: '2px 6px', background: infoRealP1.bg, borderRadius: '4px', fontSize: '0.65rem', color: infoRealP1.color, border: `1px solid ${infoRealP1.border}`, whiteSpace: 'nowrap' }}>
                  {infoRealP1.texto} {infoRealP1.medal}
                </div>
              )}
            </div>

            {/* CARD 2º LUGAR */}
            <div style={{ flex: 1, background: styleP2.bg, border: styleP2.border, borderRadius: '8px', padding: '12px 5px', textAlign: 'center', opacity: styleP2.op, filter: styleP2.filter, transition: 'all 0.5s ease', boxShadow: styleP2.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '6px' }}>{styleP2.icon}</span>
              <span style={{ color: styleP2.color, fontSize: '0.8rem', fontWeight: 'bold', textDecoration: styleP2.decor }}>{dadosPodio.p2 || '-'}</span>
              {elimP2 && infoRealP2 && (
                <div style={{ marginTop: '8px', padding: '2px 6px', background: infoRealP2.bg, borderRadius: '4px', fontSize: '0.65rem', color: infoRealP2.color, border: `1px solid ${infoRealP2.border}`, whiteSpace: 'nowrap' }}>
                  {infoRealP2.texto} {infoRealP2.medal}
                </div>
              )}
            </div>

            {/* CARD 3º LUGAR */}
            <div style={{ flex: 1, background: styleP3.bg, border: styleP3.border, borderRadius: '8px', padding: '12px 5px', textAlign: 'center', opacity: styleP3.op, filter: styleP3.filter, transition: 'all 0.5s ease', boxShadow: styleP3.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '6px' }}>{styleP3.icon}</span>
              <span style={{ color: styleP3.color, fontSize: '0.8rem', fontWeight: 'bold', textDecoration: styleP3.decor }}>{dadosPodio.p3 || '-'}</span>
              {elimP3 && infoRealP3 && (
                <div style={{ marginTop: '8px', padding: '2px 6px', background: infoRealP3.bg, borderRadius: '4px', fontSize: '0.65rem', color: infoRealP3.color, border: `1px solid ${infoRealP3.border}`, whiteSpace: 'nowrap' }}>
                  {infoRealP3.texto} {infoRealP3.medal}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: 12, borderRadius: 6, border: '1px solid rgba(0,102,255,0.15)', textAlign: 'center', color: '#888', fontSize: '0.85rem', marginBottom: '20px' }}>
            Nenhum pódio enviado por este astronauta.
          </div>
        )}

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 0 15px' }} />
        
        <strong style={{ color: 'var(--galaxy-gold)', display: 'block', marginBottom: 12, fontSize: '0.9rem' }}>📋 Palpites Grupos</strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {LETRAS_GRUPOS.map((letra) => {
            const g = palpite.grupos?.[letra];
            return (
              <div key={letra} style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: 6, border: '1px solid rgba(0,102,255,0.15)' }}>
                <strong style={{ color: 'var(--galaxy-gold)', display: 'block', marginBottom: 6, fontSize: '0.85rem' }}>Grupo {letra}</strong>
                {g ? (
                  <>
                    {renderPalpiteGrupo(g[0], 1, letra)}
                    {renderPalpiteGrupo(g[1], 2, letra)}
                  </>
                ) : (
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>Não enviado</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}