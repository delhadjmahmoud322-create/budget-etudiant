import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import Dashboard from './pages/Dashboard';
import Budget from './pages/Budget';
import Depenses from './pages/Depenses';
import Historique from './pages/Historique';
import Rapports from './pages/Rapports';
import Navbar from './components/Navbar';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [page, setPage] = useState('connexion');

  const handleLogin = (tok, userData) => {
    localStorage.setItem('token', tok);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tok);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setPage('connexion');
  };

  if (!token) {
    if (page === 'inscription')
      return <Inscription onRetour={() => setPage('connexion')} />;
    return <Connexion onLogin={handleLogin} onInscription={() => setPage('inscription')} />;
  }

  return (
    <BrowserRouter>
      <Navbar token={token} user={user} onLogout={handleLogout} />
      <Routes>
        <Route path='/' element={<Dashboard token={token} user={user} onLogout={handleLogout} />} />
        <Route path='/budget' element={<Budget token={token} user={user} onLogout={handleLogout} />} />
        <Route path='/depenses' element={<Depenses token={token} user={user} onLogout={handleLogout} />} />
        <Route path='/historique' element={<Historique token={token} user={user} onLogout={handleLogout} />} />
        <Route path='/rapports' element={<Rapports token={token} user={user} onLogout={handleLogout} />} />
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </BrowserRouter>
  );
}