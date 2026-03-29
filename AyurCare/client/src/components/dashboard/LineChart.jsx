import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const LineChart = ({ data, xAxisKey = "date", dataKey = "count", title, color = '#3b82f6', height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] shadow-sm p-6 w-full h-full min-h-[250px] flex flex-col justify-center items-center">
        {title && <h3 className="text-lg font-semibold mb-4 text-stone-900">{title}</h3>}
        <div className="flex flex-col items-center justify-center text-stone-400">
          <svg className="w-12 h-12 mb-3 text-stone-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
          <span className="text-sm font-semibold tracking-wider uppercase">No data available</span>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-stone-900 text-white p-3 rounded-xl shadow-lg border border-stone-800 text-xs font-bold">
          <p className="text-stone-400 mb-1">{label}</p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
            {payload[0].name}: <span className="text-lg ml-1">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ minHeight: typeof height === 'number' ? height : '100%' }}>
      {title && <h3 className="text-lg font-semibold mb-4 text-stone-900">{title}</h3>}
      <div className="flex-1 w-full relative min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
            <XAxis 
              dataKey={xAxisKey} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#A8A29E', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#A8A29E', fontSize: 10, fontWeight: 700 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E7E5E4', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              name={dataKey.charAt(0).toUpperCase() + dataKey.slice(1)}
              stroke={color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#gradient-${color.replace('#', '')})`} 
              activeDot={{ r: 6, strokeWidth: 0, fill: color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChart;
