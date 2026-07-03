import { LETRAS_GRUPOS } from '../data/grupos.js';

export default function DetalhesAstronauta({ palpite, podio, onFechar }) {
  if (!palpite) return null;

  // A MÁGICA DOS DADOS: Se a Aba 4 mandar o 'podio' separado, ele usa. 
  // Se a Aba 2 não mandar, ele pega o 'palpite.podio' que já vem do banco de dados!
  const dadosPodio = podio || palpite.podio;

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

        {/* === NOVO PÓDIO CHUTADO (OURO, PRATA E BRONZE) === */}
        <strong style={{ color: 'var(--galaxy-gold)', display: 'block', marginBottom: 12, fontSize: '0.9rem' }}>
          👑 Pódio Chutado
        </strong>
        
        {dadosPodio && (dadosPodio.p1 || dadosPodio.p2 || dadosPodio.p3) ? (
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
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: 12, borderRadius: 6, border: '1px solid rgba(0,102,255,0.15)', textAlign: 'center', color: '#888', fontSize: '0.85rem', marginBottom: '20px' }}>
            Nenhum pódio enviado por este astronauta.
          </div>
        )}

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 0 15px' }} />
        
        {/* === PALPITES DE GRUPOS === */}
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