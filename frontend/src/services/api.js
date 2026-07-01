import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';

const getToken = () => localStorage.getItem("token");

// AUTH
export const seConnecter = async (email, mot_de_passe) => {
  const res = await fetch('http://localhost:5000/api/auth/connexion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, mot_de_passe })
  });
  return res.json();
};

export const inscrire = async (nom, prenom, email, mot_de_passe) => {
  const res = await fetch('http://localhost:5000/api/auth/inscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nom, prenom, email, mot_de_passe })
  });
  return res.json();
};

// Budget
export const getBudget = (token) =>
  axios.get('/api/budget', { headers: { Authorization: `Bearer ${token}` } });

export const createBudget = (token, data) =>
  axios.post('/api/budget', data, { headers: { Authorization: `Bearer ${token}` } });

export const updateBudget = (token, id, data) =>
  axios.put(`/api/budget/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });

export const repartirCategories = (token, id, categories) =>
  axios.post(`/api/budget/${id}/categories`, { categories }, { headers: { Authorization: `Bearer ${token}` } });

// Dashboard
export const getDashboard = (token) =>
  axios.get('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } });

// Categories
export const getCategories = (token) =>
  axios.get('/api/categories', { headers: { Authorization: `Bearer ${token}` } });

// Alertes
export const getAlertes = (token) =>
  axios.get('/api/alertes', { headers: { Authorization: `Bearer ${token}` } });

export const marquerAlerteLue = (token, id) =>
  axios.put(`/api/alertes/${id}/lue`, {}, { headers: { Authorization: `Bearer ${token}` } });

// Depenses
export const getDepenses = (token, params = {}) =>
  axios.get('/api/depenses', { headers: { Authorization: `Bearer ${token}` }, params });

export const addDepense = (token, data) =>
  axios.post('/api/depenses', data, { headers: { Authorization: `Bearer ${token}` } });

export const updateDepense = (token, id, data) =>
  axios.put(`/api/depenses/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });

export const deleteDepense = (token, id) =>
  axios.delete(`/api/depenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });

// Rapports
export const getDonneesRapport = (token, debut, fin) =>
  axios.get('/api/rapports/donnees', { headers: { Authorization: `Bearer ${token}` }, params: { debut, fin } });