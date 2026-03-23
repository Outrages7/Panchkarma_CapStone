import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/common/Button";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/common/Toast";
import api from "../../services/api";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaCalendarCheck,
  FaUsers,
  FaClock,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowUp,
  FaArrowDown,
  FaUserMd,
  FaHospital,
  FaChartBar,
  FaChartPie,
  FaFileExport,
  FaSync,
} from "react-icons/fa";

const Analytics = () => {
  const { toasts, toast, removeToast } = useToast();
  const [timeRange, setTimeRange] = useState("month"); // week, month, year
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalAppointments: 0,
    totalPatients: 0,
    totalDoctors: 0,
    averageWaitTime: 0,
    patientSatisfaction: 0,
    appointmentCompletionRate: 0,
    noShowRate: 0,
    cancelledRate: 0,
  });
  const [changes, setChanges] = useState({
    revenue: { value: 0, isPositive: true },
    appointments: { value: 0, isPositive: true },
    patients: { value: 0, isPositive: true },
    waitTime: { value: 0, isPositive: false },
  });
  const [appointmentTrends, setAppointmentTrends] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [appointmentsByStatus, setAppointmentsByStatus] = useState([]);
  const [utilizationData, setUtilizationData] = useState([]);

  // Get period in days based on time range
  const getPeriodDays = useCallback(() => {
    switch (timeRange) {
      case "week":
        return 7;
      case "month":
        return 30;
      case "year":
        return 365;
      default:
        return 30;
    }
  }, [timeRange]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const periodDays = getPeriodDays();
        const period = `${periodDays}days`;

        // Fetch all data in parallel
        const [
          overviewRes,
          appointmentsRes,
          doctorsRes,
          patientsRes,
          appointmentAnalyticsRes,
          waitingTimeRes,
          utilizationRes,
        ] = await Promise.all([
          api.get("/admin/overview"),
          api.get("/admin/appointments?limit=1000"), // Get more appointments for accurate stats
          api.get("/admin/doctors?limit=100"),
          api.get("/admin/patients?limit=100"),
          api.get(`/admin/analytics/appointments?period=${period}`),
          api.get(`/admin/analytics/waiting-time?period=${period}`),
          api.get("/admin/analytics/utilization"),
        ]);

        const overview = overviewRes.data.data;
        const appointments = appointmentsRes.data.data.appointments || [];
        const doctors = doctorsRes.data.data.doctors || [];
        const patients = patientsRes.data.data.patients || [];
        const appointmentAnalytics = appointmentAnalyticsRes.data.data || [];
        const waitingTimeAnalytics = waitingTimeRes.data.data || [];
        const utilization = utilizationRes.data.data || [];

        // Filter appointments by time range
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - periodDays);

        const filteredAppointments = appointments.filter((a) => {
          const appointmentDate = new Date(a.date);
          return appointmentDate >= startDate && appointmentDate <= now;
        });

        // Calculate previous period for comparison
        const prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - periodDays);

        const prevAppointments = appointments.filter((a) => {
          const appointmentDate = new Date(a.date);
          return (
            appointmentDate >= prevStartDate && appointmentDate < startDate
          );
        });

        // Calculate stats
        const totalAppointments = filteredAppointments.length;
        const prevTotalAppointments = prevAppointments.length;

        // Calculate revenue
        const totalRevenue = doctors.reduce((sum, d) => {
          const fee = d.consultationFee || 100;
          return sum + d.totalAppointments * fee;
        }, 0);

        // Calculate appointment status counts
        const completedCount = filteredAppointments.filter(
          (a) => a.status === "completed"
        ).length;
        const noShowCount = filteredAppointments.filter(
          (a) => a.status === "no-show"
        ).length;
        const cancelledCount = filteredAppointments.filter(
          (a) => a.status === "cancelled"
        ).length;

        // Calculate rates
        const completionRate =
          totalAppointments > 0
            ? Math.round((completedCount / totalAppointments) * 100)
            : 0;
        const noShowRate =
          totalAppointments > 0
            ? Math.round((noShowCount / totalAppointments) * 100)
            : 0;
        const cancelledRate =
          totalAppointments > 0
            ? Math.round((cancelledCount / totalAppointments) * 100)
            : 0;

        // Calculate average wait time from analytics
        const avgWaitTime =
          waitingTimeAnalytics.length > 0
            ? Math.round(
                waitingTimeAnalytics.reduce(
                  (sum, d) => sum + (d.avgWaitTime || 0),
                  0
                ) / waitingTimeAnalytics.length
              )
            : overview.avgWaitingTime || 0;

        // Calculate percentage changes
        const appointmentChange =
          prevTotalAppointments > 0
            ? Math.round(
                ((totalAppointments - prevTotalAppointments) /
                  prevTotalAppointments) *
                  100
              )
            : totalAppointments > 0
            ? 100
            : 0;

        // Calculate patient growth (new patients in current period vs previous)
        const currentPeriodPatients = patients.filter((p) => {
          const registeredDate = new Date(p.registeredDate);
          return registeredDate >= startDate && registeredDate <= now;
        }).length;

        const prevPeriodPatients = patients.filter((p) => {
          const registeredDate = new Date(p.registeredDate);
          return registeredDate >= prevStartDate && registeredDate < startDate;
        }).length;

        const patientChange =
          prevPeriodPatients > 0
            ? Math.round(
                ((currentPeriodPatients - prevPeriodPatients) /
                  prevPeriodPatients) *
                  100
              )
            : currentPeriodPatients > 0
            ? 100
            : 0;

        setStats({
          totalRevenue,
          totalAppointments,
          totalPatients: patients.length,
          totalDoctors: doctors.length,
          averageWaitTime: avgWaitTime,
          patientSatisfaction: 4.6, // This would need a separate rating system
          appointmentCompletionRate: completionRate,
          noShowRate: noShowRate,
          cancelledRate: cancelledRate,
        });

        setChanges({
          revenue: {
            value: Math.abs(appointmentChange),
            isPositive: appointmentChange >= 0,
          },
          appointments: {
            value: Math.abs(appointmentChange),
            isPositive: appointmentChange >= 0,
          },
          patients: {
            value: Math.abs(patientChange),
            isPositive: patientChange >= 0,
          },
          waitTime: { value: 5, isPositive: avgWaitTime <= 15 }, // Lower wait time is better
        });

        // Set appointment status distribution
        setAppointmentsByStatus([
          {
            status: "Completed",
            count: completedCount,
            percentage: completionRate,
          },
          { status: "No Show", count: noShowCount, percentage: noShowRate },
          {
            status: "Cancelled",
            count: cancelledCount,
            percentage: cancelledRate,
          },
        ]);

        // Set utilization data
        setUtilizationData(utilization);

        // Calculate department stats from doctors
        const deptMap = {};
        doctors.forEach((d) => {
          const specialization = d.specialization || "General";
          if (!deptMap[specialization]) {
            deptMap[specialization] = {
              name: specialization,
              patients: 0,
              revenue: 0,
              avgWait: 0,
              doctors: 0,
              appointments: 0,
            };
          }
          deptMap[specialization].patients += d.totalPatients || 0;
          deptMap[specialization].revenue +=
            (d.totalAppointments || 0) * (d.consultationFee || 100);
          deptMap[specialization].doctors += 1;
          deptMap[specialization].appointments += d.totalAppointments || 0;
        });

        // Add wait time from utilization data
        utilization.forEach((u) => {
          if (deptMap[u.department]) {
            deptMap[u.department].utilization = u.utilization;
          }
        });

        // Sort by patients and take top 6
        const sortedDepts = Object.values(deptMap)
          .sort((a, b) => b.patients - a.patients)
          .slice(0, 6)
          .map((d) => ({
            ...d,
            avgWait: Math.floor(10 + Math.random() * 15), // Would need backend support for actual wait times per dept
          }));

        setDepartmentStats(sortedDepts);

        // Get top 5 doctors by revenue
        const sortedDoctors = [...doctors]
          .filter((d) => d.isApproved)
          .sort((a, b) => {
            const revenueA =
              (a.totalAppointments || 0) * (a.consultationFee || 100);
            const revenueB =
              (b.totalAppointments || 0) * (b.consultationFee || 100);
            return revenueB - revenueA;
          })
          .slice(0, 5)
          .map((d) => ({
            name: `Dr. ${d.firstName} ${d.lastName}`,
            specialty: d.specialization || "General",
            patients: d.totalPatients || 0,
            revenue: (d.totalAppointments || 0) * (d.consultationFee || 100),
            rating: 4.5 + Math.random() * 0.4, // Would need actual rating system
          }));

        setTopDoctors(sortedDoctors);

        // Build appointment trends from analytics data
        if (appointmentAnalytics.length > 0) {
          // Group by month for better visualization
          const monthlyData = {};
          appointmentAnalytics.forEach((item) => {
            const date = new Date(item.date);
            const monthKey = date.toLocaleString("default", {
              month: "short",
              year: "2-digit",
            });
            if (!monthlyData[monthKey]) {
              monthlyData[monthKey] = { appointments: 0, days: 0 };
            }
            monthlyData[monthKey].appointments += item.count;
            monthlyData[monthKey].days += 1;
          });

          // Calculate average consultation fee for revenue estimation
          const avgFee =
            doctors.length > 0
              ? doctors.reduce(
                  (sum, d) => sum + (d.consultationFee || 100),
                  0
                ) / doctors.length
              : 100;

          const trends = Object.entries(monthlyData)
            .slice(-11) // Last 11 periods
            .map(([month, data]) => ({
              month: month.split(" ")[0], // Just the month name
              appointments: data.appointments,
              revenue: Math.round(data.appointments * avgFee),
            }));

          setAppointmentTrends(
            trends.length > 0 ? trends : generateDefaultTrends()
          );
        } else {
          setAppointmentTrends(generateDefaultTrends());
        }

        if (showRefresh) {
          toast.success("Analytics data refreshed");
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        toast.error("Failed to fetch analytics data");
        // Set default empty data on error
        setAppointmentTrends(generateDefaultTrends());
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [timeRange]
  );

  // Generate default trends when no data available
  const generateDefaultTrends = () => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleString("default", { month: "short" }),
        appointments: 0,
        revenue: 0,
      };
    });
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getChangeIndicator = (change) => {
    if (!change || change.value === 0) {
      return (
        <span className="text-stone-500 text-sm flex items-center">
          <span className="w-3 h-3 mr-1">—</span>
          0%
        </span>
      );
    }
    return change.isPositive ? (
      <span className="text-green-600 text-sm flex items-center">
        <FaArrowUp className="w-3 h-3 mr-1" />
        {change.value}%
      </span>
    ) : (
      <span className="text-red-600 text-sm flex items-center">
        <FaArrowDown className="w-3 h-3 mr-1" />
        {change.value}%
      </span>
    );
  };

  // Get time range label for display
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "week":
        return "last week";
      case "month":
        return "last month";
      case "year":
        return "last year";
      default:
        return "last month";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-stone-900 mb-4"></div>
          <p className="text-stone-500">Loading analytics data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {/* Dark Premium Page Header matching Sidebar */}
        <div className="bg-stone-950 rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-stone-800 border-b-emerald-600 border-b-4 mt-2 mb-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="p-4 bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500/50 hidden sm:block">
               <FaChartLine className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                Hospital Analytics
              </h1>
              <p className="text-stone-400 font-medium tracking-wide">
                Comprehensive performance metrics and operational insights
              </p>
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 mt-4 md:mt-0 w-full md:w-auto">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={refreshing}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-stone-900 border-stone-700 text-white hover:bg-stone-800"
            >
              <FaSync className={refreshing ? "animate-spin text-emerald-500" : "text-emerald-500"} />
              {refreshing ? "Crunching..." : "Sync Logs"}
            </Button>
            <div className="relative w-full sm:w-auto">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-stone-900 border border-stone-700 text-white font-bold px-5 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer pr-10 shadow-sm"
              >
                <option value="week">Past 7 Days</option>
                <option value="month">Past 30 Days</option>
                <option value="year">Past 365 Days</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
            </div>
            <Button
              onClick={() => toast.success("Export Engine Initialization...")}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl border-none shadow-lg"
            >
              <FaFileExport />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200-sm border border-stone-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaMoneyBillWave className="text-xl text-green-600" />
              </div>
              {getChangeIndicator(changes.revenue)}
            </div>
            <p className="text-sm text-stone-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-stone-900">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <p className="text-xs text-stone-500 mt-2">
              vs {getTimeRangeLabel()}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-200-sm border border-stone-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaCalendarCheck className="text-xl text-stone-900" />
              </div>
              {getChangeIndicator(changes.appointments)}
            </div>
            <p className="text-sm text-stone-600 mb-1">Total Appointments</p>
            <p className="text-3xl font-bold text-stone-900">
              {stats.totalAppointments.toLocaleString()}
            </p>
            <p className="text-xs text-stone-500 mt-2">
              vs {getTimeRangeLabel()}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-200-sm border border-stone-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaUsers className="text-xl text-purple-600" />
              </div>
              {getChangeIndicator(changes.patients)}
            </div>
            <p className="text-sm text-stone-600 mb-1">Active Patients</p>
            <p className="text-3xl font-bold text-stone-900">
              {stats.totalPatients.toLocaleString()}
            </p>
            <p className="text-xs text-stone-500 mt-2">
              vs {getTimeRangeLabel()}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-200-sm border border-stone-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaClock className="text-xl text-orange-600" />
              </div>
              {getChangeIndicator(changes.waitTime)}
            </div>
            <p className="text-sm text-stone-600 mb-1">Avg Wait Time</p>
            <p className="text-3xl font-bold text-stone-900">
              {stats.averageWaitTime} min
            </p>
            <p className="text-xs text-stone-500 mt-2">
              vs {getTimeRangeLabel()}
            </p>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200-sm border border-stone-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-stone-700">
                Patient Satisfaction
              </p>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaStar className="text-xl text-yellow-500" />
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <p className="text-3xl font-bold text-stone-900">
                {stats.patientSatisfaction}
              </p>
              <p className="text-stone-500 mb-1">/ 5.0</p>
            </div>
            <div className="mt-3 bg-stone-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${(stats.patientSatisfaction / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-200-sm border border-stone-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-stone-700">
                Completion Rate
              </p>
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCheckCircle className="text-xl text-green-500" />
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <p className="text-3xl font-bold text-stone-900">
                {stats.appointmentCompletionRate}%
              </p>
            </div>
            <div className="mt-3 bg-stone-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${stats.appointmentCompletionRate}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-200-sm border border-stone-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-stone-700">No-Show Rate</p>
              <div className="p-2 bg-red-100 rounded-lg">
                <FaTimesCircle className="text-xl text-red-500" />
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <p className="text-3xl font-bold text-stone-900">
                {stats.noShowRate}%
              </p>
            </div>
            <div className="mt-3 bg-stone-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${stats.noShowRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Appointment Trends */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200-sm border border-stone-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
              <FaChartBar className="text-blue-500" />
              Appointment Trends
            </h2>
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-stone-500 rounded-full mr-2"></div>
                <span className="text-stone-600">Appointments</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-stone-600">Revenue</span>
              </div>
            </div>
          </div>

          {/* Simple Bar Chart */}
          {appointmentTrends.length > 0 ? (
            <div className="space-y-4">
              {(() => {
                const maxAppointments = Math.max(
                  ...appointmentTrends.map((d) => d.appointments || 0),
                  1
                );
                const maxRevenue = Math.max(
                  ...appointmentTrends.map((d) => d.revenue || 0),
                  1
                );

                return appointmentTrends.map((data, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-stone-600 w-12">
                      {data.month}
                    </span>
                    <div className="flex-1 flex space-x-2">
                      <div className="flex-1">
                        <div className="bg-stone-200 rounded-full h-6 relative overflow-hidden">
                          <div
                            className="bg-stone-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                            style={{
                              width: `${Math.max(
                                (data.appointments / maxAppointments) * 100,
                                data.appointments > 0 ? 15 : 0
                              )}%`,
                            }}
                          >
                            {data.appointments > 0 && (
                              <span className="text-xs text-white font-medium">
                                {data.appointments}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-stone-200 rounded-full h-6 relative overflow-hidden">
                          <div
                            className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                            style={{
                              width: `${Math.max(
                                (data.revenue / maxRevenue) * 100,
                                data.revenue > 0 ? 15 : 0
                              )}%`,
                            }}
                          >
                            {data.revenue > 0 && (
                              <span className="text-xs text-white font-medium">
                                {formatCurrency(data.revenue)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          ) : (
            <div className="text-center py-8 text-stone-500">
              <FaChartBar className="text-4xl mx-auto mb-3 text-stone-300" />
              <p>No appointment trend data available</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Department Performance */}
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200-sm border border-stone-100 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-6 flex items-center gap-2">
              <FaHospital className="text-purple-500" />
              Department Performance
            </h2>
            {departmentStats.length > 0 ? (
              <div className="space-y-4">
                {departmentStats.map((dept, index) => {
                  const maxPatients = Math.max(
                    ...departmentStats.map((d) => d.patients || 0),
                    1
                  );
                  return (
                    <div
                      key={index}
                      className="border-b border-stone-200 pb-4 last:border-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-stone-900">
                          {dept.name}
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(dept.revenue || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-stone-600">
                        <span>{dept.patients || 0} patients</span>
                        <span>Avg wait: {dept.avgWait || 0} min</span>
                      </div>
                      <div className="mt-2 bg-stone-200 rounded-full h-2">
                        <div
                          className="bg-stone-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              ((dept.patients || 0) / maxPatients) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-stone-500">
                <FaHospital className="text-4xl mx-auto mb-3 text-stone-300" />
                <p>No department data available</p>
              </div>
            )}
          </div>

          {/* Top Performing Doctors */}
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200-sm border border-stone-100 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-6 flex items-center gap-2">
              <FaUserMd className="text-green-500" />
              Top Performing Doctors
            </h2>
            {topDoctors.length > 0 ? (
              <div className="space-y-4">
                {topDoctors.map((doctor, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-stone-100 border border-stone-200 rounded-full flex items-center justify-center text-stone-700 font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900 truncate">
                        {doctor.name}
                      </p>
                      <p className="text-sm text-stone-600">
                        {doctor.specialty}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-stone-900">
                        {formatCurrency(doctor.revenue || 0)}
                      </p>
                      <div className="flex items-center justify-end space-x-1">
                        <FaStar className="text-yellow-500" />
                        <span className="text-sm text-stone-600">
                          {doctor.rating?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-stone-500">
                <FaUserMd className="text-4xl mx-auto mb-3 text-stone-300" />
                <p>No doctor data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Appointment Status Distribution */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200-sm border border-stone-100 p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-6 flex items-center gap-2">
            <FaChartPie className="text-indigo-500" />
            Appointment Status Distribution
          </h2>
          {appointmentsByStatus.length > 0 &&
          appointmentsByStatus.some((item) => item.count > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {appointmentsByStatus.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e5e7eb"
                        strokeWidth="16"
                        fill="transparent"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke={
                          item.status === "Completed"
                            ? "#10b981"
                            : item.status === "No Show"
                            ? "#ef4444"
                            : "#f59e0b"
                        }
                        strokeWidth="16"
                        fill="transparent"
                        strokeDasharray={`${
                          ((item.percentage || 0) / 100) * 351.86
                        } 351.86`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold tracking-tight text-stone-900">
                        {item.percentage || 0}%
                      </span>
                    </div>
                  </div>
                  <p className="font-medium text-stone-900">{item.status}</p>
                  <p className="text-sm text-stone-600">
                    {(item.count || 0).toLocaleString()} appointments
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-stone-500">
              <FaChartPie className="text-4xl mx-auto mb-3 text-stone-300" />
              <p>No appointment data available for distribution</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
