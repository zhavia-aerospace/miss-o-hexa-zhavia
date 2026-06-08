export default function AbaHome() {
  return (
    <section className="tab-content">
      <div className="cosmic-panel" style={{ textAlign: 'center' }}>
        <h2>🪐 Missão Supercopa Zhavia: Comando de Bordo</h2>
        <p style={{ fontSize: '1.15rem', lineHeight: 1.6, maxWidth: 800, margin: '0 auto' }}>
          Bem-vindos ao nosso bolão! Hora de colocar seus conhecimentos futebolísticos à prova (ou contar com a sorte mesmo 😃). Preparem seus telescópios e alinhem suas rotas para a maior competição do universo!
        </p>
      </div>

      {/* Etapa 1 */}
      <div className="cosmic-panel" style={{ borderColor: 'var(--cosmic-blue)' }}>
        <h2 style={{ color: '#fff' }}>
          <span style={{ fontSize: '1.6rem', marginRight: 5 }}>⚽</span> Etapa 1 – Fase de Grupos
        </h2>
        <p style={{ marginBottom: 20, color: '#ccc', fontSize: '1.05rem' }}>
          Cada participante deverá acessar a aba <strong>"2. Classificados"</strong>, inserir seu nome e indicar os <strong>2 classificados de cada um dos 12 grupos</strong>.
        </p>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: 15, borderRadius: 8, marginBottom: 20, borderLeft: '3px solid var(--cosmic-blue)' }}>
          <h3 style={{ color: 'var(--nebula-green)', fontSize: '1.1rem', marginBottom: 10 }}>📊 Sistema de Pontuação:</h3>
          <p style={{ marginBottom: 8 }}>✅ Acertou <strong>um</strong> dos classificados: <span style={{ color: 'var(--nebula-green)', fontWeight: 'bold' }}>4 pontos</span></p>
          <p style={{ marginBottom: 8 }}>✅✅ Acertou os <strong>dois</strong> classificados: <span style={{ color: 'var(--nebula-green)', fontWeight: 'bold' }}>8 pontos</span></p>
          <p style={{ marginBottom: 8 }}>🎯 Acertou a <strong>ordem exata</strong> (1º e 2º lugar): <span style={{ color: 'var(--galaxy-gold)', fontWeight: 'bold' }}>Bônus de 2 pontos</span></p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 15, borderRadius: 8, fontSize: '0.95rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <span style={{ color: 'var(--galaxy-gold)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: 1, display: 'block', marginBottom: 5 }}>💡 Exemplo de Telemetria:</span>
          Acertar dois classificados + ordem correta: 8 + 2 = <strong style={{ color: 'var(--nebula-green)' }}>10 pontos no grupo</strong>.
        </div>

        <div style={{ marginTop: 20, textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--galaxy-gold)' }}>
          🏅 Pontuação máxima da fase de grupos: <span style={{ fontSize: '1.3rem' }}>120 pontos</span>
        </div>
      </div>

      {/* Etapa 2 */}
      <div className="cosmic-panel" style={{ borderColor: '#ff3333', opacity: 0.85 }}>
        <h2 style={{ color: '#fff' }}>
          <span style={{ fontSize: '1.6rem', marginRight: 5 }}>🏆</span> Etapa 2 – Pódio Final
        </h2>
        <p style={{ marginBottom: 20, color: '#ccc', fontSize: '1.05rem' }}>
          Nesta fase (liberada nas Oitavas de Final), você escolhe o pódio supremo da Copa:
        </p>
        <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap', marginBottom: 20 }}>
          {[
            { ico: '🥇', label: '1º Lugar (Campeão)', pts: 25, cor: 'var(--galaxy-gold)', bg: 'rgba(255,204,0,0.05)', border: 'var(--galaxy-gold)' },
            { ico: '🥈', label: '2º Lugar (Vice)', pts: 15, cor: '#ddd', bg: 'rgba(255,255,255,0.03)', border: '#aaa' },
            { ico: '🥉', label: '3º Lugar', pts: 10, cor: '#b87333', bg: 'rgba(184,115,51,0.05)', border: '#b87333' },
          ].map(({ ico, label, pts, cor, bg, border }) => (
            <div key={label} style={{ flex: 1, minWidth: 150, background: bg, padding: 15, borderRadius: 8, border: `1px solid ${border}`, textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: 5 }}>{ico}</span>
              <strong style={{ color: cor }}>{label}</strong>
              <p style={{ marginTop: 5, fontSize: '1.1rem', fontWeight: 'bold' }}>{pts} pontos</p>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: 15, borderRadius: 8, borderLeft: '3px solid #ff3333' }}>
          🎯 <strong>Bônus Especial:</strong> Acertou a ordem completa do pódio: <span style={{ color: 'var(--nebula-green)', fontWeight: 'bold' }}>+5 pontos</span>
        </div>
        <div style={{ marginTop: 20, textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--galaxy-gold)' }}>
          🏅 Pontuação máxima da etapa final: <span style={{ fontSize: '1.3rem' }}>55 pontos</span>
        </div>
      </div>

      {/* Total */}
      <div className="cosmic-panel" style={{ background: 'linear-gradient(135deg, var(--space-panel) 0%, rgba(0,102,255,0.1) 100%)', borderColor: 'var(--galaxy-gold)', textAlign: 'center', padding: 30 }}>
        <h2 style={{ justifyContent: 'center', borderLeft: 'none', paddingLeft: 0, fontSize: '1.8rem', marginBottom: 10 }}>📊 Cota Máxima da Missão</h2>
        <p style={{ color: '#aaa', marginBottom: 15, fontSize: '1.05rem' }}>A soma de toda a telemetria do torneio:</p>
        <div style={{ display: 'inline-flex', gap: 30, fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 15, marginBottom: 15 }}>
          <span>🪐 Grupos: <span style={{ color: '#fff' }}>120 pts</span></span>
          <span>👑 Pódio: <span style={{ color: '#fff' }}>55 pts</span></span>
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--galaxy-gold)', textShadow: '0 0 10px rgba(255,204,0,0.3)' }}>
          🏆 TOTAL MÁXIMO POSSÍVEL: 175 PONTOS
        </div>
        <p style={{ marginTop: 25, fontStyle: 'italic', color: 'var(--nebula-green)', fontSize: '1.1rem' }}>
          Boa sorte a todos! Que vença os melhores palpites (ou os mais sortudos)! 🍀⚽
        </p>
      </div>
    </section>
  );
}
