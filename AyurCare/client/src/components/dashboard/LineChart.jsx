const LineChart = ({ data, xKey, yKey, title, color = '#3b82f6' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d[yKey]));
  const minValue = Math.min(...data.map((d) => d[yKey]));
  const range = maxValue - minValue || 1;
  const chartHeight = 200;
  const chartWidth = 100;
  const padding = 10;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * (chartWidth - padding * 2) + padding;
      const y = chartHeight - ((d[yKey] - minValue) / range) * (chartHeight - padding * 2) - padding;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="relative">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-64">
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          <polyline
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            points={points}
          />

          <polygon
            fill={`url(#gradient-${title})`}
            points={`${padding},${chartHeight - padding} ${points} ${chartWidth - padding},${chartHeight - padding}`}
          />

          {data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * (chartWidth - padding * 2) + padding;
            const y = chartHeight - ((d[yKey] - minValue) / range) * (chartHeight - padding * 2) - padding;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="0.8"
                fill={color}
                className="hover:r-1.5 transition-all"
              >
                <title>{`${d[xKey]}: ${d[yKey]}`}</title>
              </circle>
            );
          })}
        </svg>

        <div className="flex justify-between mt-4 text-xs text-gray-600">
          {data.length <= 7 ? (
            data.map((d, i) => (
              <span key={i}>{d[xKey]}</span>
            ))
          ) : (
            <>
              <span>{data[0][xKey]}</span>
              <span>{data[Math.floor(data.length / 2)][xKey]}</span>
              <span>{data[data.length - 1][xKey]}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LineChart;
