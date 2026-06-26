import { useEffect, useState } from 'react';
import { getGruposReais } from '../../services/api.js';

const CLASSIFICADOS_3OS = 8;

export default function AbaGruposReais() {
  const [grupos, setGrupos] = useState([]);
  const [terceiros, setTerceiros] = useState([]);
  const [mataMata, setMataMata] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    getGruposReais()
      .then((res) => {
        setGrupos(res.data?.grupos ?? []);
        setTerceiros(res.data?.terceiros ?? []);
        setMataMata(res.data?.mataMata ?? []);
      })
      .catch(() => setErro('❌ Falha ao buscar a tabela real da Copa.'))
      .finally(() => setCarregando(false));
  }, []);

  const nomesClassificados3os = new Set(
    terceiros.slice(0, CLASSIFICADOS_3OS).map((t) => t.time.nome)
  );

  function corPosicao(posicao, nomeTime) {
    if (posicao === 1 || posicao === 2) return 'var(--nebula-green)';
    if (posicao === 3) return nomesClassificados3os.has(nomeTime) ? 'var(--galaxy-gold)' : '#666';
    return '#666';
  }

  return (
    <section className="tab-content">
      <div className="cosmic-panel">
        <h2>📊 Fase de Grupos — Tabela Real</h2>
        <p style={{ color: '#aaa', marginBottom: 20 }}>
          Classificação real da Copa do Mundo, atualizada direto da fonte oficial.
        </p>

        {carregando ? (
          <p style={{ color: 'var(--nebula-green)', textAlign: 'center', padding: 30 }}>🛰️ Sincronizando com a base...</p>
        ) : erro ? (
          <p style={{ color: '#ff6666', textAlign: 'center', padding: 30 }}>{erro}</p>
        ) : grupos.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: 30 }}>Nenhum dado disponível ainda.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: 20 }}>
            {grupos.map((g) => (
              <div key={g.grupo} style={{ border: '1px solid rgba(0,102,255,0.2)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ background: 'rgba(0,102,255,0.1)', padding: '10px 14px' }}>
                  <strong style={{ color: 'var(--galaxy-gold)' }}>Grupo {g.grupo}</strong>
                </div>
                <div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#888' }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left' }}>#</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left' }}>Seleção</th>
                        <th style={{ padding: '8px 6px' }}>P</th>
                        <th style={{ padding: '8px 6px' }}>J</th>
                        <th style={{ padding: '8px 6px' }}>V</th>
                        <th style={{ padding: '8px 6px' }}>E</th>
                        <th style={{ padding: '8px 6px' }}>D</th>
                        <th style={{ padding: '8px 6px' }}>SG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.tabela.map((linha) => (
                        <tr key={linha.time.nome} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 'bold', color: corPosicao(linha.posicao, linha.time.nome) }}>{linha.posicao}º</td>
                          <td style={{ padding: '8px 10px', color: '#fff', whiteSpace: 'nowrap' }}>
                            {linha.time.escudo && <img src={linha.time.escudo} alt="" style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} />}
                            {linha.time.nome}
                          </td>
                          <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 'bold', color: '#fff' }}>{linha.pontos}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'center', color: '#aaa' }}>{linha.jogos}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'center', color: '#aaa' }}>{linha.vitorias}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'center', color: '#aaa' }}>{linha.empates}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'center', color: '#aaa' }}>{linha.derrotas}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'center', color: '#aaa' }}>{linha.saldoGols}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!carregando && !erro && terceiros.length > 0 && (
        <div className="cosmic-panel">
          <h2>🏆 Ranking dos 3º Colocados</h2>
          <p style={{ color: '#aaa', marginBottom: 20 }}>
            Os {CLASSIFICADOS_3OS} melhores terceiros colocados garantem vaga na fase de mata-mata.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>RNK</th>
                  <th>Seleção</th>
                  <th>Grupo</th>
                  <th>PTS</th>
                  <th>SG</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {terceiros.map((t, i) => (
                  <tr key={t.grupo}>
                    <td style={{ fontWeight: 'bold', color: 'var(--galaxy-gold)' }}>{i + 1}º</td>
                    <td style={{ fontWeight: 'bold', color: '#fff' }}>
                      {t.time.escudo && <img src={t.time.escudo} alt="" style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} />}
                      {t.time.nome}
                    </td>
                    <td>Grupo {t.grupo}</td>
                    <td>{t.pontos}</td>
                    <td>{t.saldoGols}</td>
                    <td>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: 12,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          background: i < CLASSIFICADOS_3OS ? 'rgba(0,255,102,0.15)' : 'rgba(255,51,51,0.15)',
                          color: i < CLASSIFICADOS_3OS ? 'var(--nebula-green)' : '#ff5555',
                        }}
                      >
                        {i < CLASSIFICADOS_3OS ? 'CLASSIFICADO' : 'ELIMINADO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!carregando && !erro && mataMata.length > 0 && (
        <div className="cosmic-panel">
          <h2>⚔️ Chaveamento Real do Mata-Mata</h2>
          <p style={{ color: '#aaa', marginBottom: 20 }}>
            Confrontos reais da Copa, atualizados conforme a fase de grupos definir os classificados.
          </p>

          {mataMata.map(({ fase, jogos }) => (
            <div key={fase} style={{ marginBottom: 30 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <h3 style={{ margin: 0, color: 'var(--galaxy-gold)', fontSize: '1.1rem', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {fase}
                </h3>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,204,0,0.4) 0%, transparent 100%)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 14 }}>
                {jogos.map((jogo) => {
                  const homeNome = jogo.home?.nome ?? 'A definir';
                  const awayNome = jogo.away?.nome ?? 'A definir';
                  const venceuHome = jogo.vencedor && jogo.vencedor === homeNome;
                  const venceuAway = jogo.vencedor && jogo.vencedor === awayNome;
                  return (
                    <div
                      key={jogo.id}
                      style={{
                        border: jogo.vencedor ? '1px solid rgba(0,255,102,0.3)' : '1px solid rgba(0,102,255,0.2)',
                        borderRadius: 8,
                        padding: 12,
                        background: jogo.vencedor ? 'rgba(0,255,102,0.05)' : 'rgba(0,0,0,0.2)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px', fontWeight: venceuHome ? 'bold' : 'normal', color: venceuHome ? 'var(--nebula-green)' : '#fff' }}>
                        <span>
                          {jogo.home?.escudo && <img src={jogo.home.escudo} alt="" style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} />}
                          {homeNome}
                        </span>
                        <span>{jogo.placarHome ?? ''}{venceuHome && ' 🏆'}</span>
                      </div>
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '2px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px', fontWeight: venceuAway ? 'bold' : 'normal', color: venceuAway ? 'var(--nebula-green)' : '#fff' }}>
                        <span>
                          {jogo.away?.escudo && <img src={jogo.away.escudo} alt="" style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} />}
                          {awayNome}
                        </span>
                        <span>{jogo.placarAway ?? ''}{venceuAway && ' 🏆'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
