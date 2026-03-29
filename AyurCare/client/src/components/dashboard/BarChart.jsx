import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const BarChart = ({ data, xAxisKey = "name", dataKey = "count", title, color = '#3b82f6', height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] shadow-sm p-6 w-full h-full min-h-[250px] flex flex-col justify-center items-center">
        {title && <h3 className="text-lg font-semibold mb-4 text-stone-900">{title}</h3>}
        <div className="flex flex-col items-center justify-center text-stone-400">
          <svg className="w-12 h-12 mb-3 text-stone-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          <span className="text-sm font-semibold tracking-wider uppercase">No data available</span>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-stone-900 text-white p-3 rounded-xl shadow-lg border border-stone-800 text-xs font-bold z-50">
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
          <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F5F4' }} />
            <Bar dataKey={dataKey} name={dataKey.charAt(0).toUpperCase() + dataKey.slice(1)} radius={[6, 6, 6, 6]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={color} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChart;
