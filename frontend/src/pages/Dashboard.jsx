import { useEffect, useState } from 'react';

export default function Dashboard({ onDeconnexion }) {
  const nom = localStorage.getItem('nom');
  const prenom = localStorage.getItem('prenom');

  return (
    <div style={{ padding:'40px', fontFamily:'Arial' }}>
      <div style={{ background:'#1A2E5E', color:'white', padding:'20px',
        borderRadius:'10px', marginBottom:'24px' }}>
        <h1>BudgetEtudiant</h1>
        <p>Bonjour {prenom} {nom} !</p>
        <button onClick={onDeconnexion}
          style={{ background:'#E87722', color:'white', border:'none',
            padding:'8px 16px', borderRadius:'6px', cursor:'pointer' }}>
          Se deconnecter
        </button>
      </div>
      <p>Tableau de bord en construction...</p>
    </div>
  );
}