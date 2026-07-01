import { useState } from 'react';
import { createBudget, repartirCategories } from '../services/api';
import Navbar from '../components/Navbar'; 

const CATEGORIES_DEFAULT = [
  { nom: 'Logement', couleur: '#1B3A5C' },
  { nom: 'Nourriture', couleur: '#27AE60' },
  { nom: 'Transport', couleur: '#E07A1E' },
  { nom: 'Frais scolaires', couleur: '#8E44AD' },
  { nom: 'Loisirs', couleur: '#E74C3C' },
  { nom: 'Sante', couleur: '#2980B9' },
  { nom: 'Autres', couleur: '#7F8C8D' },
];
 
export default function Budget({ token }) {
  const [montant, setMontant] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [periode, setPeriode] = useState('mensuel');
  const [sousbudgets, setSousbudgets] = useState(
    CATEGORIES_DEFAULT.map(c => ({ ...c, sous_budget: '' }))
  );
  const [etape, setEtape] = useState(1);
  const [idBudget, setIdBudget] = useState(null);
  const [msg, setMsg] = useState('');
 
  const total = sousbudgets.reduce((s, c) => s + (parseFloat(c.sous_budget) || 0), 0);
 
  const handleCreer = async () => {
    if (!montant || parseFloat(montant) <= 0) { setMsg('Le budget doit etre > 0'); return; }
    try {
      const res = await createBudget(token, { montant_global: montant, periode, date_debut: dateDebut, date_fin: dateFin });
      setIdBudget(res.data.id_budget);
      setEtape(2);
      setMsg('');
    } catch (e) { setMsg(e.response?.data?.erreur || 'Erreur'); }
  };
 
  const handleRepartir = async () => {
    if (total > parseFloat(montant)) { setMsg('La somme des sous-budgets depasse le budget global (RG03)'); return; }
    const cats = sousbudgets.filter(c => parseFloat(c.sous_budget) > 0)
      .map(c => ({ nom: c.nom, sous_budget: parseFloat(c.sous_budget), couleur: c.couleur }));
    try {
      await repartirCategories(token, idBudget, cats);
      setMsg('Budget et categories enregistres avec succes !');
      setEtape(3);
    } catch (e) { setMsg(e.response?.data?.erreur || 'Erreur'); }
  };
 
  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Definir mon budget</h2>
      {msg && <div style={styles.msg}>{msg}</div>}
 
      {etape === 1 && (
        <div style={styles.card}>
          <h3>Etape 1 — Budget global</h3>
          <input style={styles.input} type='number' placeholder='Montant global (FCFA)' value={montant} onChange={e => setMontant(e.target.value)} />
          <select style={styles.input} value={periode} onChange={e => setPeriode(e.target.value)}>
            <option value='mensuel'>Mensuel</option>
            <option value='semestriel'>Semestriel</option>
          </select>
          <input style={styles.input} type='date' placeholder='Date debut' value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
          <input style={styles.input} type='date' placeholder='Date fin' value={dateFin} onChange={e => setDateFin(e.target.value)} />
          <button style={styles.btn} onClick={handleCreer}>Suivant</button>
        </div>
      )}
 
      {etape === 2 && (
        <div style={styles.card}>
          <h3>Etape 2 — Repartition par categorie</h3>
          <p style={{color:'#888'}}>Budget global : {parseFloat(montant).toLocaleString()} FCFA | Reparti : {total.toLocaleString()} FCFA</p>
          {sousbudgets.map((c, i) => (
            <div key={i} style={styles.catRow}>
              <span style={{...styles.catDot, background: c.couleur}} />
              <span style={styles.catNom}>{c.nom}</span>
              <input style={styles.inputSmall} type='number' placeholder='0'
                value={c.sous_budget} onChange={e => {
                  const copy = [...sousbudgets]; copy[i].sous_budget = e.target.value; setSousbudgets(copy);
                }} />
            </div>
          ))}
          <button style={styles.btn} onClick={handleRepartir}>Enregistrer</button>
        </div>
      )}
 
      {etape === 3 && (
        <div style={styles.card}>
          <p style={{color:'#27AE60', fontWeight:'bold'}}>Budget enregistre ! Retournez au dashboard pour voir vos statistiques.</p>
          <a href='/' style={styles.btn}>Aller au dashboard</a>
        </div>
      )}
    </div>
  );
}
 
const styles = {
  page: { padding: 40, fontFamily: 'Arial, sans-serif', background: '#F4F6F9', minHeight: '100vh' },
  title: { color: '#1B3A5C', marginBottom: 20 },
  card: { background: '#fff', borderRadius: 10, padding: 28, maxWidth: 560, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  input: { display: 'block', width: '100%', padding: '10px 12px', margin: '10px 0', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' },
  inputSmall: { padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', width: 140, fontSize: 14 },
  btn: { marginTop: 16, padding: '10px 28px', background: '#1B3A5C', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15, display: 'inline-block', textDecoration: 'none' },
  msg: { padding: '10px 16px', background: '#FFF3E0', borderRadius: 8, marginBottom: 16, fontSize: 14 },
  catRow: { display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0' },
  catDot: { width: 14, height: 14, borderRadius: '50%', display: 'inline-block' },
  catNom: { flex: 1, fontSize: 14 },
}