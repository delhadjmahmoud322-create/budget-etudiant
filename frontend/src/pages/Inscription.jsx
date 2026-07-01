import { useState } from 'react';
import axios from 'axios';

export default function Inscription({ onRetour }) {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', mot_de_passe: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [succes, setSucces] = useState(false);

  const handleInscrire = async () => {
    if (!form.nom || !form.prenom || !form.email || !form.mot_de_passe)
      { setMsg('Tous les champs sont obligatoires'); return; }
    if (form.mot_de_passe !== form.confirm)
      { setMsg('Les mots de passe ne correspondent pas'); return; }
    try {
      await axios.post('/api/auth/inscription', {
        nom: form.nom, prenom: form.prenom,
        email: form.email, mot_de_passe: form.mot_de_passe
      });
      setSucces(true); setMsg('');
    } catch (e) {
      setMsg(e.response?.data?.erreur || 'Erreur lors de linscription');
    }
  };

  if (succes) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={{color:'#27AE60', fontWeight:'bold', fontSize:16}}>
          Compte créé avec succès ! Vous pouvez maintenant vous connecter.
        </p>
        <button style={styles.btn} onClick={onRetour}>Se connecter</button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>BudgetEtudiant</h2>
        <p style={styles.subtitle}>Créer un compte</p>
        {msg && <div style={styles.erreur}>{msg}</div>}
        <input style={styles.input} placeholder='Nom' value={form.nom}
          onChange={e => setForm({...form, nom: e.target.value})} />
        <input style={styles.input} placeholder='Prénom' value={form.prenom}
          onChange={e => setForm({...form, prenom: e.target.value})} />
        <input style={styles.input} type='email' placeholder='Email' value={form.email}
          onChange={e => setForm({...form, email: e.target.value})} />
        <input style={styles.input} type='password' placeholder='Mot de passe' value={form.mot_de_passe}
          onChange={e => setForm({...form, mot_de_passe: e.target.value})} />
        <input style={styles.input} type='password' placeholder='Confirmer le mot de passe' value={form.confirm}
          onChange={e => setForm({...form, confirm: e.target.value})} />
        <button style={styles.btn} onClick={handleInscrire}>Créer mon compte</button>
        <p style={styles.lien}>Déjà un compte ?
          <span style={styles.lienTexte} onClick={onRetour}> Se connecter</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:'100vh', background:'#F4F6F9', display:'flex', alignItems:'center', justifyContent:'center' },
  card: { background:'#fff', borderRadius:12, padding:36, width:420, boxShadow:'0 4px 20px rgba(0,0,0,0.1)' },
  title: { textAlign:'center', color:'#1B3A5C', marginBottom:4 },
  subtitle: { textAlign:'center', color:'#E07A1E', fontWeight:'bold', marginBottom:20 },
  input: { display:'block', width:'100%', padding:'10px 12px', margin:'10px 0', borderRadius:6,
    border:'1px solid #ddd', fontSize:14, boxSizing:'border-box' },
  btn: { display:'block', width:'100%', padding:'11px', marginTop:16, background:'#1B3A5C',
    color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:15 },
  erreur: { padding:'9px 14px', background:'#FDECEA', borderRadius:6, marginBottom:12, fontSize:14, color:'#C0392B' },
  lien: { textAlign:'center', marginTop:16, fontSize:13, color:'#888' },
  lienTexte: { color:'#1B3A5C', fontWeight:'bold', cursor:'pointer' },
};