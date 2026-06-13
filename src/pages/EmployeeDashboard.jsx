import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
import { 
  User, 
  CalendarCheck, 
  Megaphone, 
  ArrowRight,
  Clock,
  CheckCircle2,
  Bell,
  Briefcase,
  Building2
} from 'lucide-react';

import { PageHeader, StatCard, ActionButton, TYPOGRAPHY, UI_CLASSES } from '../components/ui/DesignSystem';

const EmployeeDashboard = () => {
  const [employee, setEmployee] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [empData, announceData, attData] = await Promise.all([
          fetchWithAuth('/employee/me'),
          fetchWithAuth('/announcements'),
          fetchWithAuth('/employee/me/attendance')
        ]);
        setEmployee(empData);
        setAnnouncements(announceData.slice(0, 3));
        setAttendance(attData);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = attendance.find(a => a.date.split('T')[0] === today);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className={TYPOGRAPHY.SMALL + " uppercase tracking-widest text-primary"}>Loading Portal...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader 
        title={`Welcome, ${employee?.firstName}`} 
        subtitle="Employee Overview"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-1">
        {/* Left Column: Quick Actions & Status */}
        <div className="xl:col-span-8 space-y-8">
          {/* Today's Punch Card */}
          <div className="bg-primary text-white rounded-[32px] p-8 md:p-10 shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-1000"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-4 opacity-60">Attendance Status</p>
                <h2 className="text-4xl md:text-5xl font-bold font-headline tracking-tight mb-4">{todayEntry?.status === 'present' ? 'Present' : todayEntry?.status === 'late' ? 'Late' : 'Not Checked In'}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-blue-100 font-bold">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl backdrop-blur-sm text-xs"><Clock size={16} /> {todayEntry?.checkIn || '--:--'} In</div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl backdrop-blur-sm text-xs"><Clock size={16} /> {todayEntry?.checkOut || '--:--'} Out</div>
                </div>
              </div>
              <Link to="/employee/attendance" className="w-20 h-20 bg-white text-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 group/btn">
                <ArrowRight size={28} className="group-hover/btn:translate-x-1 transition-transform stroke-[3]" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <StatCard
              title="Job Role"
              value={employee?.position}
              icon={User}
              subValue={employee?.department?.name || 'HQ'}
              onClick={() => navigate('/employee/profile')}
            />
            <StatCard
              title="Joined Since"
              value={new Date(employee?.hireDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              icon={Briefcase}
              colorClass="bg-emerald-50 text-emerald-600"
              subValue="Active Account"
            />
          </div>
        </div>

        {/* Right Column: Latest Announcements */}
        <div className="xl:col-span-4">
          <div className={UI_CLASSES.CARD + " h-full flex flex-col bg-surface-container-lowest shadow-inner"}>
            <div className="flex items-center justify-between mb-8">
              <h3 className={TYPOGRAPHY.SECTION_TITLE + " uppercase tracking-widest text-primary"}>Announcements</h3>
              <Link to="/employee/events" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-all">
                <Megaphone size={18} className="stroke-[2.5]" />
              </Link>
            </div>

            <div className="space-y-4 flex-1">
              {announcements.length === 0 ? (
                <div className="text-center py-10 opacity-30">
                  <Bell size={32} className="mx-auto mb-4" />
                  <p className={TYPOGRAPHY.SMALL + " uppercase tracking-widest"}>No announcements</p>
                </div>
              ) : announcements.map((a) => (
                <div key={a._id} className="p-5 bg-white rounded-2xl border border-surface-container hover:border-primary/30 transition-all cursor-pointer group">
                  <p className={TYPOGRAPHY.SMALL + " text-primary uppercase tracking-widest mb-2"}>{new Date(a.createdAt).toLocaleDateString()}</p>
                  <h4 className="text-sm font-bold text-on-surface font-headline leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">{a.title}</h4>
                  <p className="text-xs text-on-surface-variant font-medium line-clamp-2 leading-relaxed opacity-80">{a.message}</p>
                </div>
              ))}
            </div>

            <ActionButton className="w-full mt-10" icon={ArrowRight} onClick={() => navigate('/employee/events')}>
              View All
            </ActionButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;
