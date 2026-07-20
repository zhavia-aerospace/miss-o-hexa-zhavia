import { useState, useEffect } from 'react';

export default function ContagemRegressiva({ dataAlvo, titulo, compacto = false }) {
  const [tempo, setTempo] = useState({ dias: 0, horas: 0, min: 0, seg: 0 });

  useEffect(() => {
    const alvo = new Date(dataAlvo).getTime();

    const intervalo = setInterval(() => {
      const agora = new Date().getTime();
      const diferenca = alvo - agora;

      if (diferenca > 0) {
        setTempo({
          dias: Math.floor(diferenca / (1000 * 60 * 60 * 24)),
          horas: Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          min: Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60)),
          seg: Math.floor((diferenca % (1000 * 60)) / 1000)
        });
      } else {
        clearInterval(intervalo);
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [dataAlvo]);

  // ==============================================================
  // 🔭 VERSÃO DISCRETA (Ideal para ficar fixa no Header)
  // ==============================================================
  if (compacto) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '5px 12px', borderRadius: '20px', border: '1px solid rgba(251, 191, 36, 0.3)', color: 'var(--galaxy-gold)', whiteSpace: 'nowrap', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}>
        <span style={{ fontSize: '0.9rem' }}>⏳</span>
        <strong style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{titulo}:</strong>
        <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' }}>
          {String(tempo.dias).padStart(2, '0')}d {String(tempo.horas).padStart(2, '0')}h {String(tempo.min).padStart(2, '0')}m {String(tempo.seg).padStart(2, '0')}s
        </span>
      </div>
    );
  }

  // ==============================================================
  // 🚀 VERSÃO DE PAINEL (Para a AbaHome)
  // ==============================================================
  return (
    <div className="cosmic-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', borderLeft: '4px solid var(--galaxy-gold)', background: 'linear-gradient(90deg, rgba(251, 191, 36, 0.05) 0%, transparent 100%)', marginBottom: '30px' }}>
      <style>{`
        @keyframes blink-dot {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      
      <div>
        <h4 style={{ margin: '0 0 5px 0', color: 'var(--galaxy-gold)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <span style={{ width: '10px', height: '10px', background: 'var(--galaxy-gold)', borderRadius: '50%', display: 'inline-block', animation: 'blink-dot 1.5s infinite ease-in-out', boxShadow: '0 0 8px var(--galaxy-gold)' }}></span>
          {titulo}
        </h4>
        <span style={{ fontSize: '0.85rem', color: '#aaa' }}>Prepare os motores da sua nave para a próxima missão.</span>
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        {[
          { valor: tempo.dias, label: 'DIAS' },
          { valor: tempo.horas, label: 'HRS' },
          { valor: tempo.min, label: 'MIN' },
          { valor: tempo.seg, label: 'SEG' }
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '8px', minWidth: '65px', padding: '8px 5px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)' }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.5rem', fontFamily: 'monospace', textShadow: '0 0 5px rgba(255,255,255,0.3)' }}>
              {String(item.valor).padStart(2, '0')}
            </span>
            <span style={{ color: 'var(--galaxy-gold)', fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '1px', marginTop: '2px' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}