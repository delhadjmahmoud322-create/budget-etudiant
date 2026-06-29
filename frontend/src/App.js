import { useState } from 'react';
import Connexion from './pages/Connexion';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [connecte, setConnecte] = useState(!!localStorage.getItem('token'));

  const handleConnexion = () => setConnecte(true);
  const handleDeconnexion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nom');
    localStorage.removeItem('prenom');
    setConnecte(false);
  };

  return connecte
    ? <Dashboard onDeconnexion={handleDeconnexion} />
    : <Connexion onConnexion={handleConnexion} />;
}