import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";
import { FaStar, FaRegStar, FaHeart } from "react-icons/fa";

const StarRating = ({ value, onChange, disabled }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        disabled={disabled}
        onClick={() => onChange && onChange(star)}
        className="text-2xl transition-transform hover:scale-110 disabled:cursor-default"
      >
        {star <= value
          ? <FaStar className="text-amber-400" />
          : <FaRegStar className="text-stone-300" />}
      </button>
    ))}
  </div>
);

const Feedback = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [form, setForm] = useState({ sessionId: null, rating: 0, comments: "", painLevel: 5, sideEffects: "" });
  const [submitted, setSubmitted] = useState({});

  useEffect(() => {
    api.get("/therapy-sessions/my-sessions")
      .then(res => {
        const data = res.data.data || [];
        setSessions(data.filter(s => s.status === "completed"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openForm = (session) => {
    setForm({
      sessionId: session._id,
      rating: session.patientFeedback?.rating || 0,
      comments: session.patientFeedback?.comments || "",
      painLevel: session.patientFeedback?.painLevel || 5,
      sideEffects: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) return;
    setSubmitting(form.sessionId);
    try {
      await api.post(`/therapy-sessions/${form.sessionId}/feedback`, {
        rating: form.rating,
        comments: form.comments,
        painLevel: form.painLevel,
      });
      if (form.sideEffects.trim()) {
        await api.post(`/therapy-sessions/${form.sessionId}/symptoms`, {
          symptoms: form.sideEffects.split(",").map(s => s.trim()).filter(Boolean),
        });
      }
      setSubmitted(prev => ({ ...prev, [form.sessionId]: true }));
      setForm(f => ({ ...f, sessionId: null }));
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(null);
    }
  };

  const stageLabel = { purvakarma: "Purva Karma", pradhanakarma: "Pradhana Karma", paschatkarma: "Paschat Karma" };
  const stageColor = { purvakarma: "bg-stone-100 text-stone-700", pradhanakarma: "bg-emerald-100 text-emerald-700", paschatkarma: "bg-orange-100 text-orange-700" };

  return (
    <DashboardLayout>
      {/* Dark Premium Page Header matching Sidebar */}
      <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mb-8 mt-2">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
          <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
            <FaHeart className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              Session Feedback
            </h1>
            <p className="text-stone-400 font-medium">
              Rate your therapy sessions and share your experience
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stone-900"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaHeart className="text-2xl text-stone-400" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">No Completed Sessions Yet</h2>
          <p className="text-stone-500 font-medium">Your completed therapy sessions will appear here for feedback.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => {
            const hasFeedback = session.patientFeedback?.rating || submitted[session._id];
            const isOpen = form.sessionId === session._id;

            return (
              <div key={session._id} className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-stone-100 rounded-2xl p-4 shrink-0 border border-stone-200">
                      <FaHeart className="text-stone-400 w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 text-lg">
                        Session #{session.sessionNumber} — <span className="text-emerald-700">{session.therapyType?.displayName || "Therapy Session"}</span>
                      </p>
                      <p className="font-medium text-stone-500">
                        {new Date(session.scheduledDate).toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "long", day: "numeric" })}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {session.stage && (
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${stageColor[session.stage] || "bg-stone-100 text-stone-600"}`}>
                            {stageLabel[session.stage] || session.stage}
                          </span>
                        )}
                        {hasFeedback && session.patientFeedback?.rating && (
                          <div className="flex items-center gap-1 ml-2">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className={`w-3.5 h-3.5 ${i < session.patientFeedback.rating ? "text-amber-400" : "text-stone-200"}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    {hasFeedback ? (
                      <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 inline-flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Feedback Submitted
                      </span>
                    ) : (
                      <button
                        onClick={() => isOpen ? setForm(f => ({ ...f, sessionId: null })) : openForm(session)}
                        className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
                          isOpen 
                          ? "bg-stone-100 text-stone-700 hover:bg-stone-200" 
                          : "bg-stone-900 text-white hover:bg-stone-800 shadow-md"
                        }`}
                      >
                        {isOpen ? "Cancel" : "Leave Feedback"}
                      </button>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-stone-100 p-6 bg-stone-50/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="text-sm font-bold text-stone-900 block mb-3">Overall Rating *</label>
                        <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-stone-900 block mb-2">
                          Pain/Discomfort Level: <span className="text-emerald-700">{form.painLevel}/10</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={form.painLevel}
                          onChange={e => setForm(f => ({ ...f, painLevel: Number(e.target.value) }))}
                          className="w-full xl:w-1/2 accent-emerald-500"
                        />
                        <div className="flex justify-between w-full xl:w-1/2 text-xs font-semibold text-stone-400 mt-1 uppercase tracking-wider">
                          <span>No pain</span>
                          <span>Severe</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-stone-900 block mb-2">Comments</label>
                        <textarea
                          rows={3}
                          value={form.comments}
                          onChange={e => setForm(f => ({ ...f, comments: e.target.value }))}
                          placeholder="How did the session go? Share your experience..."
                          className="w-full border border-stone-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-stone-900 block mb-2">
                          Side Effects / Symptoms to Report <span className="font-medium text-stone-400 normal-case tracking-normal text-xs ml-1">(comma-separated, optional)</span>
                        </label>
                        <input
                          type="text"
                          value={form.sideEffects}
                          onChange={e => setForm(f => ({ ...f, sideEffects: e.target.value }))}
                          placeholder="e.g. mild nausea, fatigue, headache"
                          className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, sessionId: null }))}
                          className="px-6 py-3 text-sm font-bold text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!form.rating || submitting === session._id}
                          className="px-6 py-3 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 disabled:opacity-50 disabled:bg-stone-300 transition-colors shadow-md"
                        >
                          {submitting === session._id ? "Submitting..." : "Submit Feedback"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Feedback;
