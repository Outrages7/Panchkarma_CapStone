import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Inline schema to avoid circular imports
const therapyTypeSchema = new mongoose.Schema({
  name: { type: String, enum: ['vamana', 'virechana', 'basti', 'nasya', 'raktamokshana'], required: true, unique: true },
  displayName: { type: String, required: true },
  description: String,
  sanskrit: String,
  primaryDosha: { type: String, enum: ['kapha', 'pitta', 'vata'] },
  totalDurationDays: Number,
  preparationDays: Number,
  recoveryDays: Number,
  stages: [{
    stageName: { type: String, enum: ['purvakarma', 'pradhanakarma', 'paschatkarma'] },
    displayName: String,
    durationDays: Number,
    description: String,
    procedures: [String],
  }],
  indications: [String],
  contraindications: [String],
  medicinesUsed: [String],
  dietaryRequirements: [String],
  estimatedCost: Number,
  successRate: Number,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const TherapyType = mongoose.model('TherapyType', therapyTypeSchema);

const therapyTypes = [
  {
    name: 'vamana',
    displayName: 'Vamana Therapy',
    description: 'Vamana is a medicated emesis therapy that cleanses the respiratory tract and removes Kapha toxins from the body. It is the primary treatment for Kapha-dominant conditions.',
    sanskrit: 'वमन',
    primaryDosha: 'kapha',
    totalDurationDays: 15,
    preparationDays: 5,
    recoveryDays: 7,
    stages: [
      {
        stageName: 'purvakarma',
        displayName: 'Purva Karma (Preparation)',
        durationDays: 5,
        description: 'Preparatory oleation (Snehana) and sudation (Swedana) therapy to loosen and mobilize toxins.',
        procedures: ['Internal Snehana with medicated ghee', 'External Abhyanga massage', 'Steam bath (Swedana)', 'Light diet preparation'],
      },
      {
        stageName: 'pradhanakarma',
        displayName: 'Pradhana Karma (Main Procedure)',
        durationDays: 3,
        description: 'Controlled therapeutic vomiting using herbal medicines to expel Kapha toxins.',
        procedures: ['Administration of Vamana medicines (Madanaphala, Yashthimadhu)', 'Emesis induction', 'Post-emesis care and monitoring'],
      },
      {
        stageName: 'paschatkarma',
        displayName: 'Paschat Karma (Post Procedure)',
        durationDays: 7,
        description: 'Recovery and rejuvenation with progressive diet and lifestyle restoration.',
        procedures: ['Samsarjana Krama (graduated diet)', 'Dhoomapaana (medicated smoking)', 'Rasayana therapy', 'Follow-up assessment'],
      },
    ],
    indications: ['Obesity', 'Bronchial asthma', 'Chronic sinusitis', 'Allergic rhinitis', 'Skin diseases (Psoriasis)', 'Diabetes (early stage)', 'Hypothyroidism'],
    contraindications: ['Pregnancy', 'Cardiac disease', 'Hypertension (severe)', 'Children under 12', 'Elderly (above 75)', 'Malnourishment', 'Acute fever'],
    medicinesUsed: ['Madanaphala', 'Yashthimadhu', 'Vacha', 'Shatavari ghrita', 'Pippali', 'Rock salt'],
    dietaryRequirements: ['Warm rice water (Peya)', 'Thin gruel (Vilepi)', 'Thick gruel (Odana)', 'Gradually progressing to normal diet'],
    estimatedCost: 18000,
    successRate: 88,
  },
  {
    name: 'virechana',
    displayName: 'Virechana Therapy',
    description: 'Virechana is medicated purgation therapy that cleanses the small intestine and removes Pitta toxins. It is the primary treatment for Pitta-dominant diseases.',
    sanskrit: 'विरेचन',
    primaryDosha: 'pitta',
    totalDurationDays: 14,
    preparationDays: 5,
    recoveryDays: 7,
    stages: [
      {
        stageName: 'purvakarma',
        displayName: 'Purva Karma (Preparation)',
        durationDays: 5,
        description: 'Internal and external oleation followed by sudation therapy.',
        procedures: ['Sneha Pana (medicated ghee intake)', 'Sarvanga Abhyanga', 'Bashpa Sweda (steam bath)', 'Dietary restrictions'],
      },
      {
        stageName: 'pradhanakarma',
        displayName: 'Pradhana Karma (Main Procedure)',
        durationDays: 2,
        description: 'Therapeutic purgation using herbal laxatives to expel Pitta toxins.',
        procedures: ['Virechana medicine administration (Trivrit, Senna)', 'Monitoring of bowel movements', 'Vital signs monitoring'],
      },
      {
        stageName: 'paschatkarma',
        displayName: 'Paschat Karma (Post Procedure)',
        durationDays: 7,
        description: 'Post-purgation recovery with Samsarjana Krama diet therapy.',
        procedures: ['Samsarjana Krama diet protocol', 'Rasayana therapy', 'Lifestyle counseling', 'Follow-up'],
      },
    ],
    indications: ['Liver disorders', 'Skin diseases (Eczema, Psoriasis)', 'Inflammatory bowel disease', 'Migraine', 'Hyperacidity', 'Jaundice', 'Blood disorders', 'Eye diseases'],
    contraindications: ['Pregnancy', 'Rectal prolapse', 'Severe dehydration', 'Cardiac weakness', 'Old age with debility', 'Intestinal obstruction'],
    medicinesUsed: ['Trivrit', 'Haritaki', 'Senna leaves', 'Eranda taila', 'Triphala', 'Kutki'],
    dietaryRequirements: ['Complete fast after purgation until hunger', 'Warm rice water', 'Thin soup', 'Gradually increase to light normal diet'],
    estimatedCost: 15000,
    successRate: 91,
  },
  {
    name: 'basti',
    displayName: 'Basti Therapy',
    description: 'Basti is medicated enema therapy, considered the most effective treatment for Vata disorders. It nourishes and cleanses the colon and entire body through the colon.',
    sanskrit: 'बस्ति',
    primaryDosha: 'vata',
    totalDurationDays: 21,
    preparationDays: 5,
    recoveryDays: 5,
    stages: [
      {
        stageName: 'purvakarma',
        displayName: 'Purva Karma (Preparation)',
        durationDays: 5,
        description: 'Oil massage and steam therapy to prepare the body.',
        procedures: ['Abhyanga with warm sesame oil', 'Bashpa Sweda', 'Light diet (Khichdi, soups)', 'Bowel preparation'],
      },
      {
        stageName: 'pradhanakarma',
        displayName: 'Pradhana Karma (Main Procedure)',
        durationDays: 11,
        description: 'Alternating Anuvasana (oil) and Nirooha (decoction) Basti enemas.',
        procedures: ['Anuvasana Basti (medicated oil enema)', 'Nirooha Basti (herbal decoction enema)', 'Post-Basti oil massage', 'Rest protocols'],
      },
      {
        stageName: 'paschatkarma',
        displayName: 'Paschat Karma (Post Procedure)',
        durationDays: 5,
        description: 'Recovery with specific diet and lifestyle recommendations.',
        procedures: ['Colon rejuvenation diet', 'Gentle yoga', 'Herbal supplements', 'Follow-up assessment'],
      },
    ],
    indications: ['Joint disorders (Arthritis)', 'Paralysis', 'Neurological conditions', 'Constipation (chronic)', 'Lower back pain', 'Sciatica', 'Infertility', 'Parkinson\'s disease'],
    contraindications: ['Pregnancy', 'Diarrhea (active)', 'Rectal bleeding', 'Inflammatory bowel disease (acute)', 'After enema within 24 hours', 'Fever'],
    medicinesUsed: ['Dashamula kwatha', 'Bala taila', 'Sahacharadi taila', 'Mahamasha taila', 'Rock salt', 'Honey'],
    dietaryRequirements: ['Warm soups and broths', 'Cooked rice with ghee', 'Khichdi', 'Herbal teas', 'Avoid gas-forming foods'],
    estimatedCost: 25000,
    successRate: 85,
  },
  {
    name: 'nasya',
    displayName: 'Nasya Therapy',
    description: 'Nasya is nasal administration of medicated oils or powders. It cleanses the head region and is the primary treatment for diseases above the shoulders.',
    sanskrit: 'नस्य',
    primaryDosha: 'vata',
    totalDurationDays: 10,
    preparationDays: 2,
    recoveryDays: 3,
    stages: [
      {
        stageName: 'purvakarma',
        displayName: 'Purva Karma (Preparation)',
        durationDays: 2,
        description: 'Head, neck and shoulder massage with steam inhalation.',
        procedures: ['Pratimarsha Nasya (daily nasal oil)', 'Head and neck Abhyanga', 'Steam inhalation', 'Nasal cavity cleansing'],
      },
      {
        stageName: 'pradhanakarma',
        displayName: 'Pradhana Karma (Main Procedure)',
        durationDays: 5,
        description: 'Administration of medicated nasal drops in specific dosage and pattern.',
        procedures: ['Nasya medicine instillation', 'Head tilt position maintenance', 'Gargling with warm saline', 'Kavala (oil pulling)'],
      },
      {
        stageName: 'paschatkarma',
        displayName: 'Paschat Karma (Post Procedure)',
        durationDays: 3,
        description: 'Post-procedure care focusing on head protection and diet.',
        procedures: ['Head protection from cold and wind', 'Dhoomapaana', 'Anjana (eye care)', 'Follow-up assessment'],
      },
    ],
    indications: ['Sinusitis', 'Migraine', 'Hair loss (Alopecia)', 'Cervical spondylosis', 'Facial palsy', 'Eye diseases', 'Ear diseases', 'Sleep disorders', 'Memory disorders'],
    contraindications: ['Pregnancy (first trimester)', 'After heavy meals', 'During fever', 'During menstruation', 'In children under 7', 'Immediately after exercise'],
    medicinesUsed: ['Anu taila', 'Shadbindu taila', 'Brahmi ghrita', 'Vacha churna', 'Pippali', 'Apamarga kshara'],
    dietaryRequirements: ['Warm foods only', 'Ginger and turmeric tea', 'Avoid dairy for 24 hours', 'Light meals', 'Warm water'],
    estimatedCost: 8000,
    successRate: 90,
  },
  {
    name: 'raktamokshana',
    displayName: 'Raktamokshana Therapy',
    description: 'Raktamokshana is bloodletting therapy used to purify the blood and treat Pitta-Rakta (blood) vitiated diseases. Methods include leech therapy and venipuncture.',
    sanskrit: 'रक्तमोक्षण',
    primaryDosha: 'pitta',
    totalDurationDays: 10,
    preparationDays: 3,
    recoveryDays: 5,
    stages: [
      {
        stageName: 'purvakarma',
        displayName: 'Purva Karma (Preparation)',
        durationDays: 3,
        description: 'Blood building diet and preparation for the procedure.',
        procedures: ['Iron-rich diet protocol', 'Blood count testing (CBC)', 'Site preparation', 'Consultation and consent'],
      },
      {
        stageName: 'pradhanakarma',
        displayName: 'Pradhana Karma (Main Procedure)',
        durationDays: 2,
        description: 'Controlled bloodletting using leeches (Jalaukavacharana) or venipuncture.',
        procedures: ['Leech application (Jalaukavacharana)', 'Siravyadha (venipuncture)', 'Monitoring of blood removal', 'Wound care'],
      },
      {
        stageName: 'paschatkarma',
        displayName: 'Paschat Karma (Post Procedure)',
        durationDays: 5,
        description: 'Blood recovery with iron-rich diet and wound care.',
        procedures: ['Iron and nutritional supplementation', 'Wound dressing (if applicable)', 'Rest protocol', 'Follow-up blood count', 'Rasayana therapy'],
      },
    ],
    indications: ['Skin diseases (severe Psoriasis, Eczema)', 'Varicose veins', 'Gout', 'Inflammatory conditions', 'Herpes', 'Abscess', 'Blood-borne toxin conditions'],
    contraindications: ['Anemia', 'Pregnancy', 'Blood clotting disorders', 'On blood thinners', 'Children and elderly', 'Severe systemic illness', 'Hemophilia'],
    medicinesUsed: ['Manjishtha', 'Sariva', 'Neem (Nimba)', 'Guduchi', 'Haridra', 'Turmeric', 'Pomegranate juice'],
    dietaryRequirements: ['Iron-rich foods (spinach, pomegranate, dates)', 'Pomegranate juice daily', 'Vitamin C rich foods', 'Plenty of fluids', 'Avoid red meat initially'],
    estimatedCost: 12000,
    successRate: 82,
  },
];

async function seedTherapyTypes() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI or MONGO_URI not found in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully.\n');

    let created = 0;
    let updated = 0;

    for (const therapy of therapyTypes) {
      const existing = await TherapyType.findOne({ name: therapy.name });
      if (existing) {
        await TherapyType.updateOne({ name: therapy.name }, therapy);
        console.log(`  ✓ Updated: ${therapy.displayName}`);
        updated++;
      } else {
        await TherapyType.create(therapy);
        console.log(`  + Created: ${therapy.displayName}`);
        created++;
      }
    }

    console.log(`\nSeeding complete! Created: ${created}, Updated: ${updated}`);
    console.log('All 5 Panchakarma therapy types are ready.\n');
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedTherapyTypes();
