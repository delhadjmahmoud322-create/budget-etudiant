import { useState } from 'react';
import Connexion from './pages/Connexion';
import Dashboard from './pages/Dashboard';
import Budget from './pages/Budget';

export default function App() {
  const [connecte, setConnecte] = useState(!!localStorage.getItem('token'));
  const [page, setPage] = useState('dashboard');

  const token = localStorage.getItem('token');
  const user = {
    nom: localStorage.getItem('nom'),
    prenom: localStorage.getItem('prenom')
  };

  const handleConnexion = () => setConnecte(true);
  const handleDeconnexion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nom');
    localStorage.removeItem('prenom');
    setConnecte(false);
  };

  if (!connecte) return <Connexion onConnexion={handleConnexion} />;

  const path = window.location.pathname;
  if (path === '/budget') return <Budget token={token} />;

  return <Dashboard token={token} user={user} onLogout={handleDeconnexion} />;
}