/**
 * Ayurvedic specialization definitions used across frontend and backend.
 * Each specialization includes a display name, description, icon name (react-icons/fa), and color.
 */

export const AYURVEDIC_SPECIALIZATIONS = {
  kayachikitsa: {
    displayName: 'Kayachikitsa',
    description: 'Internal Medicine — treats systemic diseases like diabetes, arthritis, and digestive disorders.',
    iconName: 'FaHeartbeat',
    bgColor: 'bg-red-500',
  },
  panchakarma: {
    displayName: 'Panchakarma',
    description: 'Detox & Purification — specializes in the five cleansing therapies for deep rejuvenation.',
    iconName: 'FaSpa',
    bgColor: 'bg-emerald-600',
  },
  shalya_tantra: {
    displayName: 'Shalya Tantra',
    description: 'Ayurvedic Surgery — handles surgical conditions using traditional techniques.',
    iconName: 'FaCut',
    bgColor: 'bg-amber-600',
  },
  shalakya_tantra: {
    displayName: 'Shalakya Tantra',
    description: 'ENT & Ophthalmology — treats disorders of the eyes, ears, nose, and throat.',
    iconName: 'FaEye',
    bgColor: 'bg-sky-500',
  },
  kaumarabhritya: {
    displayName: 'Kaumarabhritya',
    description: 'Pediatrics & Gynecology — focuses on women\'s and children\'s health.',
    iconName: 'FaBaby',
    bgColor: 'bg-pink-500',
  },
  agada_tantra: {
    displayName: 'Agada Tantra',
    description: 'Toxicology — deals with poisons, venoms, and environmental toxins.',
    iconName: 'FaShieldAlt',
    bgColor: 'bg-yellow-500',
  },
  rasayana: {
    displayName: 'Rasayana',
    description: 'Rejuvenation & Anti-aging — promotes longevity, immunity, and tissue regeneration.',
    iconName: 'FaSeedling',
    bgColor: 'bg-green-500',
  },
  vajikarana: {
    displayName: 'Vajikarana',
    description: 'Reproductive Medicine — enhances fertility and reproductive health.',
    iconName: 'FaHeart',
    bgColor: 'bg-rose-500',
  },
  dravyaguna: {
    displayName: 'Dravyaguna',
    description: 'Pharmacology — specializes in medicinal herbs, formulations, and their properties.',
    iconName: 'FaLeaf',
    bgColor: 'bg-teal-500',
  },
  manas_roga: {
    displayName: 'Manas Roga',
    description: 'Psychiatry & Mental Health — treats psychological and neurological conditions using Ayurveda.',
    iconName: 'FaBrain',
    bgColor: 'bg-purple-600',
  },
};

export const SPECIALIZATION_OPTIONS = Object.entries(AYURVEDIC_SPECIALIZATIONS).map(
  ([value, { displayName, description }]) => ({
    value,
    label: displayName,
    description,
  })
);

export const getSpecializationLabel = (key) => {
  if (!key) return '—';
  return AYURVEDIC_SPECIALIZATIONS[key]?.displayName || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const getSpecializationDescription = (key) => {
  return AYURVEDIC_SPECIALIZATIONS[key]?.description || '';
};

/**
 * Get full specialization info including icon name and color.
 * Components should map iconName to the actual react-icons component.
 */
export const getSpecializationInfo = (key) => {
  const spec = AYURVEDIC_SPECIALIZATIONS[key];
  if (spec) return spec;
  return {
    displayName: key ? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'General',
    description: 'Specialized Ayurvedic care',
    iconName: 'FaUserMd',
    bgColor: 'bg-stone-500',
  };
};

export default AYURVEDIC_SPECIALIZATIONS;
