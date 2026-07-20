import ContagemRegressiva from './ContagemRegressiva.jsx';

export default function Header({ abaAtiva, onMudarAba, identificado }) {
  const abas = [
    { id: 'home', label: '🛸 1. Diretrizes' },
    { id: 'palpites', label: '🔮 2. Classificados' },
    { id: 'podio', label: '👑 3. Pódio Final' },
    { id: 'ranking', label: '🏆 4. Classificação', bloqueada: !identificado },
    { id: 'confrontos', label: '⚔️ 5. Confrontos' },
    { id: 'gruposreais', label: '📊 6. Grupos e Chaveamento Real' },
  ];

  return (
    <header>
      <div className="logo-zhavia">Zhavia Aerospace</div>
      <h1>Supercopa Zhavia</h1>
      <div className="subtitle">🚀 Órbita da Vitória • Copa do Mundo 🌌</div>

      {/* ⏳ RELÓGIO DE LANÇAMENTO COMPACTO */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px', marginBottom: '5px' }}>
        <ContagemRegressiva 
          dataAlvo="2030-06-08T16:00:00Z" 
          titulo="Missão 2030" 
          compacto={true} 
        />
      </div>

      <nav className="space-nav" style={{ marginTop: '15px' }}>
        {abas.map((aba) => (
          <button
            key={aba.id}
            className={`nav-btn${abaAtiva === aba.id ? ' active' : ''}${aba.bloqueada ? ' locked' : ''}`}
            onClick={() => !aba.bloqueada && onMudarAba(aba.id)}
            disabled={aba.bloqueada}
            title={aba.bloqueada ? 'Identifique-se em Classificados ou Pódio Final para liberar o ranking!' : undefined}
          >
            {aba.bloqueada ? '🔒 4. Classificação' : aba.label}
          </button>
        ))}
      </nav>
    </header>
  );
}