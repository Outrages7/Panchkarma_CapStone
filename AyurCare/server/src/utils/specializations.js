/**
 * Server-side specialization display name map.
 * Mirrors the client-side specializations.js utility.
 */
const SPECIALIZATION_LABELS = {
  kayachikitsa: 'Kayachikitsa',
  panchakarma: 'Panchakarma',
  shalya_tantra: 'Shalya Tantra',
  shalakya_tantra: 'Shalakya Tantra',
  kaumarabhritya: 'Kaumarabhritya',
  agada_tantra: 'Agada Tantra',
  rasayana: 'Rasayana',
  vajikarana: 'Vajikarana',
  dravyaguna: 'Dravyaguna',
  manas_roga: 'Manas Roga',
};

export const getSpecializationLabel = (key) => {
  if (!key) return 'General';
  return SPECIALIZATION_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export default SPECIALIZATION_LABELS;
