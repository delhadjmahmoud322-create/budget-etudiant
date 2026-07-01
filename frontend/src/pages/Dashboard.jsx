import { useState, useEffect } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement, Title
} from 'chart.js';
import { getDashboard, getAlertes } from '../services/api';
import Navbar from '../components/Navbar'; 

ChartJS.register(ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement, Title);
 
export default function Dashboard({ token, user, onLogout }) {
  const [data, setData] = useState(null);
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    if (!token) return;
    Promise.all([getDashboard(token), getAlertes(token)])
      .then(([dashRes, alertRes]) => {
        setData(dashRes.data);
        setAlertes(alertRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);
 
  if (loading) return <div style={styles.loading}>Chargement...</div>;
  if (!data) return <div style={styles.loading}>Aucun budget defini. Allez dans Budget pour commencer.</div>;
 
  const pct = Math.min(100, Math.round((data.total_depense / data.budget_global) * 100));
  const alertesNonLues = alertes.filter(a => !a.lue);
 
  const donutData = {
    labels: data.repartition_categories.map(r => r.nom_categorie),
    datasets: [{ data: data.repartition_categories.map(r => r.total),
      backgroundColor: data.repartition_categories.map(r => r.couleur || '#1B3A5C') }]
  };
 
  const lineData = {
    labels: data.evolution.map(e => e.date_depense),
    datasets: [{ label: 'Depenses (FCFA)', data: data.evolution.map(e => e.total_jour),
      borderColor: '#E07A1E', backgroundColor: 'rgba(224,122,30,0.15)', tension: 0.4 }]
  };
 
  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <div style={styles.navbar}>
        <span style={styles.brand}>BudgetEtudiant</span>
        <div style={styles.navLinks}>
          <span style={styles.navLink}>Dashboard</span>
          <a href='/budget' style={styles.navLink}>Budget</a>
          <a href='/depenses' style={styles.navLink}>Depenses</a>
          <a href='/historique' style={styles.navLink}>Historique</a>
          <a href='/rapports' style={styles.navLink}>Rapports</a>
        </div>
        <div style={styles.navRight}>
          {alertesNonLues.length > 0 && (
            <span style={styles.badge}>{alertesNonLues.length} alerte(s)</span>
          )}
          <span style={styles.welcome}>Bonjour {user?.prenom} !</span>
          <button style={styles.btnLogout} onClick={onLogout}>Deconnexion</button>
        </div>
      </div>
 
      {/* ALERTES */}
      {alertesNonLues.map(a => (
        <div key={a.id_alerte} style={{...styles.alerte, background: a.type_alerte === 'rouge' ? '#FDECEA' : '#FFF3E0'}}>
          <span>{a.type_alerte === 'rouge' ? '🔴' : '🟠'} {a.message}</span>
        </div>
      ))}
 
      {/* CARTES RESUME */}
      <div style={styles.cartes}>
        <div style={styles.carte}><div style={styles.carteLabel}>Budget total</div>
          <div style={styles.carteVal}>{data.budget_global.toLocaleString()} FCFA</div></div>
        <div style={styles.carte}><div style={styles.carteLabel}>Depenses</div>
          <div style={{...styles.carteVal, color: '#E07A1E'}}>{data.total_depense.toLocaleString()} FCFA</div></div>
        <div style={styles.carte}><div style={styles.carteLabel}>Solde restant</div>
          <div style={{...styles.carteVal, color: data.solde < 0 ? '#C0392B' : '#27AE60'}}>
            {data.solde.toLocaleString()} FCFA</div></div>
      </div>
 
      {/* BARRE DE PROGRESSION */}
      <div style={styles.barreSection}>
        <div style={styles.barreLabel}>Consommation globale : {pct}%</div>
        <div style={styles.barreOuter}>
          <div style={{...styles.barreInner, width: `${pct}%`,
            background: pct >= 100 ? '#C0392B' : pct >= 80 ? '#E07A1E' : '#27AE60'}} />
        </div>
      </div>
 
      {/* GRAPHIQUES */}
      <div style={styles.graphs}>
        <div style={styles.graphCard}>
          <h3 style={styles.graphTitle}>Repartition par categorie</h3>
          <Doughnut data={donutData} options={{ plugins: { legend: { position: 'bottom' } } }} />
        </div>
        <div style={styles.graphCard}>
          <h3 style={styles.graphTitle}>Evolution des depenses</h3>
          <Line data={lineData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
}
 
const styles = {
  page: { minHeight: '100vh', background: '#F4F6F9', fontFamily: 'Arial, sans-serif' },
  loading: { padding: 40, textAlign: 'center' },
  navbar: { background: '#1B3A5C', color: '#fff', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '12px 30px' },
  brand: { fontWeight: 'bold', fontSize: 20 },
  navLinks: { display: 'flex', gap: 20 },
  navLink: { color: '#fff', textDecoration: 'none', cursor: 'pointer' },
  navRight: { display: 'flex', alignItems: 'center', gap: 16 },
  badge: { background: '#E07A1E', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 13 },
  welcome: { fontSize: 14 },
  btnLogout: { background: '#E07A1E', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer' },
  alerte: { margin: '12px 30px', padding: '10px 16px', borderRadius: 8, fontSize: 14 },
  cartes: { display: 'flex', gap: 20, padding: '24px 30px 0' },
  carte: { flex: 1, background: '#fff', borderRadius: 10, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  carteLabel: { color: '#888', fontSize: 13, marginBottom: 8 },
  carteVal: { fontSize: 24, fontWeight: 'bold', color: '#1B3A5C' },
  barreSection: { margin: '20px 30px' },
  barreLabel: { fontSize: 14, marginBottom: 6, color: '#555' },
  barreOuter: { height: 14, background: '#E0E0E0', borderRadius: 7 },
  barreInner: { height: 14, borderRadius: 7, transition: 'width 0.5s' },
  graphs: { display: 'flex', gap: 20, padding: '20px 30px' },
  graphCard: { flex: 1, background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  graphTitle: { fontSize: 15, fontWeight: 'bold', color: '#1B3A5C', marginBottom: 16 },
};
