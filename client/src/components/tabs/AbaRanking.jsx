import { useEffect, useState } from 'react';
import { getRanking, getPalpites } from '../../services/api.js';
import AvatarNome from '../AvatarNome.jsx';
import DetalhesAstronauta from '../DetalhesAstronauta.jsx';

export default function AbaRanking() {
  const [ranking, setRanking] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [palpites, setPalpites] = useState([]);
  const [astronautaSelecionado, setAstronautaSelecionado] = useState(null);

  useEffect(() => {
    getRanking()
      .then(setRanking)
      .catch(() => setErro('❌ Falha na conexão com o satélite de pontuação.'))
      .finally(() => setCarregando(false));
    getPalpites().then(setPalpites).catch(() => {});
  }, []);

  function abrirTelemetria(nomeAstronauta) {
    const palpite = palpites.find(
      (p) => p.nome.trim().toLowerCase() === nomeAstronauta.trim().toLowerCase()
    );
    if (palpite) setAstronautaSelecionado(palpite);
  }

  const CLASSE_PODIO = { 1: 'podio-1', 2: 'podio-2', 3: 'podio-3' };

  return (
    <section className="tab-content">
      <div className="cosmic-panel">
        <h2>🏆 Painel de Liderança</h2>
        <p style={{ color: '#aaa', marginBottom: 20 }}>
          Acompanhe as pontuações. Os dados são recalculados a cada atualização de gabarito na base!
        </p>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #222', textAlign: 'left' }}>
                <th style={{ padding: '12px 8px', color: 'var(--galaxy-gold)', fontSize: '1rem', width: '20%' }}>Posição 🪐</th>
                <th style={{ padding: '12px 8px', color: '#fff', fontSize: '1rem', width: '50%' }}>Astronauta 🛸</th>
                <th style={{ padding: '12px 8px', color: 'var(--nebula-green)', fontSize: '1rem', width: '30%', textAlign: 'right' }}>Pontuação Total 🏆</th>
              </tr>
            </thead>
              <tbody>
              {carregando && (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>Sincronizando com os satélites de pontuação...</td></tr>
              )}
              {!carregando && erro && (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#ff3333' }}>{erro}</td></tr>
              )}
              {!carregando && !erro && ranking.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>🛸 Aguardando computação de pontos na base...</td></tr>
              )}
              {!carregando && !erro && ranking.map((item) => (
                <tr
                  key={item._id}
                  className={`ranking-row-clicavel ${CLASSE_PODIO[item.posicao] ?? ''}`}
                  style={{ borderBottom: '1px solid #222', cursor: palpites.some((p) => p.nome.trim().toLowerCase() === item.astronauta.trim().toLowerCase()) ? 'pointer' : 'default' }}
                  onClick={() => abrirTelemetria(item.astronauta)}
                >
                  <td className="posicao-num" style={{ padding: '14px 8px', fontWeight: 'bold', color: 'var(--galaxy-gold)', fontSize: '1.1rem' }}>
                    {item.posicao}º
                  </td>
                  <td style={{ padding: '14px 8px', fontWeight: 'bold', color: '#fff' }}>
                    <AvatarNome nome={item.astronauta} size={36} fontSize="0.9rem" />
                  </td>
                  <td style={{ padding: '14px 8px', textAlign: 'right', fontWeight: 'bold', color: 'var(--nebula-green)', fontSize: '1.15rem' }}>
                    {item.pontuacao} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {astronautaSelecionado && (
        <DetalhesAstronauta
          palpite={astronautaSelecionado}
          onFechar={() => setAstronautaSelecionado(null)}
        />
      )}
    </section>
  );
}
