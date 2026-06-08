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

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('home');

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

      <Header abaAtiva={abaAtiva} onMudarAba={setAbaAtiva} />

      <main>
        {abaAtiva === 'home' && <AbaHome />}
        {abaAtiva === 'palpites' && <AbaPalpites />}
        {abaAtiva === 'podio' && <AbaPodio />}
        {abaAtiva === 'ranking' && <AbaRanking />}
      </main>

      <PainelLateralJogos />

      <footer>
        <p>&copy; Zhavia Aerospace &amp; Esportes. Todos os direitos reservados à tripulação.</p>
      </footer>

      <SpaceAlert />
    </AlertProvider>
  );
}
