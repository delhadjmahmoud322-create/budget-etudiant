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
      setMsg('Montant, date et catégorie sont obligatoires'); return;
    }
    try {
      await addDepense(token, form);
      setMsg('Dépense ajoutée !');
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
      setMsg('Dépense modifiée !');
      charger();
    } catch (e) { setMsg(e.response?.data?.erreur || 'Erreur modification'); }
  };

  if (loading) return <div style={{padding:40}}>Chargement...</div>;

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Mes dépenses</h2>
      <div style={styles.card}>
        <h3 style={{marginTop:0}}>Ajouter une dépense</h3>
        {msg && <div style={styles.msg}>{msg}</div>}
        <div style={styles.formRow}>
          <input style={styles.input} type='number' placeholder='Montant (FCFA)'
            value={form.montant} onChange={e => setForm({...form, montant: e.target.value})} />
          <input style={styles.input} type='date'
            value={form.date_depense} onChange={e => setForm({...form, date_depense: e.target.value})} />
          <select style={styles.input} value={form.id_categorie}
            onChange={e => setForm({...form, id_categorie: e.target.value})}>
            <option value=''>-- Catégorie --</option>
            {categories.map(c => <option key={c.id_categorie} value={c.id_categorie}>{c.nom_categorie}</option>)}
          </select>
          <input style={styles.input} type='text' placeholder='Description (optionnel)'
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>
        <button style={styles.btn} onClick={handleAjouter}>Ajouter</button>
      </div>
      <div style={styles.card}>
        <table style={styles.table}>
          <thead><tr style={styles.theadRow}>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Catégorie</th>
            <th style={styles.th}>Montant</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Action</th>
          </tr></thead>
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