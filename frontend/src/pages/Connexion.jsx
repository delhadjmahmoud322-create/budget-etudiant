import { useState } from 'react';
import { seConnecter } from '../services/api';

export default function Connexion({ onConnexion }) {
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [erreur, setErreur] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !mdp) { setErreur('Remplis tous les champs.'); return; }
    const data = await seConnecter(email, mdp);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('nom', data.nom);
      localStorage.setItem('prenom', data.prenom);
      onConnexion();
    } else {
      setErreur(data.erreur || 'Erreur de connexion');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.titre}>BudgetEtudiant</h1>
        <h2 style={styles.sous}>Connexion</h2>
        {erreur && <p style={styles.erreur}>{erreur}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="email" placeholder="Email"
            value={email} onChange={e => setEmail(e.target.value)} />
          <input style={styles.input} type="password" placeholder="Mot de passe"
            value={mdp} onChange={e => setMdp(e.target.value)} />
          <button style={styles.btn} type="submit">Se connecter</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { display:'flex', justifyContent:'center', alignItems:'center',
    minHeight:'100vh', background:'#F2F4F8' },
  card: { background:'white', padding:'40px', borderRadius:'12px',
    boxShadow:'0 4px 20px rgba(0,0,0,0.1)', width:'360px' },
  titre: { color:'#1A2E5E', textAlign:'center', marginBottom:'4px' },
  sous: { color:'#E87722', textAlign:'center', marginBottom:'24px', fontSize:'18px' },
  input: { width:'100%', padding:'12px', marginBottom:'12px', border:'1px solid #D0D5E0',
    borderRadius:'8px', fontSize:'15px', boxSizing:'border-box' },
  btn: { width:'100%', padding:'13px', background:'#1A2E5E', color:'white',
    border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer' },
  erreur: { color:'#8B1A1A', background:'#FDE8E8', padding:'10px', borderRadius:'6px',
    textAlign:'center', marginBottom:'12px' }
};