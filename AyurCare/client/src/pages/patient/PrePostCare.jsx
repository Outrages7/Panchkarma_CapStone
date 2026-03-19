import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";
import {
  FaNotesMedical,
  FaAppleAlt,
  FaHeart,
  FaLeaf,
  FaSeedling,
  FaUtensils,
  FaSpa,
  FaExclamationTriangle,
  FaPhoneAlt,
  FaBan,
} from "react-icons/fa";

const THERAPY_CARE = {
  vamana: {
    pre: ["Consume medicated ghee (Sneha) in increasing doses for 3-5 days", "Avoid cold exposure and cold foods", "Eat light, warm, easily digestible foods", "Apply sesame oil massage daily", "Get adequate sleep and rest"],
    post: ["Start with warm rice gruel (Peya)", "Gradually progress to thin gruel, thick gruel, normal food", "Avoid physical exertion for 7 days", "No cold water or cold foods for 7 days", "Practice Yoga Nidra for relaxation"],
    diet: ["Day 1-3: Warm rice water only", "Day 4-5: Thin rice gruel", "Day 6-7: Thick rice gruel", "Day 8+: Normal light diet", "Avoid spicy, oily, heavy foods for 2 weeks"],
    lifestyle: ["Sleep 8+ hours", "No strenuous exercise for 2 weeks", "Daily warm bath (no cold shower)", "Practice breathing exercises", "Attend follow-up with practitioner"],
  },
  virechana: {
    pre: ["Take Sneha (medicated ghee) for 3-5 days", "Steam therapy (Swedana) daily", "Follow light diet — avoid heavy, oily foods", "Stay hydrated with warm water", "Get proper rest"],
    post: ["Fast after the procedure until hunger returns naturally", "Begin with small amounts of warm rice water", "Avoid raw vegetables and cold foods for 7 days", "Gradually return to normal diet over 1 week", "Rest completely for 1-2 days"],
    diet: ["Warm, easily digestible foods only", "Include cooked vegetables and dal", "Avoid milk products for 3 days", "No spicy or fried foods for 2 weeks", "Ginger tea and warm water recommended"],
    lifestyle: ["Complete rest for 48 hours post-procedure", "Avoid exposure to cold and wind", "No sexual activity for 2 weeks", "Daily meditation for stress management", "Follow-up in 3 days"],
  },
  basti: {
    pre: ["Oil massage (Abhyanga) daily for 3 days", "Light diet — soups, khichdi preferred", "Warm sesame oil application on abdomen", "Avoid gas-causing foods (legumes, raw veggies)", "Maintain regular sleep schedule"],
    post: ["Rest in left lateral position for 30 minutes after each Basti", "Warm oil massage to lower abdomen", "Avoid cold exposure", "Light warm diet — khichdi and soups", "No sitting for prolonged periods"],
    diet: ["Warm soups and broths", "Cooked rice with ghee", "Avoid gas-forming foods", "Herbal teas with ginger and cumin", "Warm buttermilk"],
    lifestyle: ["Gentle yoga — avoid inversions", "Walk in fresh air morning and evening", "Avoid late nights", "Daily Ashwagandha milk at bedtime", "Follow Basti schedule strictly"],
  },
  nasya: {
    pre: ["Warm oil massage to head, neck and shoulders", "Steam inhalation to open nasal passages", "Avoid exposure to cold or dusty environments", "Fast or eat very lightly before the procedure", "Clean nostrils with warm saline water"],
    post: ["Avoid cold water, cold foods, cold environments", "No swimming or exposure to water for 1 hour", "Gargle with warm saline water after procedure", "Avoid smoke and strong smells", "Rest in supine position for 15-20 minutes"],
    diet: ["Warm foods only — soups, cooked vegetables", "Avoid dairy products for 24 hours", "Ginger and turmeric tea beneficial", "Avoid cold drinks", "Light meals throughout the day"],
    lifestyle: ["Sleep with head slightly elevated", "Avoid excessive talking after procedure", "Practice Pranayama breathing exercises", "Protect head from sun and wind", "Regular follow-up for the 5-day course"],
  },
  raktamokshana: {
    pre: ["Iron-rich diet for 1 week before — spinach, pomegranate, dates", "Stay well-hydrated with water and fruit juices", "Avoid blood-thinning medicines (consult practitioner)", "Complete blood count test before procedure", "Light meals on the day of procedure"],
    post: ["Rest completely for 24 hours", "Consume iron-rich foods to rebuild blood", "Pomegranate juice, beetroot juice beneficial", "Keep the treated area clean and dry", "Avoid strenuous activity for 1 week"],
    diet: ["Iron-rich foods: spinach, beetroot, dates, raisins", "Pomegranate juice daily", "Avoid red meat for 3 days", "Plenty of fluids", "Vitamin C rich foods to enhance iron absorption"],
    lifestyle: ["Complete rest for 24 hours", "No vigorous exercise for 1 week", "Wound care as instructed", "Regular blood count monitoring", "Report any unusual bleeding immediately"],
  },
};

const DEFAULT_CARE = {
  pre: ["Follow your practitioner's instructions", "Maintain a light diet", "Stay hydrated", "Get adequate rest", "Inform your practitioner of any medications"],
  post: ["Follow post-procedure dietary guidelines", "Rest as advised", "Take prescribed medicines on time", "Report any adverse symptoms immediately", "Attend follow-up appointments"],
  diet: ["Light, warm, easily digestible foods", "Avoid heavy, spicy, oily foods", "Stay hydrated with warm water and herbal teas", "Follow stage-specific dietary recommendations"],
  lifestyle: ["Get 7-8 hours of sleep", "Avoid stress and overexertion", "Practice gentle yoga and meditation", "Follow your practitioner's lifestyle advice"],
};

const CareSection = ({ title, items, icon: Icon, color }) => (
  <div className={`rounded-3xl border-2 p-5 ${color}`}>
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5" />
      <h3 className="font-bold text-stone-800">{title}</h3>
    </div>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
          <span className="text-stone-400 mt-0.5 shrink-0">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const PrePostCare = () => {
  const [activePlan, setActivePlan] = useState(null);
  const [activeTab, setActiveTab] = useState("pre");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/treatment-plans/my-plans")
      .then(res => {
        const plans = res.data.data || [];
        setActivePlan(plans.find(p => p.status === "active") || plans[0] || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const therapyName = activePlan?.therapyType?.name;
  const care = THERAPY_CARE[therapyName] || DEFAULT_CARE;

  const tabs = [
    { id: "pre", label: "Pre-Procedure Care", Icon: FaSeedling },
    { id: "post", label: "Post-Procedure Care", Icon: FaLeaf },
    { id: "diet", label: "Diet Plan", Icon: FaUtensils },
    { id: "lifestyle", label: "Lifestyle Advice", Icon: FaSpa },
  ];

  return (
    <DashboardLayout>
      {/* Dark Premium Page Header matching Sidebar */}
      <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mb-8 mt-2">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
          <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
            <FaNotesMedical className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              Pre & Post Care
            </h1>
            <p className="text-stone-400 font-medium">
              {activePlan
              ? `Care guide for ${activePlan.therapyType?.displayName || "your therapy"}`
              : "Care guidelines for your Panchakarma therapy"}
            </p>
          </div>
        </div>
      </div>
        
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stone-900"></div>
        </div>
      ) : (
        <div>
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-stone-950 text-white shadow-md transform scale-105"
                    : "bg-white border border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <tab.Icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 gap-4">
            {activeTab === "pre" && (
              <CareSection
                title="Pre-Procedure Preparation"
                items={care.pre}
                icon={FaSeedling}
                color="bg-emerald-50/50 border-emerald-100 text-emerald-900"
              />
            )}
            {activeTab === "post" && (
              <CareSection
                title="Post-Procedure Recovery"
                items={care.post}
                icon={FaLeaf}
                color="bg-stone-50/50 border-stone-100 text-stone-900"
              />
            )}
            {activeTab === "diet" && (
              <CareSection
                title="Dietary Guidelines"
                items={care.diet}
                icon={FaUtensils}
                color="bg-amber-50/50 border-amber-100 text-amber-900"
              />
            )}
            {activeTab === "lifestyle" && (
              <CareSection
                title="Lifestyle Recommendations"
                items={care.lifestyle}
                icon={FaSpa}
                color="bg-stone-50/50 border-stone-100 text-stone-900"
              />
            )}
          </div>
          
          <div className="mt-6 bg-stone-50 rounded-3xl border border-stone-200 p-6 flex items-start gap-4">
            <FaExclamationTriangle className="w-6 h-6 text-stone-400 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-stone-800 mb-1">Important Note</h4>
              <p className="text-sm text-stone-600">
                These are general guidelines. Always strictly follow the specific instructions provided by your Ayurvedic practitioner. If you experience unexpected severe symptoms, contact the clinic immediately.
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PrePostCare;
