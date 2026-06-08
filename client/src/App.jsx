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
import AbaAdmin from './components/AbaAdmin.jsx';

const IS_ADMIN = window.location.pathname === '/adminrafael';
const JA_ENVIOU_KEY = 'bolao_hexa_enviado';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('home');
  const [jaEnviou, setJaEnviou] = useState(() => localStorage.getItem(JA_ENVIOU_KEY) === 'true');

  function handleMudarAba(aba) {
    if (aba === 'ranking' && !jaEnviou) return;
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

      <Header abaAtiva={abaAtiva} onMudarAba={handleMudarAba} jaEnviou={jaEnviou} />

      <main>
        {abaAtiva === 'home' && <AbaHome />}
        {abaAtiva === 'palpites' && <AbaPalpites onPalpiteEnviado={() => setJaEnviou(true)} />}
        {abaAtiva === 'podio' && <AbaPodio />}
        {abaAtiva === 'ranking' && jaEnviou && <AbaRanking />}
      </main>

      <PainelLateralJogos />

      <footer>
        <p>&copy; Zhavia Aerospace &amp; Esportes. Todos os direitos reservados à tripulação.</p>
      </footer>

      <SpaceAlert />
    </AlertProvider>
  );
}
