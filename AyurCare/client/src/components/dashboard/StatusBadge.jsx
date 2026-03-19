const StatusBadge = ({ status, type = "appointment" }) => {
  const getStatusConfig = () => {
    if (type === "appointment") {
      const configs = {
        booked: { text: "Booked", classes: "bg-blue-50 text-blue-700" },
        scheduled: { text: "Scheduled", classes: "bg-stone-100 text-stone-600" },
        "in-consultation": { text: "In Progress", classes: "bg-amber-50 text-amber-700" },
        "in-progress": { text: "In Progress", classes: "bg-amber-50 text-amber-700" },
        completed: { text: "Completed", classes: "bg-emerald-50 text-emerald-700" },
        "no-show": { text: "No Show", classes: "bg-red-50 text-red-600" },
        cancelled: { text: "Cancelled", classes: "bg-stone-100 text-stone-500" },
      };
      return configs[status] || configs.booked;
    }

    if (type === "doctor") {
      const configs = {
        available: { text: "Available", classes: "bg-emerald-50 text-emerald-700" },
        "in-consultation": { text: "In Session", classes: "bg-amber-50 text-amber-700" },
        away: { text: "Away", classes: "bg-stone-100 text-stone-500" },
        "on-break": { text: "On Break", classes: "bg-orange-50 text-orange-600" },
        approved: { text: "Approved", classes: "bg-emerald-50 text-emerald-700" },
        pending: { text: "Pending", classes: "bg-amber-50 text-amber-700" },
      };
      return configs[status] || configs.available;
    }

    if (type === "priority") {
      const configs = {
        urgent: { text: "Urgent", classes: "bg-red-50 text-red-600" },
        high: { text: "High", classes: "bg-orange-50 text-orange-600" },
        medium: { text: "Medium", classes: "bg-amber-50 text-amber-700" },
        low: { text: "Low", classes: "bg-emerald-50 text-emerald-700" },
      };
      return configs[status] || configs.medium;
    }

    if (type === "waitlist") {
      const configs = {
        waiting: { text: "Waiting", classes: "bg-amber-50 text-amber-700" },
        assigned: { text: "Assigned", classes: "bg-blue-50 text-blue-700" },
        expired: { text: "Expired", classes: "bg-stone-100 text-stone-500" },
        cancelled: { text: "Cancelled", classes: "bg-red-50 text-red-600" },
      };
      return configs[status] || configs.waiting;
    }

    return { text: status, classes: "bg-stone-100 text-stone-600" };
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${config.classes}`}>
      {config.text}
    </span>
  );
};

export default StatusBadge;
