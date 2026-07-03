import { LETRAS_GRUPOS } from '../data/grupos.js';

export default function DetalhesAstronauta({ palpite, podio, meuNome, listaPodios = [], onFechar }) {
  if (!palpite) return null;

  const dadosPodio = podio || palpite.podio;

 // =========================================================================
  // MÁGICA DA TRAVA VISUAL (100% FRONT-END)
  // =========================================================================
  // 1. O usuário já se identificou no site?
  const temNome = meuNome && meuNome.trim().length > 0;
  
  // 2. Verifica se o usuário atual está olhando para o seu próprio card
  const isOlhandoParaMimMesmo = temNome && palpite.nome.trim().toLowerCase() === meuNome.trim().toLowerCase();
  
  // 3. Verifica se o usuário atual já enviou o pódio dele (se existe na lista)
  const euJaEnvieiPodio = temNome && listaPodios.some(p => p.nome.trim().toLowerCase() === meuNome.trim().toLowerCase());
  
  // 4. REGRA CORRIGIDA: Se tivermos pódios no sistema, bloqueia se a pessoa NÃO for a dona do card E (não enviou pódio OU nem se identificou ainda)
  const deveBloquear = listaPodios.length > 0 && !isOlhandoParaMimMesmo && !euJaEnvieiPodio;

  return (
    <div className="modal-detalhes-astronauta" onClick={onFechar}>
      
      <div 
        className="modal-detalhes-content" 
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-detalhes-fechar" onClick={onFechar}>✕</button>
        <h3 style={{ color: 'var(--galaxy-gold)', marginBottom: 15, fontSize: '1.25rem' }}>
          📊 Telemetria: {palpite.nome}
        </h3>

        <strong style={{ color: 'var(--galaxy-gold)', display: 'block', marginBottom: 12, fontSize: '0.9rem' }}>
          👑 Pódio Chutado
        </strong>
        
        {/* CASO 1: SISTEMA BLOQUEADO (Usuário não enviou o pódio dele ainda) */}
        {deveBloquear ? (
          <div style={{ 
            background: 'rgba(255, 204, 0, 0.04)', 
            border: '1px dashed var(--galaxy-gold)', 
            borderRadius: '8px', 
            padding: '15px', 
            textAlign: 'center', 
            marginBottom: '20px',
            boxShadow: '0 4px 15px rgba(255, 204, 0, 0.02)'
          }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '6px' }}>🔒</span>
            <strong style={{ color: 'var(--galaxy-gold)', display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>
              CONTEÚDO CRIPTOGRAFADO
            </strong>
            <p style={{ color: '#aaa', fontSize: '0.8rem', margin: 0, lineHeight: 1.4, whiteSpace: 'normal', wordWrap: 'break-word' }}>
              Conteúdo restrito. <strong style={{ color: '#fff' }}>Envie o seu próprio pódio</strong> para desbloquear a visão dos concorrentes!
            </p>
          </div>
        ) : dadosPodio && (dadosPodio.p1 || dadosPodio.p2 || dadosPodio.p3) ? (
          /* CASO 2: DESBLOQUEADO - MOSTRA O PÓDIO NORMALMENTE */
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {/* 1º Lugar - Ouro */}
            <div style={{ flex: 1, background: 'linear-gradient(180deg, rgba(251,191,36,0.15) 0%, rgba(0,0,0,0.3) 100%)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: '8px', padding: '12px 5px', textAlign: 'center', boxShadow: '0 4px 10px rgba(251,191,36,0.1)' }}>
              <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '6px' }}>🥇</span>
              <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>{dadosPodio.p1 || '-'}</span>
            </div>
            
            {/* 2º Lugar - Prata */}
            <div style={{ flex: 1, background: 'linear-gradient(180deg, rgba(209,209,209,0.15) 0%, rgba(0,0,0,0.3) 100%)', border: '1px solid rgba(209,209,209,0.4)', borderRadius: '8px', padding: '12px 5px', textAlign: 'center', boxShadow: '0 4px 10px rgba(209,209,209,0.1)' }}>
              <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '6px' }}>🥈</span>
              <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>{dadosPodio.p2 || '-'}</span>
            </div>
            
            {/* 3º Lugar - Bronze */}
            <div style={{ flex: 1, background: 'linear-gradient(180deg, rgba(205,127,50,0.15) 0%, rgba(0,0,0,0.3) 100%)', border: '1px solid rgba(205,127,50,0.4)', borderRadius: '8px', padding: '12px 5px', textAlign: 'center', boxShadow: '0 4px 10px rgba(205,127,50,0.1)' }}>
              <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '6px' }}>🥉</span>
              <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>{dadosPodio.p3 || '-'}</span>
            </div>
          </div>
        ) : (
          /* CASO 3: DESBLOQUEADO, MAS A PESSOA NÃO VOTOU */
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: 12, borderRadius: 6, border: '1px solid rgba(0,102,255,0.15)', textAlign: 'center', color: '#888', fontSize: '0.85rem', marginBottom: '20px' }}>
            Nenhum pódio enviado por este astronauta.
          </div>
        )}

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 0 15px' }} />
        
        {/* === PALPITES DE GRUPOS (Sempre visíveis conforme o seu Radar) === */}
        <strong style={{ color: 'var(--galaxy-gold)', display: 'block', marginBottom: 12, fontSize: '0.9rem' }}>
          📋 Palpites Grupos
        </strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {LETRAS_GRUPOS.map((letra) => {
            const g = palpite.grupos?.[letra];
            return (
              <div key={letra} style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: 6, border: '1px solid rgba(0,102,255,0.15)' }}>
                <strong style={{ color: 'var(--galaxy-gold)', display: 'block', marginBottom: 6, fontSize: '0.85rem' }}>
                  Grupo {letra}
                </strong>
                {g ? (
                  <>
                    <span style={{ color: '#fff', fontSize: '0.8rem', display: 'block', lineHeight: 1.4 }}>1º: {g[0]}</span>
                    <span style={{ color: '#fff', fontSize: '0.8rem', display: 'block', lineHeight: 1.4 }}>2º: {g[1]}</span>
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