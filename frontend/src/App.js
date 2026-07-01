import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Connexion from './pages/Connexion';
import Dashboard from './pages/Dashboard';
import Budget from './pages/Budget';
import Depenses from './pages/Depenses';
import Historique from './pages/Historique';
import Rapports from './pages/Rapports';
 
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
 
  const handleLogin = (tok, userData) => {
    localStorage.setItem('token', tok);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tok); setUser(userData);
  };
 
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null); setUser(null);
  };
 
  if (!token) return <Connexion onLogin={handleLogin} />;
 
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Dashboard token={token} user={user} onLogout={handleLogout} />} />
        <Route path='/budget' element={<Budget token={token} />} />
        <Route path='/depenses' element={<Depenses token={token} />} />
        <Route path='/historique' element={<Historique token={token} />} />
        <Route path='/rapports' element={<Rapports token={token} />} />
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </BrowserRouter>
  );
}
