export default function Header({ abaAtiva, onMudarAba, jaEnviou }) {
  const abas = [
    { id: 'home', label: '🛸 1. Diretrizes' },
    { id: 'palpites', label: '🔮 2. Classificados' },
    { id: 'podio', label: '👑 3. Pódio Final' },
    { id: 'ranking', label: '🏆 4. Classificação', bloqueada: !jaEnviou },
  ];

  return (
    <header>
      <div className="logo-zhavia">Zhavia Aerospace</div>
      <h1>Supercopa Zhavia</h1>
      <div className="subtitle">🚀 Órbita da Vitória • Copa do Mundo 🌌</div>

      <nav className="space-nav">
        {abas.map((aba) => (
          <button
            key={aba.id}
            className={`nav-btn${abaAtiva === aba.id ? ' active' : ''}${aba.bloqueada ? ' locked' : ''}`}
            onClick={() => !aba.bloqueada && onMudarAba(aba.id)}
            disabled={aba.bloqueada}
            title={aba.bloqueada ? 'Envie seus palpites para liberar o ranking!' : undefined}
          >
            {aba.bloqueada ? '🔒 4. Classificação' : aba.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
