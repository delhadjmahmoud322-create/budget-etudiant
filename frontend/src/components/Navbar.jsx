import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAlertes } from '../services/api';
 
export default function Navbar({ token, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [nbAlertes, setNbAlertes] = useState(0);
 
  useEffect(() => {
    if (!token) return;
    getAlertes(token)
      .then(r => setNbAlertes(r.data.filter(a => !a.lue).length))
      .catch(() => {});
  }, [token, location.pathname]);
 
  const lien = (path, label) => (
    <span
      key={path}
      style={{...styles.lien, ...(location.pathname === path ? styles.lienActif : {})}}
      onClick={() => navigate(path)}
    >
      {label}
    </span>
  );
 
  return (
    <div style={styles.navbar}>
      <span style={styles.brand} onClick={() => navigate('/')}>BudgetEtudiant</span>
      <div style={styles.liens}>
        {lien('/', 'Dashboard')}
        {lien('/budget', 'Budget')}
        {lien('/depenses', 'Depenses')}
        {lien('/historique', 'Historique')}
        {lien('/rapports', 'Rapports')}
      </div>
      <div style={styles.droite}>
        {nbAlertes > 0 && (
          <span style={styles.badge} onClick={() => navigate('/')}>{nbAlertes}</span>
        )}
        <span style={styles.nomUser}>
          {user?.prenom} {user?.nom}
        </span>
        <button style={styles.btnLogout} onClick={onLogout}>Deconnexion</button>
      </div>
    </div>
  );
}
 
const styles = {
  navbar: { background:'#1B3A5C', color:'#fff', display:'flex', alignItems:'center',
    justifyContent:'space-between', padding:'12px 30px', position:'sticky', top:0, zIndex:100 },
  brand: { fontWeight:'bold', fontSize:20, cursor:'pointer' },
  liens: { display:'flex', gap:24 },
  lien: { color:'rgba(255,255,255,0.75)', cursor:'pointer', fontSize:14,
    padding:'4px 0', borderBottom:'2px solid transparent' },
  lienActif: { color:'#fff', borderBottom:'2px solid #E07A1E' },
  droite: { display:'flex', alignItems:'center', gap:14 },
  badge: { background:'#E07A1E', color:'#fff', padding:'2px 9px',
    borderRadius:12, fontSize:12, cursor:'pointer', fontWeight:'bold' },
  nomUser: { fontSize:13, color:'rgba(255,255,255,0.85)' },
  btnLogout: { background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.4)',
    padding:'5px 14px', borderRadius:6, cursor:'pointer', fontSize:13 },
};
