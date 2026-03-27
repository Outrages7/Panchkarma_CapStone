import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../services/api";
import {
  FaStar,
  FaRegStar,
  FaTimes,
  FaSpa,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
} from "react-icons/fa";

// ─── Shared Components ──────────────────────────────────────────────────
const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="text-2xl transition-transform hover:scale-125 active:scale-95"
      >
        {star <= value ? (
          <FaStar className="text-amber-400 drop-shadow-sm" />
        ) : (
          <FaRegStar className="text-stone-300 hover:text-amber-300" />
        )}
      </button>
    ))}
  </div>
);

// ─── Patient Follow-Up Popup ────────────────────────────────────────────
const PatientFollowUp = () => {
  const [sessions, setSessions] = useState([]);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({ rating: 0, comments: "", painLevel: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("followup_dismissed") || "[]");
    } catch {
      return [];
    }
  });

  const fetchPending = useCallback(async () => {
    try {
      const res = await api.get("/therapy-sessions/pending-feedback");
      const pending = (res.data.data || []).filter(
        (s) => !dismissed.includes(s._id)
      );
      setSessions(pending);
      if (pending.length > 0 && !current) {
        setCurrent(pending[0]);
      }
    } catch {
      // silently fail
    }
  }, [dismissed, current]);

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 2 * 60 * 1000); // re-check every 2 min
    return () => clearInterval(interval);
  }, [fetchPending]);

  const dismiss = (id) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    sessionStorage.setItem("followup_dismissed", JSON.stringify(updated));
    const remaining = sessions.filter((s) => s._id !== id);
    setSessions(remaining);
    setCurrent(remaining.length > 0 ? remaining[0] : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating || !current) return;
    setSubmitting(true);
    try {
      await api.post(`/therapy-sessions/${current._id}/feedback`, {
        rating: form.rating,
        comments: form.comments,
        painLevel: form.painLevel,
      });
      dismiss(current._id);
      setForm({ rating: 0, comments: "", painLevel: 5 });
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => dismiss(current._id)}
      />

      {/* Popup */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-5 text-white relative">
          <button
            onClick={() => dismiss(current._id)}
            className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FaSpa className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white/80 text-xs font-bold uppercase tracking-wider">
                Session Completed
              </p>
              <h3 className="text-lg font-extrabold">
                How was your session?
              </h3>
            </div>
          </div>
        </div>

        {/* Session Info */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-100">
          <p className="text-sm font-bold text-stone-900">
            {current.therapyType?.displayName || "Therapy Session"}
            <span className="text-stone-400 font-semibold ml-1">
              — Session #{current.sessionNumber}
            </span>
          </p>
          <p className="text-xs font-medium text-stone-500 mt-0.5">
            with Dr. {current.practitioner?.firstName}{" "}
            {current.practitioner?.lastName} •{" "}
            {new Date(current.scheduledDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Rating */}
          <div>
            <label className="text-sm font-bold text-stone-900 block mb-2">
              Overall Rating
            </label>
            <StarRating
              value={form.rating}
              onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
            />
          </div>

          {/* Pain Level */}
          <div>
            <label className="text-sm font-bold text-stone-900 block mb-1">
              Pain/Discomfort:{" "}
              <span className="text-emerald-600">{form.painLevel}/10</span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={form.painLevel}
              onChange={(e) =>
                setForm((f) => ({ ...f, painLevel: Number(e.target.value) }))
              }
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] font-semibold text-stone-400 uppercase tracking-wider mt-0.5">
              <span>None</span>
              <span>Severe</span>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="text-sm font-bold text-stone-900 block mb-1">
              Quick Note{" "}
              <span className="text-stone-400 font-medium text-xs">
                (optional)
              </span>
            </label>
            <textarea
              rows={2}
              value={form.comments}
              onChange={(e) =>
                setForm((f) => ({ ...f, comments: e.target.value }))
              }
              placeholder="Anything you'd like to share..."
              className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => dismiss(current._id)}
              className="flex-1 py-3 text-sm font-bold text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
            >
              Later
            </button>
            <button
              type="submit"
              disabled={!form.rating || submitting}
              className="flex-1 py-3 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 disabled:opacity-50 disabled:bg-stone-300 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  <FaCheckCircle className="w-3.5 h-3.5" /> Submit
                </>
              )}
            </button>
          </div>
        </form>

        {/* Queue indicator */}
        {sessions.length > 1 && (
          <div className="px-6 pb-4 text-center">
            <p className="text-[11px] font-semibold text-stone-400">
              {sessions.length - 1} more session
              {sessions.length > 2 ? "s" : ""} awaiting feedback
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Doctor Overdue Session Banner ──────────────────────────────────────
const DoctorOverdueBanner = () => {
  const [overdue, setOverdue] = useState([]);
  const [endingId, setEndingId] = useState(null);
  const navigate = useNavigate();

  const fetchOverdue = useCallback(async () => {
    try {
      const res = await api.get("/therapy-sessions/overdue");
      setOverdue(res.data.data || []);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchOverdue();
    const interval = setInterval(fetchOverdue, 60 * 1000); // re-check every minute
    return () => clearInterval(interval);
  }, [fetchOverdue]);

  const endSession = async (id) => {
    setEndingId(id);
    try {
      await api.patch(`/therapy-sessions/${id}/end`);
      setOverdue((prev) => prev.filter((s) => s._id !== id));
    } catch {
      // silently fail
    } finally {
      setEndingId(null);
    }
  };

  if (overdue.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      {overdue.map((s) => {
        const elapsed = Math.round(
          (Date.now() - new Date(s.actualStartTime).getTime()) / 60000
        );
        return (
          <div
            key={s._id}
            className="bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden animate-slide-up"
          >
            <div className="bg-red-50 px-4 py-3 flex items-center gap-3 border-b border-red-100">
              <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                <FaExclamationCircle className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
                  Session Overdue
                </p>
                <p className="text-sm font-bold text-stone-900">
                  {s.patient?.firstName} {s.patient?.lastName}
                </p>
              </div>
              <div className="flex items-center gap-1 text-red-600 text-xs font-bold">
                <FaClock className="w-3 h-3" />
                {elapsed}m
              </div>
            </div>
            <div className="px-4 py-3 flex items-center gap-3">
              <p className="flex-1 text-xs font-semibold text-stone-500">
                {s.therapyType?.displayName || "Session"} has been running for{" "}
                {elapsed} minutes
              </p>
              <button
                onClick={() => endSession(s._id)}
                disabled={endingId === s._id}
                className="px-4 py-2 text-xs font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {endingId === s._id ? "Ending..." : "End Now"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Export: Renders correct popup based on user role ───────────────
const SessionFollowUp = () => {
  const user = useSelector((state) => state.auth.user);

  if (!user) return null;

  if (user.role === "patient") return <PatientFollowUp />;
  if (user.role === "doctor") return <DoctorOverdueBanner />;
  return null;
};

export default SessionFollowUp;
