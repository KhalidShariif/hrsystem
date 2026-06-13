import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { fetchWithAuth } from '../utils/api';
import { 
  BarChart3, 
  UserPlus, 
  Users, 
  ShieldAlert, 
  Building2, 
  CheckCircle2, 
  Banknote, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  Download, 
  Printer, 
  Briefcase, 
  UserSearch, 
  CalendarClock,
  Clock
} from 'lucide-react';

import { PageHeader, StatCard, ActionButton, TYPOGRAPHY, UI_CLASSES } from '../components/ui/DesignSystem';

const Dashboard = ({ isHR = false }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [absenceQueue, setAbsenceQueue] = useState([]);
  
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [statsData, leavesData, attData] = await Promise.all([
          fetchWithAuth('/dashboard/stats').catch(() => null),
          fetchWithAuth('/leaves').catch(() => []),
          fetchWithAuth('/attendance').catch(() => [])
        ]);
        setStats(statsData);
        
        const today = new Date().toISOString().split('T')[0];
        const todaysAbsences = attData.filter(a => 
          (a.status === 'absent' || a.status === 'leave') && 
          a.date && a.date.split('T')[0] === today
        ).map(a => ({
          _id: 'att_' + a._id,
          employee: a.employee,
          leaveType: a.status === 'absent' ? 'Absent Today' : 'On Leave',
          startDate: a.date,
          endDate: a.date
        }));

        const pendingLeaves = leavesData.filter(l => l.status === 'pending');
        
        setAbsenceQueue([...todaysAbsences, ...pendingLeaves].slice(0, 5));
      } catch (error) {
        console.error('Failed to load dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const openSummaryReport = async () => {
    setIsSummaryModalOpen(true);
    setReportLoading(true);
    try {
      const data = await fetchWithAuth('/reports/summary');
      setReportData(data);
    } catch (err) {
      console.error('Failed to load summary report', err);
    } finally {
      setReportLoading(false);
    }
  };

  const exportReportCSV = () => {
    if (!reportData) return;
    const now = new Date().toLocaleString();
    const rows = [
      ['HR SUMMARY REPORT', now],
      [],
      ['Metric', 'Value'],
      ['Total Employees', reportData.employeeCount],
      ['Departments', reportData.departmentCount],
      ['Present Today', reportData.attendanceSummary?.present || 0],
      ['Late Today', reportData.attendanceSummary?.late || 0],
      ['Absent Today', reportData.attendanceSummary?.absent || 0],
      ['On Leave', reportData.leaveSummary?.totalOnLeave || 0],
      ['Payroll Total (Month)', `$${reportData.payrollSummary?.totalGenerated?.toLocaleString() || 0}`],
      ['Payroll Paid', `$${reportData.payrollSummary?.totalPaid?.toLocaleString() || 0}`],
      ['Active Jobs', reportData.recruitmentSummary?.activeJobs || 0],
      ['Total Candidates', reportData.recruitmentSummary?.totalCandidates || 0],
      [],
      ['Branch Distribution'],
      ['Branch', 'Employees', 'Attendance %'],
      ...(reportData.hubOperationalData || []).map(h => [h.name, h.count, `${h.attendancePercentage}%`]),
      [],
      ['Department Breakdown'],
      ['Department', 'Employees'],
      ...(reportData.departmentDistribution || []).map(d => [d.name, d.count])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hr_summary_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const printSummaryReport = () => window.print();

  const baseRoute = isHR ? '/hr' : '/admin';

  const statCards = [
    { label: 'Total Employees', val: stats?.totalEmployees || 0, sub: 'Active Members', icon: Users, color: 'bg-primary/10 text-primary', path: `${baseRoute}/employees`, hide: isHR },
    { label: 'HR Managers', val: stats?.totalHRManagers || 0, sub: 'System Admins', icon: ShieldAlert, color: 'bg-secondary/10 text-secondary', path: `${baseRoute}/hr-managers` },
    { label: 'Departments', val: stats?.totalDepartments || 0, sub: 'Active Depts', icon: Building2, color: 'bg-surface-container-high text-on-surface', path: `${baseRoute}/departments` },
    { label: 'Attendance', val: stats?.attendanceSummary || 0, sub: "Today's Attendance", icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600', path: `${baseRoute}/attendance`, hide: isHR },
    { label: 'Monthly Payroll', val: `$${stats?.monthlyPayrollTotal || 0}`, sub: 'Total Salary', icon: Banknote, color: 'bg-primary text-white', path: `${baseRoute}/payroll` }
  ].filter(card => !card.hide);

  return (
    <>
      <PageHeader 
        title="Dashboard" 
        subtitle="System Overview & Analytics"
        actions={!isHR && (
          <>
            <ActionButton variant="secondary" icon={BarChart3} onClick={openSummaryReport}>Summary</ActionButton>
            <ActionButton icon={UserPlus} onClick={() => navigate('/admin/employees/add')}>New Hire</ActionButton>
          </>
        )}
      />

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-10">
        {loading ? (
          <div className="col-span-full py-10 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          statCards.map((stat, i) => (
            <StatCard
              key={i}
              title={stat.label}
              value={stat.val}
              subValue={stat.sub}
              icon={stat.icon}
              colorClass={stat.color}
              onClick={() => navigate(stat.path)}
            />
          ))
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className={UI_CLASSES.CARD + " relative overflow-hidden group"}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 relative z-10 gap-4">
              <div>
                <h2 className={TYPOGRAPHY.SECTION_TITLE}>Staff Distribution</h2>
                <p className={TYPOGRAPHY.SMALL + " uppercase tracking-widest mt-1"}>Staffing by {stats?.hubOperationalData ? 'branch' : 'department'}</p>
              </div>
              <div className="flex bg-surface-container-low p-1 rounded-xl shadow-inner">
                <span className="px-4 py-2 bg-white text-primary text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm">Departments</span>
              </div>
            </div>
            <div className="flex items-end justify-between h-64 gap-4 px-2 relative z-10">
              {stats?.departmentDistribution?.length > 0 ? (
                stats.departmentDistribution.map((item) => (
                  <div key={item.name} className="flex flex-col items-center flex-1 gap-4 group">
                    <div
                      className="w-full bg-primary/10 rounded-xl hover:bg-primary transition-all duration-500 group relative shadow-inner overflow-hidden min-h-[4px]"
                      style={{ height: `${Math.max(4, item.value)}%` }}
                    >
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 bg-white px-2 py-1 rounded shadow-sm">
                        {item.count}
                      </span>
                    </div>
                    <span className={TYPOGRAPHY.SMALL + " uppercase tracking-widest truncate w-full text-center"}>{item.name}</span>
                  </div>
                ))
              ) : (
                  <div className="text-center w-full text-on-surface-variant py-20 font-bold uppercase tracking-widest text-xs">No employee data available</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-surface-container">
            <div className="p-6 border-b border-surface-container flex justify-between items-center bg-surface-container-low/30">
              <h2 className={TYPOGRAPHY.SECTION_TITLE + " uppercase tracking-widest"}>Recent Absences</h2>
              <button
                onClick={() => navigate(`${baseRoute}/leave-management`)}
                className="text-xs font-bold text-primary hover:underline uppercase tracking-widest flex items-center gap-2"
              >
                Manage <ArrowRight size={16} className="stroke-[3]" />
              </button>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className={"px-8 py-4 " + TYPOGRAPHY.TABLE_HEADER}>Employee</th>
                    <th className={"px-8 py-4 " + TYPOGRAPHY.TABLE_HEADER}>Category</th>
                    <th className={"px-8 py-4 " + TYPOGRAPHY.TABLE_HEADER}>Duration</th>
                    <th className={"px-8 py-4 " + TYPOGRAPHY.TABLE_HEADER + " text-right"}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {absenceQueue.length > 0 ? absenceQueue.map((leave, i) => (
                    <tr key={leave._id || i} className="hover:bg-surface-container-low/40 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-110 transition-transform shrink-0 uppercase">
                            {leave.employee?.firstName?.charAt(0)}{leave.employee?.lastName?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-on-surface truncate">{leave.employee?.firstName} {leave.employee?.lastName}</p>
                            <p className={TYPOGRAPHY.SMALL + " uppercase tracking-widest mt-0.5 truncate"}>{leave.employee?.position || 'Employee'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm text-on-surface-variant font-medium">{leave.leaveType}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-bold text-primary">{new Date(leave.startDate).toLocaleDateString()}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button onClick={() => navigate(`${baseRoute}/leave-management`)} className="h-9 w-9 bg-surface-container text-on-surface-variant rounded-lg flex items-center justify-center hover:bg-surface-container-high active:scale-90 transition-all ml-auto">
                          <ArrowRight size={16} className="stroke-[3]" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-center py-8 text-on-surface-variant font-bold uppercase tracking-widest text-[10px] opacity-50">No pending absences</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="space-y-8 pb-10">
          <div className="bg-gradient-to-br from-primary to-blue-900 rounded-2xl p-8 text-white shadow-xl shadow-primary/30 relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold font-headline tracking-tight mb-8">System Status</h2>
              <div className="flex items-center gap-6 mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md ring-1 ring-white/20">
                  <ShieldCheck size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold font-headline leading-none">Access Security</p>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1">Secure Data Access</p>
                </div>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Integrity</p>
                  <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded uppercase">Online</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-white h-full w-[100%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className={UI_CLASSES.CARD}>
            <div className="flex justify-between items-center mb-8">
              <h2 className={TYPOGRAPHY.SECTION_TITLE + " uppercase tracking-widest"}>Activity</h2>
              <button className="h-10 w-10 flex items-center justify-center bg-surface-container-low hover:bg-surface-container transition-all rounded-xl text-primary shadow-sm">
                <RefreshCw size={20} className="stroke-[3]" />
              </button>
            </div>
            <div className="space-y-8 relative">
              <div className="absolute left-4 top-2 bottom-2 w-[1px] bg-surface-container-low shadow-inner"></div>

              {[
                {user: 'System', action: 'reported total employee count of', target: stats?.totalEmployees || 0, color: 'bg-primary', time: 'Recently' },
                { user: 'Security', action: 'reported total HR managers count of', target: stats?.totalHRManagers || 0, color: 'bg-emerald-500', time: 'Recently' },
                { user: 'Leave', action: 'updated pending requests to', target: absenceQueue.length, color: 'bg-secondary', time: 'Recently' }
              ].map((item, i) => (
                <div key={i} className="relative pl-12 group/item">
                  <div className={`absolute left-2.5 top-1 w-3 h-3 ${item.color} rounded-full border-2 border-white shadow-sm ring-1 ring-surface-container-low z-10 group-hover/item:scale-125 transition-transform`}></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-relaxed">
                      <span className="font-bold text-primary">{item.user}</span> {item.action} <span className="font-bold text-on-surface">{item.target}</span>.
                    </p>
                    <p className={TYPOGRAPHY.SMALL + " uppercase tracking-widest"}>{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-3.5 text-xs font-bold text-primary uppercase tracking-widest bg-surface-container-low hover:bg-primary hover:text-white rounded-xl transition-all border border-surface-container-high/50">
              View All Activity
            </button>
          </div>
        </div>
      </div>

      {/* Summary Report Modal */}
      <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="Summary Report">
        {reportLoading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Generating Summary Report...</p>
          </div>
        ) : !reportData ? (
          <p className="text-center py-12 text-on-surface-variant font-bold">No data available</p>
        ) : (
          <div className="space-y-6">
            {/* Export Buttons */}
            <div className="flex gap-3">
              <button onClick={exportReportCSV} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-surface-container-low text-primary font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-xl hover:bg-surface-container-high transition-all active:scale-95">
                <Download size={16} className="stroke-[3]" /> Export CSV
              </button>
              <button onClick={printSummaryReport} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-xl hover:opacity-90 transition-all active:scale-95">
                <Printer size={16} className="stroke-[3]" /> Export PDF
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Total Employees', val: reportData.employeeCount, icon: <Users size={20} className="stroke-[3]" />, color: 'text-primary bg-primary/10' },
                { label: 'Departments', val: reportData.departmentCount, icon: <Building2 size={20} className="stroke-[3]" />, color: 'text-tertiary bg-tertiary-fixed/20' },
                { label: 'Present Today', val: (reportData.attendanceSummary?.present || 0) + (reportData.attendanceSummary?.late || 0), icon: <CheckCircle2 size={20} className="stroke-[3]" />, color: 'text-emerald-700 bg-emerald-50' },
                { label: 'On Leave', val: reportData.leaveSummary?.totalOnLeave || 0, icon: <CalendarClock size={20} className="stroke-[3]" />, color: 'text-amber-700 bg-amber-50' },
                { label: 'Active Jobs', val: reportData.recruitmentSummary?.activeJobs || 0, icon: <Briefcase size={20} className="stroke-[3]" />, color: 'text-blue-700 bg-blue-50' },
                { label: 'Candidates', val: reportData.recruitmentSummary?.totalCandidates || 0, icon: <UserSearch size={20} className="stroke-[3]" />, color: 'text-purple-700 bg-purple-50' },
              ].map((kpi, i) => (
                <div key={i} className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                    {kpi.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest truncate">{kpi.label}</p>
                    <p className="text-xl md:text-2xl font-black text-primary font-headline">{kpi.val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payroll Summary */}
            <div className="bg-primary rounded-2xl p-5 text-white shadow-xl shadow-primary/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3">Monthly Payroll</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl md:text-3xl font-black font-headline">${(reportData.payrollSummary?.totalGenerated || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Total Generated</p>
                </div>
                <div className="text-right">
                  <p className="text-lg md:text-xl font-black font-headline text-emerald-300">${(reportData.payrollSummary?.totalPaid || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Paid</p>
                </div>
              </div>
              <div className="mt-4 bg-white/10 rounded-full h-2 overflow-hidden ring-1 ring-white/10">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${reportData.payrollSummary?.totalGenerated > 0 ? ((reportData.payrollSummary.totalPaid / reportData.payrollSummary.totalGenerated) * 100).toFixed(0) : 0}%` }}
                />
              </div>
            </div>

            {/* Attendance Breakdown */}
            <div className="bg-surface-container-low rounded-2xl p-5 border border-surface-container">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">Attendance Breakdown</p>
              <div className="space-y-3">
                {[
                  { label: 'Present', val: reportData.attendanceSummary?.present || 0, color: 'bg-emerald-500' },
                  { label: 'Late', val: reportData.attendanceSummary?.late || 0, color: 'bg-amber-400' },
                  { label: 'Absent', val: reportData.attendanceSummary?.absent || 0, color: 'bg-red-400' },
                  { label: 'Leave', val: reportData.attendanceSummary?.leave || 0, color: 'bg-blue-400' },
                ].map(row => {
                  const total = Object.values(reportData.attendanceSummary || {}).reduce((a, b) => a + b, 0) || 1;
                  const pct = ((row.val / total) * 100).toFixed(0);
                  return (
                    <div key={row.label} className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest w-12">{row.label}</span>
                      <div className="flex-1 bg-surface-container-high rounded-full h-2 overflow-hidden shadow-inner">
                        <div className={`${row.color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-primary w-10 text-right">{row.val}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Branch Distribution */}
            {(reportData.hubOperationalData || []).length > 0 && (
              <div className="bg-surface-container-low rounded-2xl p-5">
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">Branch Distribution</p>
                <div className="space-y-3">
                  {reportData.hubOperationalData.map(hub => (
                    <div key={hub.name} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-primary">{hub.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-bold">{hub.count} employees</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-primary font-headline">{hub.attendancePercentage}%</p>
                        <p className="text-[10px] text-on-surface-variant font-bold">Today</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Department Distribution */}
            {(reportData.departmentDistribution || []).length > 0 && (
              <div className="bg-surface-container-low rounded-2xl p-5">
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">Department Breakdown</p>
                <div className="space-y-3">
                  {reportData.departmentDistribution.map(dept => {
                    const pct = ((dept.count / reportData.employeeCount) * 100).toFixed(0);
                    return (
                      <div key={dept.name} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[11px] font-black text-on-surface">{dept.name}</span>
                          <span className="text-[11px] font-black text-primary">{dept.count} ({pct}%)</span>
                        </div>
                        <div className="bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recruitment */}
            <div className="bg-surface-container-low rounded-2xl p-5">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">Recruitment Pipeline</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Applied', val: reportData.recruitmentSummary?.applied || 0 },
                  { label: 'Interview', val: reportData.recruitmentSummary?.interview || 0 },
                  { label: 'Offered', val: reportData.recruitmentSummary?.offered || 0 },
                ].map(s => (
                  <div key={s.label} className="text-center bg-white rounded-xl p-3">
                    <p className="text-2xl font-black text-primary font-headline">{s.val}</p>
                    <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-widest">
              Generated {new Date().toLocaleString()} · Hayaan HR System
            </p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Dashboard;
