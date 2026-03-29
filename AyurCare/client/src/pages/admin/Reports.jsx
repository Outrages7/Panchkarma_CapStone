import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LineChart from "../../components/dashboard/LineChart";
import BarChart from "../../components/dashboard/BarChart";
import DataTable from "../../components/dashboard/DataTable";
import api from "../../services/api";
import { FaFileAlt, FaDownload, FaChartBar, FaUsers, FaLeaf, FaStar } from "react-icons/fa";

const StatCard = ({ label, value, sub, color, icon: Icon }) => (
  <div className={`rounded-[2rem] p-6 shadow-sm border border-stone-200 relative overflow-hidden group hover:shadow-md transition-all bg-white`}>
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-110 ${color.split(' ')[0]}`}></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${color}`}>
         {Icon && <Icon className="text-xl" />}
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-xs font-bold text-stone-500 uppercase tracking-widest block mb-1">{label}</p>
      <div className="flex items-end gap-3">
         <p className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">{value}</p>
      </div>
      {sub && <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-4 pt-4 border-t border-stone-100">{sub}</p>}
    </div>
  </div>
);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [appointmentsChart, setAppointmentsChart] = useState([]);
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [overviewRes, chartRes] = await Promise.allSettled([
        api.get("/admin/overview"),
        api.get("/admin/analytics/appointments", { params: { days: dateRange } }),
      ]);
      if (overviewRes.status === "fulfilled") setOverview(overviewRes.value.data.data);
      if (chartRes.status === "fulfilled") setAppointmentsChart(chartRes.value.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const therapyBreakdown = [
    { name: "Vamana", count: overview?.therapyCounts?.vamana || 12, revenue: 180000 },
    { name: "Virechana", count: overview?.therapyCounts?.virechana || 18, revenue: 270000 },
    { name: "Basti", count: overview?.therapyCounts?.basti || 25, revenue: 375000 },
    { name: "Nasya", count: overview?.therapyCounts?.nasya || 9, revenue: 90000 },
    { name: "Raktamokshana", count: overview?.therapyCounts?.raktamokshana || 6, revenue: 120000 },
  ];

  const totalRevenue = therapyBreakdown.reduce((sum, t) => sum + t.revenue, 0);
  const totalSessions = therapyBreakdown.reduce((sum, t) => sum + t.count, 0);

  const therapyColumns = [
    {
      key: "name",
      label: "Target Modality",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
             <FaLeaf className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-stone-900 text-sm">{row.name}</span>
        </div>
      )
    },
    {
      key: "count",
      label: "Frequency Base",
      sortable: true,
      render: (row) => (
        <span className="text-sm font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">{row.count}</span>
      )
    },
    {
      key: "revenue",
      label: "Monetary Yield",
      sortable: true,
      render: (row) => (
        <span className="text-sm font-black text-stone-900">₹{row.revenue.toLocaleString("en-IN")}</span>
      )
    },
    {
      key: "share",
      label: "Earning Share",
      sortable: false,
      render: (row) => (
        <div className="flex justify-start gap-3 flex-col sm:flex-row items-start sm:items-center">
          <div className="w-full sm:w-24 bg-stone-100 rounded-full h-1.5 order-2 sm:order-1 relative overflow-hidden">
            <div
              className="bg-purple-500 h-1.5 rounded-full absolute top-0 left-0 bottom-0 transition-all duration-500"
              style={{ width: `${Math.round((row.revenue / totalRevenue) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-stone-500 order-1 sm:order-2 w-8 text-right bg-stone-50 px-2 py-0.5 rounded-md border border-stone-100">{Math.round((row.revenue / totalRevenue) * 100)}%</span>
        </div>
      )
    }
  ];

  const downloadCSV = (data, filename) => {
    const keys = Object.keys(data[0] || {});
    const csv = [keys.join(","), ...data.map(row => keys.map(k => row[k]).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mt-2 mb-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
              <FaFileAlt className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                Reports & Analytics
              </h1>
              <p className="text-stone-400 font-medium tracking-wide">
                Track clinical trajectories, financial KPIs, and deep therapy insights
              </p>
            </div>
          </div>
          
          <div className="relative z-10">
             <div className="relative">
               <select
                 value={dateRange}
                 onChange={e => setDateRange(e.target.value)}
                 className="appearance-none bg-stone-900 border border-stone-700 text-white font-bold px-6 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer pr-12 shadow-sm w-full md:w-auto"
               >
                 <option value="7">Trailing 7 Days</option>
                 <option value="30">Trailing 30 Days</option>
                 <option value="90">Fiscal Quarter</option>
                 <option value="365">Trailing 12 Months</option>
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                 <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
               </div>
             </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center flex-col items-center py-32 bg-stone-50/50 rounded-3xl border border-stone-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-stone-900"></div>
            <p className="text-stone-500 font-bold tracking-widest uppercase text-[10px] mt-6 animate-pulse">Gathering Telemetry...</p>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {/* KPI Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard
                icon={FaChartBar}
                label="Global Sessions"
                value={overview?.totalSessions || totalSessions}
                sub={`Trailing ${dateRange} days volume`}
                color="bg-amber-50 text-amber-600 border-amber-100"
              />
              <StatCard
                icon={FaUsers}
                label="Active Census"
                value={overview?.activePatients || overview?.totalPatients || "—"}
                sub="Patients in Active Pipeline"
                color="bg-blue-50 text-blue-600 border-blue-100"
              />
              <StatCard
                icon={FaStar}
                label="Win Target %"
                value={`${overview?.therapySuccessRate || 87}%`}
                sub="Effective therapy yield"
                color="bg-emerald-50 text-emerald-600 border-emerald-100"
              />
              <StatCard
                icon={FaLeaf}
                label="Gross Earnings"
                value={`₹${(totalRevenue / 1000).toFixed(0)}K`}
                sub={`Total yielding capital last ${dateRange}d`}
                color="bg-purple-50 text-purple-600 border-purple-100"
              />
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-6 sm:p-8 flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-8 shrink-0">
                  <div>
                    <h3 className="font-extrabold text-stone-900 flex items-center gap-2 text-lg">
                      <FaChartBar className="text-blue-500" />
                      Session Trajectory Matrix
                    </h3>
                    <p className="text-xs font-semibold text-stone-500 mt-1 pl-6">Aggregated volume velocity</p>
                  </div>
                  <button
                    onClick={() => downloadCSV(appointmentsChart, "sessions-trend.csv")}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-stone-100 px-3 py-2 rounded-lg hover:bg-stone-200 hover:text-stone-800 transition-colors"
                  >
                    <FaDownload className="w-3 h-3" /> Get CSV
                  </button>
                </div>
                <div className="flex-1 w-full relative min-h-0 min-w-0">
                   <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                     <LineChart data={appointmentsChart} dataKey="count" xAxisKey="date" color="#3b82f6" height="100%" />
                   </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-6 sm:p-8 flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-8 shrink-0">
                  <div>
                    <h3 className="font-extrabold text-stone-900 flex items-center gap-2 text-lg">
                      <FaLeaf className="text-emerald-500" />
                      Treatment Distribution Index
                    </h3>
                    <p className="text-xs font-semibold text-stone-500 mt-1 pl-6">Modality spread and split</p>
                  </div>
                  <button
                    onClick={() => downloadCSV(therapyBreakdown, "therapy-breakdown.csv")}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-stone-100 px-3 py-2 rounded-lg hover:bg-stone-200 hover:text-stone-800 transition-colors"
                  >
                    <FaDownload className="w-3 h-3" /> Get CSV
                  </button>
                </div>
                <div className="flex-1 w-full relative min-h-0 min-w-0">
                   <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                     <BarChart data={therapyBreakdown} dataKey="count" xAxisKey="name" color="#10b981" height="100%" />
                   </div>
                </div>
              </div>
            </div>

            {/* Deep Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               
               {/* Patient Insights Panel */}
               <div className="bg-stone-950 rounded-[2rem] shadow-lg p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between">
                 <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                 
                 <div className="relative z-10">
                   <h3 className="font-extrabold text-white mb-6 flex items-center gap-3 text-lg border-b border-stone-800 pb-4">
                     <span className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                       <FaUsers className="w-4 h-4" />
                     </span>
                     Sub-Census Insights
                   </h3>
                   
                   <div className="space-y-4">
                     {[
                       { label: "Gross Entity Count", value: overview?.totalPatients || "—", color: "text-stone-300" },
                       { label: "Engaged Therapies", value: overview?.activePatients || "—", color: "text-blue-400" },
                       { label: "Lifecycle Completions", value: overview?.completedTreatments || "—", color: "text-emerald-400" },
                       { label: "Acquisition Cohort (Monthly)", value: overview?.newPatientsThisMonth || "—", color: "text-white font-black" },
                       { label: "Std. Lifecycle Length", value: "45 min Avg", color: "text-stone-400" },
                       { label: "Resolution Guarantee", value: `${overview?.therapySuccessRate || 87}%`, color: "text-amber-400" },
                     ].map(item => (
                       <div key={item.label} className="flex justify-between items-center group">
                         <span className="text-xs font-semibold text-stone-500 group-hover:text-stone-400 transition-colors tracking-wide">{item.label}</span>
                         <span className={`text-sm font-bold ${item.color} bg-stone-900 px-3 py-1 rounded-lg border border-stone-800`}>{item.value}</span>
                       </div>
                     ))}
                   </div>
                 </div>
                 
                 <div className="mt-8 pt-6 border-t border-stone-800 relative z-10">
                    <div className="flex items-center justify-between mb-3">
                       <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Aggregate Rating Engine</span>
                       <span className="text-sm font-black text-white flex items-center gap-1.5"><FaStar className="text-amber-400" /> {overview?.patientSatisfaction || 4.5}</span>
                    </div>
                    <div className="w-full bg-stone-900 rounded-full h-2">
                       <div className="bg-amber-400 h-2 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.3)]" style={{ width: `${((overview?.patientSatisfaction || 4.5) / 5) * 100}%` }}></div>
                    </div>
                 </div>
               </div>

               {/* Therapy Breakdown Table */}
               <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden flex flex-col lg:col-span-2">
                 <div className="p-6 sm:p-8 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/50">
                   <div>
                     <h3 className="font-extrabold text-stone-900 text-lg flex items-center gap-2">
                        <FaFileAlt className="text-stone-400" /> Datatable Inspector
                     </h3>
                     <p className="text-xs font-semibold text-stone-500 mt-1">Cross-referencing revenue to clinical yields</p>
                   </div>
                   <button
                     onClick={() => downloadCSV(therapyBreakdown, "therapy-revenue.csv")}
                     className="flex items-center gap-2 text-xs font-bold bg-white border border-stone-200 text-stone-700 px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors shadow-sm w-full sm:w-auto justify-center"
                   >
                     <FaDownload className="w-3.5 h-3.5" /> Pull Dataset
                   </button>
                 </div>
                 <div className="overflow-x-auto">
                   <DataTable columns={therapyColumns} data={therapyBreakdown} />
                   <table className="w-full">
                     <tbody>
                       <tr className="bg-stone-900 border-t-2 border-stone-950">
                         <td className="px-6 py-4 font-black text-white text-sm uppercase tracking-widest text-[10px] w-1/4">Net Computations</td>
                         <td className="px-6 py-4 font-black text-emerald-400 text-sm bg-stone-800/50">{totalSessions} Vol</td>
                         <td className="px-6 py-4 font-black text-emerald-400 text-sm bg-stone-800/50">₹{totalRevenue.toLocaleString("en-IN")}</td>
                         <td className="px-6 py-4 text-[10px] font-black text-stone-500 bg-stone-800/50 text-right"><span className="border border-stone-700 w-max inline-block px-3 py-1 rounded-md">100.0% Aggregate Share</span></td>
                       </tr>
                     </tbody>
                   </table>
                 </div>
               </div>

            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
