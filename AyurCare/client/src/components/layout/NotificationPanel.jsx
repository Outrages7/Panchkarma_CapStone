import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  FaBell,
  FaCalendarCheck,
  FaLeaf,
  FaSpa,
  FaCog,
  FaExclamationTriangle,
  FaCheck,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

const TYPE_CONFIG = {
  appointment: { icon: FaCalendarCheck, color: "text-blue-500", bg: "bg-blue-50" },
  treatment: { icon: FaLeaf, color: "text-emerald-500", bg: "bg-emerald-50" },
  session: { icon: FaSpa, color: "text-purple-500", bg: "bg-purple-50" },
  system: { icon: FaCog, color: "text-stone-500", bg: "bg-stone-100" },
  alert: { icon: FaExclamationTriangle, color: "text-red-500", bg: "bg-red-50" },
};

const timeAgo = (date) => {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      setUnreadCount(res.data.data?.count || 0);
    } catch {
      // silently fail
    }
  };

  // Fetch notifications list
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications?limit=20");
      setNotifications(res.data.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  // Poll unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch full list when panel opens
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silently fail
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      const removed = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (removed && !removed.isRead) setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silently fail
    }
  };

  const handleClick = (n) => {
    if (!n.isRead) markAsRead(n._id);
    if (n.link) {
      navigate(n.link);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
      >
        <FaBell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-black leading-none ring-2 ring-white px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[380px] max-h-[500px] bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50 flex flex-col animate-fade-in">
          {/* Header */}
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-[11px] font-semibold text-stone-500 mt-0.5">
                  {unreadCount} unread
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
                >
                  <FaCheck className="w-2.5 h-2.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-400"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaBell className="w-5 h-5 text-stone-300" />
                </div>
                <p className="text-sm font-semibold text-stone-400">No notifications yet</p>
                <p className="text-xs text-stone-400 mt-1">You're all caught up</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
                const Icon = cfg.icon;
                return (
                  <div
                    key={n._id}
                    onClick={() => handleClick(n)}
                    className={`group flex gap-3 px-5 py-3.5 border-b border-stone-100/60 last:border-0 cursor-pointer transition-colors hover:bg-stone-50/80 ${
                      !n.isRead ? "bg-emerald-50/30" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-[13px] leading-tight ${
                            !n.isRead
                              ? "font-bold text-stone-900"
                              : "font-semibold text-stone-600"
                          }`}
                        >
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5"></div>
                        )}
                      </div>
                      <p className="text-[12px] text-stone-500 font-medium mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-stone-400 font-semibold mt-1.5 uppercase tracking-wider">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0 self-center"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
