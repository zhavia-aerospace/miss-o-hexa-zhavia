import { createContext, useCallback, useContext, useState } from 'react';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alerta, setAlerta] = useState({ visivel: false, titulo: '', mensagem: '' });

  const mostrarAlerta = useCallback((mensagem, titulo = '⚠️ Alerta de Órbita') => {
    setAlerta({ visivel: true, titulo, mensagem });
  }, []);

  const fecharAlerta = useCallback(() => {
    setAlerta((prev) => ({ ...prev, visivel: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ alerta, mostrarAlerta, fecharAlerta }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerta() {
  return useContext(AlertContext);
}
