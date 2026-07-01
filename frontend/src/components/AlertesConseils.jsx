import { useState } from 'react';
import { marquerAlerteLue } from '../services/api';

const CONSEILS = [
  'Essayez de mettre de côté 10% de votre budget chaque mois.',
  'Limitez les dépenses de loisirs à 20% de votre budget total.',
  'Planifiez vos dépenses fixes (loyer, transport) en début de mois.',
  'Évitez les achats impulsifs : attendez 24h avant tout achat non prévu.',
  'Comparez vos dépenses ce mois-ci avec le mois précédent pour repérer les excès.',
];

export default function AlertesConseils({ alertes, token, onMiseAJour }) {
  const [conseilIdx] = useState(Math.floor(Math.random() * CONSEILS.length));
  const alertesNonLues = alertes.filter(a => !a.lue);

  const handleLue = async (id) => {
    try {
      await marquerAlerteLue(token, id);
      onMiseAJour();
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      {alertesNonLues.length > 0 && (
        <div style={styles.section}>
          <h4 style={styles.titreAlertes}>Alertes budgétaires</h4>
          {alertesNonLues.map(a => (
            <div key={a.id_alerte} style={{
              ...styles.alerteCard,
              background: a.type_alerte === 'rouge' ? '#FDECEA' : '#FFF3E0',
              borderLeft: `4px solid ${a.type_alerte === 'rouge' ? '#C0392B' : '#E07A1E'}`
            }}>
              <span style={styles.icone}>{a.type_alerte === 'rouge' ? '🔴' : '🟠'}</span>
              <span style={styles.texteAlerte}>{a.message}</span>
              <button style={styles.btnLue} onClick={() => handleLue(a.id_notification)}>
                Marquer comme lue
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={styles.conseilCard}>
        <span style={styles.conseilIcone}>💡</span>
        <div>
          <div style={styles.conseilTitre}>Conseil du jour</div>
          <div style={styles.conseilTexte}>{CONSEILS[conseilIdx]}</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  section: { margin: '0 30px 10px' },
  titreAlertes: { color: '#1B3A5C', marginBottom: 8, fontSize: 14 },
  alerteCard: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, marginBottom: 8 },
  icone: { fontSize: 18 },
  texteAlerte: { flex: 1, fontSize: 13 },
  btnLue: { padding: '4px 10px', background: 'transparent', border: '1px solid #aaa', borderRadius: 5, cursor: 'pointer', fontSize: 12, color: '#666' },
  conseilCard: { display: 'flex', alignItems: 'flex-start', gap: 14, margin: '10px 30px', background: '#EAF4FB', borderRadius: 10, padding: '14px 18px', borderLeft: '4px solid #2980B9' },
  conseilIcone: { fontSize: 22 },
  conseilTitre: { fontWeight: 'bold', color: '#1B3A5C', fontSize: 13, marginBottom: 4 },
  conseilTexte: { fontSize: 13, color: '#444' },
};