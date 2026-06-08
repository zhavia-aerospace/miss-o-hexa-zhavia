import { useAlerta } from '../context/AlertContext.jsx';

export default function SpaceAlert() {
  const { alerta, fecharAlerta } = useAlerta();

  if (!alerta.visivel) return null;

  return (
    <div
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.7)',
        zIndex: 9999,
        backdropFilter: 'blur(5px)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        className="cosmic-panel"
        style={{
          maxWidth: 450,
          width: '90%',
          textAlign: 'center',
          borderColor: 'var(--cosmic-blue)',
          boxShadow: '0 0 25px rgba(0,102,255,0.3)',
          animation: 'scaleUp 0.3s ease',
        }}
      >
        <h2
          style={{
            color: 'var(--galaxy-gold)',
            borderLeft: 'none',
            paddingLeft: 0,
            justifyContent: 'center',
            fontSize: '1.4rem',
          }}
        >
          {alerta.titulo}
        </h2>
        <p style={{ color: '#fff', margin: '15px 0 20px', lineHeight: 1.5, fontSize: '1.05rem' }}>
          {alerta.mensagem}
        </p>
        <button
          className="btn-orbit"
          style={{ maxWidth: 150, margin: '0 auto', padding: 8, borderRadius: 20, fontSize: '0.9rem' }}
          onClick={fecharAlerta}
        >
          Compreendido
        </button>
      </div>
    </div>
  );
}
