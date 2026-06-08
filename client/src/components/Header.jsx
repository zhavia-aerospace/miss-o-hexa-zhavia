export default function Header({ abaAtiva, onMudarAba }) {
  return (
    <header>
      <div className="logo-zhavia">Zhavia Aerospace</div>
      <h1>Supercopa Zhavia</h1>
      <div className="subtitle">🚀 Órbita da Vitória • Copa do Mundo 🌌</div>

      <nav className="space-nav">
        {[
          { id: 'home', label: '🛸 1. Diretrizes' },
          { id: 'palpites', label: '🔮 2. Classificados' },
          { id: 'podio', label: '👑 3. Pódio Final' },
          { id: 'ranking', label: '🏆 4. Classificação' },
        ].map((aba) => (
          <button
            key={aba.id}
            className={`nav-btn${abaAtiva === aba.id ? ' active' : ''}`}
            onClick={() => onMudarAba(aba.id)}
          >
            {aba.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
