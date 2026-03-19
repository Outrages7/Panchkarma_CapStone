const KpiCard = ({ title, value, icon: Icon, color = 'stone', trend, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    saffron: 'bg-stone-50 text-stone-600',
    forest: 'bg-emerald-50 text-emerald-700',
    terracotta: 'bg-orange-50 text-orange-600',
    stone: 'bg-stone-100 text-stone-600',
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-stone-500 mb-1.5">{title}</p>
          <p className="text-2xl font-bold text-stone-900 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-[11px] text-stone-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend.isPositive ? (
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`${colorClasses[color]} p-2.5 rounded-lg`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
