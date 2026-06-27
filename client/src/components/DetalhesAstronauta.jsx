import { LETRAS_GRUPOS } from '../data/grupos.js';

export default function DetalhesAstronauta({ palpite, podio, onFechar }) {
  if (!palpite) return null;

  return (
    // 1. Adicionamos o onClick={onFechar} na div de fora (o fundo escuro)
    <div className="modal-detalhes-astronauta" onClick={onFechar}>
      
      {/* 2. Adicionamos o stopPropagation na div de dentro (o cartão do modal) */}
      <div 
        className="modal-detalhes-content" 
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-detalhes-fechar" onClick={onFechar}>✕</button>
        <h3 style={{ color: 'var(--galaxy-gold)', marginBottom: 15, fontSize: '1.25rem' }}>
          📊 Telemetria de Palpites: {palpite.nome}
        </h3>

        <strong style={{ color: 'var(--galaxy-gold)', display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>
          👑 Pódio Chutado
        </strong>
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: 8, borderRadius: 6, border: '1px solid rgba(0,102,255,0.15)', maxWidth: 220 }}>
          {podio ? (
            <>
              <span style={{ color: 'var(--galaxy-gold)', fontSize: '0.75rem', display: 'block', lineHeight: 1.3 }}>🥇 {podio.p1}</span>
              <span style={{ color: '#d1d1d1', fontSize: '0.75rem', display: 'block', lineHeight: 1.3 }}>🥈 {podio.p2}</span>
              <span style={{ color: '#cd7f32', fontSize: '0.75rem', display: 'block', lineHeight: 1.3 }}>🥉 {podio.p3}</span>
            </>
          ) : (
            <span style={{ color: '#666', fontSize: '0.75rem' }}>Não enviado</span>
          )}
        </div>

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.05)', margin: '12px 0 10px' }} />
        
        <strong style={{ color: 'var(--galaxy-gold)', display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>
          📋 Palpites Grupos
        </strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 5 }}>
          {LETRAS_GRUPOS.map((letra) => {
            const g = palpite.grupos?.[letra];
            return (
              <div key={letra} style={{ background: 'rgba(0,0,0,0.25)', padding: 8, borderRadius: 6, border: '1px solid rgba(0,102,255,0.15)' }}>
                <strong style={{ color: 'var(--galaxy-gold)', display: 'block', marginBottom: 3, fontSize: '0.8rem' }}>
                  Grupo {letra}
                </strong>
                {g ? (
                  <>
                    <span style={{ color: '#fff', fontSize: '0.75rem', display: 'block', lineHeight: 1.3 }}>1º: {g[0]}</span>
                    <span style={{ color: '#fff', fontSize: '0.75rem', display: 'block', lineHeight: 1.3 }}>2º: {g[1]}</span>
                  </>
                ) : (
                  <span style={{ color: '#666', fontSize: '0.75rem' }}>Não enviado</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}