import { useState } from 'react';
import { AlertProvider } from './context/AlertContext.jsx';
import StarsBackground from './components/StarsBackground.jsx';
import Header from './components/Header.jsx';
import SpaceAlert from './components/SpaceAlert.jsx';
import PainelLateralJogos from './components/PainelLateralJogos.jsx';
import AbaHome from './components/tabs/AbaHome.jsx';
import AbaPalpites from './components/tabs/AbaPalpites.jsx';
import AbaPodio from './components/tabs/AbaPodio.jsx';
import AbaRanking from './components/tabs/AbaRanking.jsx';
import AbaConfrontos from './components/tabs/AbaConfrontos.jsx'; // <-- 1. IMPORTAMOS A ABA AQUI
import AbaGruposReais from './components/tabs/AbaGruposReais.jsx';
import AbaAdmin from './components/AbaAdmin.jsx';

const IS_ADMIN = window.location.pathname === '/adminrafael';

// Identidade única compartilhada entre Classificados, Pódio Final e Classificação —
// identificar-se em qualquer uma dessas abas vale para as outras duas.
const MEU_NOME_KEY = 'bolao_meu_nome';
// Chaves legadas (de antes da identidade ser unificada) usadas só para recuperar
// o nome de quem já tinha se identificado no Pódio nesta mesma sessão/navegador.
const NOME_PODIO_KEY_LEGADO = 'bolao_podio_nome';

function nomeInicial() {
  return localStorage.getItem(MEU_NOME_KEY) ?? localStorage.getItem(NOME_PODIO_KEY_LEGADO) ?? '';
}

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('home');
  const [meuNome, setMeuNome] = useState(nomeInicial);
  const identificado = meuNome.trim().length > 0;

  function identificar(nome) {
    const limpo = nome.trim();
    if (!limpo) return;
    localStorage.setItem(MEU_NOME_KEY, limpo);
    setMeuNome(limpo);
  }

  function handleMudarAba(aba) {
    if (aba === 'ranking' && !identificado) return;
    setAbaAtiva(aba);
  }

  if (IS_ADMIN) {
    return (
      <>
        <StarsBackground />
        <AbaAdmin />
      </>
    );
  }

  return (
    <AlertProvider>
      <StarsBackground />

      <Header abaAtiva={abaAtiva} onMudarAba={handleMudarAba} identificado={identificado} />

      <main>
        {abaAtiva === 'home' && <AbaHome />}
        {abaAtiva === 'palpites' && <AbaPalpites meuNome={meuNome} onIdentificar={identificar} />}
        {abaAtiva === 'podio' && <AbaPodio meuNome={meuNome} onIdentificar={identificar} />}
        {abaAtiva === 'ranking' && identificado && <AbaRanking meuNome={meuNome} />}
        {abaAtiva === 'confrontos' && <AbaConfrontos />} {/* <-- 2. EXIBIMOS A ABA AQUI */}
        {abaAtiva === 'gruposreais' && <AbaGruposReais />}
      </main>

      <PainelLateralJogos />

      <footer>
        <p>&copy; Zhavia Aerospace &amp; Esportes. Todos os direitos reservados à tripulação.</p>
      </footer>

      <SpaceAlert />
    </AlertProvider>
  );
}
