import { useState } from 'react';
import { getDonneesRapport } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Rapports({ token }) {
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [donnees, setDonnees] = useState(null);
  const [msg, setMsg] = useState('');

  const charger = async () => {
    try {
      const res = await getDonneesRapport(token, debut, fin);
      setDonnees(res.data); setMsg('');
    } catch (e) { setMsg('Erreur chargement des données'); }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Rapport BudgetEtudiant', 14, 18);
    doc.setFontSize(11);
    doc.text(`Période : ${donnees.periode.debut || 'Tout'} - ${donnees.periode.fin || 'Tout'}`, 14, 28);
    doc.text(`Total dépenses : ${donnees.total.toLocaleString()} FCFA`, 14, 36);
    doc.text(`Généré le : ${donnees.genere_le}`, 14, 44);
    autoTable(doc, {
      startY: 52,
      head: [['Date', 'Catégorie', 'Montant (FCFA)', 'Description']],
      body: donnees.depenses.map(d => [d.date_depense, d.nom_categorie, parseFloat(d.montant).toLocaleString(), d.description || '-']),
    });
    doc.save('rapport-budgetetudiant.pdf');
  };

  const exportExcel = () => {
    const rows = donnees.depenses.map(d => ({
      Date: d.date_depense,
      Categorie: d.nom_categorie,
      'Montant (FCFA)': parseFloat(d.montant),
      Description: d.description || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport');
    XLSX.writeFile(wb, 'rapport-budgetetudiant.xlsx');
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Générer un rapport</h2>
      <div style={styles.card}>
        <div style={styles.row}>
          <input style={styles.input} type='date' value={debut} onChange={e => setDebut(e.target.value)} />
          <input style={styles.input} type='date' value={fin} onChange={e => setFin(e.target.value)} />
          <button style={styles.btn} onClick={charger}>Générer</button>
        </div>
        {msg && <p style={{color:'red'}}>{msg}</p>}
      </div>
      {donnees && (
        <div style={styles.card}>
          <div style={styles.resume}>
            <span>Dépenses : <strong>{donnees.depenses.length}</strong></span>
            <span>Total : <strong>{donnees.total.toLocaleString()} FCFA</strong></span>
            <span>Généré le : {donnees.genere_le}</span>
          </div>
          <div style={styles.exportBtns}>
            <button style={styles.btnPDF} onClick={exportPDF}>Exporter PDF</button>
            <button style={styles.btnXLS} onClick={exportExcel}>Exporter Excel</button>
          </div>
          <table style={styles.table}>
            <thead><tr style={styles.theadRow}>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Catégorie</th>
              <th style={styles.th}>Montant</th>
              <th style={styles.th}>Description</th>
            </tr></thead>
            <tbody>
              {donnees.depenses.map((d, i) => (
                <tr key={i} style={styles.tr}>
                  <td style={styles.td}>{d.date_depense}</td>
                  <td style={styles.td}>{d.nom_categorie}</td>
                  <td style={styles.td}>{parseFloat(d.montant).toLocaleString()} FCFA</td>
                  <td style={styles.td}>{d.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 30, fontFamily: 'Arial, sans-serif', background: '#F4F6F9', minHeight: '100vh' },
  title: { color: '#1B3A5C' },
  card: { background: '#fff', borderRadius: 10, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  row: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' },
  input: { padding: '9px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, flex: 1 },
  btn: { padding: '9px 24px', background: '#1B3A5C', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
  resume: { display: 'flex', gap: 30, marginBottom: 16, fontSize: 14 },
  exportBtns: { display: 'flex', gap: 12, marginBottom: 20 },
  btnPDF: { padding: '9px 20px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
  btnXLS: { padding: '9px 20px', background: '#27AE60', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  theadRow: { background: '#1B3A5C' },
  th: { padding: '10px 12px', color: '#fff', textAlign: 'left', fontSize: 13 },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '10px 12px', fontSize: 13 },
};