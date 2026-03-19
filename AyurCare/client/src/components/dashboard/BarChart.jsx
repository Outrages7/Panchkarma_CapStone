const BarChart = ({ data, xKey, yKey, title, color = '#3b82f6' }) => {
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item[yKey] / maxValue) * 100 : 0;

          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-32 text-sm font-medium text-gray-700 truncate">
                {item[xKey]}
              </div>
              <div className="flex-1 flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                  >
                    {percentage > 15 && (
                      <span className="text-xs font-medium text-white">
                        {item[yKey]}%
                      </span>
                    )}
                  </div>
                </div>
                {percentage <= 15 && (
                  <span className="text-xs font-medium text-gray-600 w-10 text-right">
                    {item[yKey]}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;
