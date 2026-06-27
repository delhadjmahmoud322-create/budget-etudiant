const BASE = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem("token");

export const inscrire = async (nom, prenom, email, mot_de_passe) => {
  const res = await fetch(`${BASE}/auth/inscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nom, prenom, email, mot_de_passe })
  });
  return res.json();
};

export const seConnecter = async (email, mot_de_passe) => {
  const res = await fetch(`${BASE}/auth/connexion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, mot_de_passe })
  });
  return res.json();
};

export const getDepenses = async () => {
  const res = await fetch(`${BASE}/depenses`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
};