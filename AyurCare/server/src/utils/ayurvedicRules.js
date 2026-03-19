// Dosha-therapy matching matrix
export const DOSHA_THERAPY_MAP = {
  kapha: [
    { therapy: 'vamana', weight: 95, reason: 'Vamana is the primary Kapha-pacifying therapy through therapeutic emesis' },
    { therapy: 'nasya', weight: 70, reason: 'Nasya clears Kapha accumulation in head and neck region' },
    { therapy: 'virechana', weight: 50, reason: 'Virechana supports Kapha elimination through purgation' },
  ],
  pitta: [
    { therapy: 'virechana', weight: 95, reason: 'Virechana is the primary Pitta-pacifying therapy through purgation' },
    { therapy: 'raktamokshana', weight: 75, reason: 'Raktamokshana removes vitiated blood in Pitta disorders' },
    { therapy: 'basti', weight: 40, reason: 'Basti supports Pitta balance through medicated enema' },
  ],
  vata: [
    { therapy: 'basti', weight: 95, reason: 'Basti is the primary Vata-pacifying therapy and king of Panchakarma' },
    { therapy: 'nasya', weight: 65, reason: 'Nasya addresses Vata in the upper body and mind' },
    { therapy: 'virechana', weight: 35, reason: 'Virechana provides secondary Vata relief' },
  ],
  'vata-pitta': [
    { therapy: 'basti', weight: 80, reason: 'Basti addresses dominant Vata component' },
    { therapy: 'virechana', weight: 75, reason: 'Virechana addresses dominant Pitta component' },
  ],
  'pitta-kapha': [
    { therapy: 'virechana', weight: 85, reason: 'Virechana addresses both Pitta and Kapha imbalances' },
    { therapy: 'vamana', weight: 70, reason: 'Vamana targets Kapha accumulation' },
  ],
  'vata-kapha': [
    { therapy: 'basti', weight: 80, reason: 'Basti primarily addresses Vata imbalance' },
    { therapy: 'vamana', weight: 65, reason: 'Vamana clears Kapha blockages' },
  ],
};

// Symptom-therapy mapping
export const SYMPTOM_THERAPY_MAP = {
  'obesity': ['vamana', 'virechana'],
  'weight gain': ['vamana', 'virechana'],
  'constipation': ['basti', 'virechana'],
  'joint pain': ['basti'],
  'arthritis': ['basti'],
  'rheumatoid arthritis': ['basti'],
  'skin disorders': ['virechana', 'raktamokshana'],
  'psoriasis': ['raktamokshana', 'virechana'],
  'eczema': ['raktamokshana', 'virechana'],
  'sinusitis': ['nasya'],
  'migraine': ['nasya'],
  'headache': ['nasya'],
  'paralysis': ['basti'],
  'hypertension': ['virechana', 'raktamokshana'],
  'digestive issues': ['virechana', 'basti'],
  'indigestion': ['virechana', 'vamana'],
  'respiratory problems': ['vamana', 'nasya'],
  'asthma': ['vamana', 'nasya'],
  'cough': ['vamana', 'nasya'],
  'anxiety': ['basti', 'nasya'],
  'stress': ['basti', 'nasya'],
  'insomnia': ['basti'],
  'back pain': ['basti'],
  'sciatica': ['basti'],
  'anemia': ['virechana'],
  'liver disorders': ['virechana'],
  'diabetes': ['virechana', 'vamana'],
  'hair loss': ['nasya'],
  'memory issues': ['nasya'],
  'gout': ['raktamokshana', 'virechana'],
  'inflammation': ['raktamokshana'],
  'blood disorders': ['raktamokshana'],
};

// Contraindication rules
export const CONTRAINDICATIONS = {
  vamana: ['pregnancy', 'cardiac disease', 'hypertension', 'emaciation', 'old age'],
  virechana: ['pregnancy', 'rectal prolapse', 'severe diarrhea', 'rectal bleeding'],
  basti: ['pregnancy', 'rectal bleeding', 'diarrhea', 'fever', 'rectal prolapse'],
  nasya: ['pregnancy', 'fever', 'indigestion', 'sinusitis (acute)'],
  raktamokshana: ['anemia', 'pregnancy', 'bleeding disorders', 'hemophilia'],
};

// Compute therapy recommendations based on symptoms, dosha, and medical history
export const computeRecommendation = (symptoms = [], dosha = null, medicalHistory = []) => {
  const scores = {};

  // Score from dosha
  if (dosha && DOSHA_THERAPY_MAP[dosha]) {
    for (const entry of DOSHA_THERAPY_MAP[dosha]) {
      scores[entry.therapy] = (scores[entry.therapy] || 0) + entry.weight;
    }
  }

  // Score from symptoms (case-insensitive matching)
  for (const symptom of symptoms) {
    const normalizedSymptom = symptom.toLowerCase().trim();
    // Exact match
    if (SYMPTOM_THERAPY_MAP[normalizedSymptom]) {
      for (const therapy of SYMPTOM_THERAPY_MAP[normalizedSymptom]) {
        scores[therapy] = (scores[therapy] || 0) + 20;
      }
    } else {
      // Partial match
      for (const [key, therapies] of Object.entries(SYMPTOM_THERAPY_MAP)) {
        if (normalizedSymptom.includes(key) || key.includes(normalizedSymptom)) {
          for (const therapy of therapies) {
            scores[therapy] = (scores[therapy] || 0) + 10;
          }
        }
      }
    }
  }

  // Remove contraindicated therapies based on medical history conditions
  const conditions = (medicalHistory || []).map(h =>
    (h.condition || '').toLowerCase()
  );
  for (const [therapy, contras] of Object.entries(CONTRAINDICATIONS)) {
    const isContraindicated = contras.some(c =>
      conditions.some(cond => cond.includes(c) || c.includes(cond))
    );
    if (isContraindicated) {
      delete scores[therapy];
    }
  }

  if (Object.keys(scores).length === 0) {
    // Default recommendation when no data available
    return [
      { therapy: 'basti', confidence: 75 },
      { therapy: 'virechana', confidence: 65 },
      { therapy: 'nasya', confidence: 55 },
    ];
  }

  // Normalize to 0-100
  const maxScore = Math.max(...Object.values(scores), 1);
  return Object.entries(scores)
    .map(([therapy, raw]) => ({
      therapy,
      confidence: Math.round((raw / maxScore) * 100),
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
};

// Risk level assessment based on symptoms severity
export const assessRiskLevel = (recentSymptoms = [], healthScoreTrend = []) => {
  const alerts = [];
  let riskScore = 0;

  // Check for severe symptoms
  const severeSymptoms = recentSymptoms.filter(s => s.severity >= 8);
  if (severeSymptoms.length > 0) {
    riskScore += 50;
    alerts.push(`Severe symptoms reported: ${severeSymptoms.map(s => s.symptom).join(', ')}`);
  }

  // Check for declining health score trend
  if (healthScoreTrend.length >= 3) {
    const last3 = healthScoreTrend.slice(-3);
    const declining = last3[2] < last3[1] && last3[1] < last3[0];
    if (declining) {
      riskScore += 30;
      alerts.push('Health score has been declining over the last 3 assessments');
    }
  }

  // Check for moderate symptoms
  const moderateSymptoms = recentSymptoms.filter(s => s.severity >= 5 && s.severity < 8);
  if (moderateSymptoms.length >= 3) {
    riskScore += 20;
    alerts.push('Multiple moderate symptoms reported');
  }

  let riskLevel = 'low';
  if (riskScore >= 60) riskLevel = 'high';
  else if (riskScore >= 30) riskLevel = 'medium';

  return { riskLevel, riskScore, alerts };
};
