import { useState, useEffect } from 'react';
import { getDepenses, addDepense, deleteDepense, updateDepense, getCategories } from '../services/api';

export default function Depenses({ token }) {
  const [depenses, setDepenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ montant: '', date_depense: '', description: '', id_categorie: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [enModif, setEnModif] = useState(null);
  const [formModif, setFormModif] = useState({ montant: '', description: '' });

  const charger = () => {
    Promise.all([getDepenses(token), getCategories(token)])
      .then(([dep, cat]) => { setDepenses(dep.data); setCategories(cat.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, [token]);

  const handleAjouter = async () => {
    if (!form.montant || !form.date_depense || !form.id_categorie) {
      setMsg('Montant, date et categorie sont obligatoires'); return;
    }
    try {
      await addDepense(token, form);
      setMsg('Depense ajoutee !');
      setForm({ montant: '', date_depense: '', description: '', id_categorie: '' });
      charger();
    } catch (e) { setMsg(e.response?.data?.erreur || 'Erreur'); }
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try { await deleteDepense(token, id); charger(); }
    catch (e) { setMsg('Erreur suppression'); }
  };

  const handleStartModif = (d) => {
    setEnModif(d.id_depense);
    setFormModif({ montant: d.montant, description: d.description || '' });
  };

  const handleModifier = async (id) => {
    try {
      await updateDepense(token, id, formModif);
      setEnModif(null);
      setMsg('Depense modifiee !');
      charger();
    } catch (e) { setMsg(e.response?.data?.erreur || 'Erreur modification'); }
  };

  if (loading) return <div style={{padding:40}}>Chargement...</div>;

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Mes depenses</h2>

      <div style={styles.card}>
        <h3 style={{marginTop:0}}>Ajouter une depense</h3>
        {msg && <div style={styles.msg}>{msg}</div>}
        <div style={styles.formRow}>
          <input style={styles.input} type='number' placeholder='Montant (FCFA)'
            value={form.montant} onChange={e => setForm({...form, montant: e.target.value})} />
          <input style={styles.input} type='date'
            value={form.date_depense} onChange={e => setForm({...form, date_depense: e.target.value})} />
          <select style={styles.input} value={form.id_categorie}
            onChange={e => setForm({...form, id_categorie: e.target.value})}>
            <option value=''>-- Categorie --</option>
            {categories.map(c => (
              <option key={c.id_categorie} value={c.id_categorie}>{c.nom_categorie}</option>
            ))}
          </select>
          <input style={styles.input} type='text' placeholder='Description (optionnel)'
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>
        <button style={styles.btn} onClick={handleAjouter}>Ajouter</button>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Categorie</th>
              <th style={styles.th}>Montant</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {depenses.map(d => (
              <tr key={d.id_depense} style={styles.tr}>
                <td style={styles.td}>{d.date_depense}</td>
                <td style={styles.td}>{d.nom_categorie}</td>
                <td style={styles.td}>{parseFloat(d.montant).toLocaleString()} FCFA</td>
                <td style={styles.td}>{d.description || '-'}</td>
                <td style={styles.td}>
                  {enModif === d.id_depense ? (
                    <div style={{display:'flex', gap:6, alignItems:'center'}}>
                      <input style={styles.inputSmall} type='number'
                        value={formModif.montant}
                        onChange={e => setFormModif({...formModif, montant: e.target.value})} />
                      <input style={styles.inputSmall} type='text' placeholder='Description'
                        value={formModif.description}
                        onChange={e => setFormModif({...formModif, description: e.target.value})} />
                      <button style={styles.btnSave} onClick={() => handleModifier(d.id_depense)}>OK</button>
                      <button style={styles.btnCancel} onClick={() => setEnModif(null)}>X</button>
                    </div>
                  ) : (
                    <div style={{display:'flex', gap:6}}>
                      <button style={styles.btnEdit} onClick={() => handleStartModif(d)}>Modifier</button>
                      <button style={styles.btnDel} onClick={() => handleSupprimer(d.id_depense)}>Supprimer</button>
                    </div>
                  )}
                </td>
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
  formRow: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 },
  input: { padding: '9px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, flex: 1, minWidth: 140 },
  inputSmall: { padding: '5px 8px', borderRadius: 5, border: '1px solid #ddd', width: 90, fontSize: 12 },
  btn: { padding: '9px 24px', background: '#1B3A5C', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
  btnEdit: { padding: '5px 10px', background: '#E07A1E', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12 },
  btnDel: { padding: '5px 10px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12 },
  btnSave: { padding: '5px 10px', background: '#27AE60', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12 },
  btnCancel: { padding: '5px 10px', background: '#95A5A6', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12 },
  msg: { padding: '8px 14px', background: '#FFF3E0', borderRadius: 6, marginBottom: 12, fontSize: 14 },
  table: { width: '100%', borderCollapse: 'collapse' },
  theadRow: { background: '#1B3A5C' },
  th: { padding: '10px 12px', color: '#fff', textAlign: 'left', fontSize: 13 },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '10px 12px', fontSize: 13 },
};