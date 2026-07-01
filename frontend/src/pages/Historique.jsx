import { useState, useEffect } from 'react';
import { getDepenses, getCategories } from '../services/api';

export default function Historique({ token }) {
  const [depenses, setDepenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtres, setFiltres] = useState({ debut: '', fin: '', id_categorie: '', recherche: '' });

  useEffect(() => {
    getCategories(token).then(r => setCategories(r.data));
    getDepenses(token).then(r => setDepenses(r.data));
  }, [token]);

  const depensesFiltrees = depenses.filter(d => {
    if (filtres.debut && d.date_depense < filtres.debut) return false;
    if (filtres.fin && d.date_depense > filtres.fin) return false;
    if (filtres.id_categorie && String(d.id_categorie) !== filtres.id_categorie) return false;
    if (filtres.recherche && !d.description?.toLowerCase().includes(filtres.recherche.toLowerCase())) return false;
    return true;
  });

  const total = depensesFiltrees.reduce((s, d) => s + parseFloat(d.montant), 0);

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Historique des dépenses</h2>
      <div style={styles.card}>
        <div style={styles.filtresRow}>
          <input style={styles.input} type='date' placeholder='Du'
            value={filtres.debut} onChange={e => setFiltres({...filtres, debut: e.target.value})} />
          <input style={styles.input} type='date' placeholder='Au'
            value={filtres.fin} onChange={e => setFiltres({...filtres, fin: e.target.value})} />
          <select style={styles.input} value={filtres.id_categorie}
            onChange={e => setFiltres({...filtres, id_categorie: e.target.value})}>
            <option value=''>Toutes les catégories</option>
            {categories.map(c => <option key={c.id_categorie} value={c.id_categorie}>{c.nom_categorie}</option>)}
          </select>
          <input style={styles.input} type='text' placeholder='Recherche...'
            value={filtres.recherche} onChange={e => setFiltres({...filtres, recherche: e.target.value})} />
          <button style={styles.btnReset}
            onClick={() => setFiltres({ debut: '', fin: '', id_categorie: '', recherche: '' })}>
            Réinitialiser
          </button>
        </div>
        <p style={{color:'#888', fontSize:13}}>
          {depensesFiltrees.length} dépense(s) — Total : {total.toLocaleString()} FCFA
        </p>
      </div>
      <div style={styles.card}>
        <table style={styles.table}>
          <thead><tr style={styles.theadRow}>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Catégorie</th>
            <th style={styles.th}>Montant</th>
            <th style={styles.th}>Description</th>
          </tr></thead>
          <tbody>
            {depensesFiltrees.map(d => (
              <tr key={d.id_depense} style={styles.tr}>
                <td style={styles.td}>{d.date_depense}</td>
                <td style={styles.td}>{d.nom_categorie}</td>
                <td style={styles.td}>{parseFloat(d.montant).toLocaleString()} FCFA</td>
                <td style={styles.td}>{d.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 30, fontFamily: 'Arial, sans-serif', background: '#F4F6F9', minHeight: '100vh' },
  title: { color: '#1B3A5C' },
  card: { background: '#fff', borderRadius: 10, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  filtresRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 },
  input: { padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, flex: 1, minWidth: 130 },
  btnReset: { padding: '8px 16px', background: '#7F8C8D', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  table: { width: '100%', borderCollapse: 'collapse' },
  theadRow: { background: '#1B3A5C' },
  th: { padding: '10px 12px', color: '#fff', textAlign: 'left', fontSize: 13 },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '10px 12px', fontSize: 13 },
};