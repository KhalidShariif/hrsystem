import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/api';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Coffee,
  ArrowUpRight,
  ArrowDownRight,
  Timer
} from 'lucide-react';

const EmployeeAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const data = await fetchWithAuth('/employee/me/attendance');
        setAttendance(data);
      } catch (error) {
        console.error('Failed to load attendance', error);
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = attendance.find(a => a.date.split('T')[0] === today);

  const stats = {
    present: attendance.filter(a => a.status === 'present').length,
    late: attendance.filter(a => a.status === 'late').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    leave: attendance.filter(a => a.status === 'leave').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Loading Attendance...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-8 md:mb-10 px-1">
        <div>
          <h2 className="text-on-surface-variant text-[10px] md:text-sm font-semibold tracking-wide uppercase font-label">Live Attendance Tracking</h2>
          <h1 className="text-3xl md:text-[40px] leading-tight font-extrabold text-primary tracking-tight mt-1 font-headline">Attendance</h1>
        </div>
      </div>

      {/* Today's Status Card */}
      <div className="bg-primary text-white rounded-[32px] p-6 md:p-10 mb-10 shadow-2xl shadow-primary/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-white/20 transition-all duration-1000"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 text-center md:text-left">
            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-[32px] flex items-center justify-center text-white ring-8 ring-white/10 shadow-inner ${todayEntry?.status === 'present' || todayEntry?.status === 'late' ? 'bg-emerald-500' : 'bg-white/10'}`}>
              <Calendar size={48} className="text-white/80" />
            </div>
            <div>
              <p className="text-sm font-black text-blue-100 uppercase tracking-[0.3em] mb-2 opacity-60">Today's Attendance</p>
              <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter uppercase">{todayEntry?.status ? (todayEntry.status.charAt(0).toUpperCase() + todayEntry.status.slice(1)) : 'No Record'}</h2>
              <p className="text-blue-100/60 font-bold mt-2">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex gap-4 md:gap-6">
            <div className="px-8 py-6 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md text-center group-hover:scale-105 transition-transform">
              <ArrowUpRight size={16} className="text-emerald-300 mx-auto mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/50 mb-1">Check In</p>
              <p className="text-2xl font-black font-headline tracking-tight">{todayEntry?.checkIn || '--:--'}</p>
            </div>
            <div className="px-8 py-6 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md text-center group-hover:scale-105 transition-transform">
              <ArrowDownRight size={16} className="text-red-300 mx-auto mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/50 mb-1">Check Out</p>
              <p className="text-2xl font-black font-headline tracking-tight">{todayEntry?.checkOut || '--:--'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6 mb-10 px-1">
        {[
          { label: 'Present', val: stats.present, icon: <CheckCircle2 size={18} />, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Late', val: stats.late, icon: <Timer size={18} />, color: 'bg-amber-50 text-amber-600' },
          { label: 'Absent', val: stats.absent, icon: <XCircle size={18} />, color: 'bg-red-50 text-red-600' },
          { label: 'Leave', val: stats.leave, icon: <Coffee size={18} />, color: 'bg-blue-50 text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 md:p-7 rounded-[24px] border border-surface-container shadow-sm flex flex-col justify-between h-32 md:h-40 group hover:shadow-lg transition-all">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>{s.icon}</div>
            <div>
              <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest font-label truncate mb-1">{s.label}</p>
              <h3 className="text-xl md:text-3xl font-black text-primary font-headline tracking-tighter">{s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-surface-container overflow-hidden">
        <div className="px-8 py-6 bg-surface-container-low/30 border-b border-surface-container">
          <h3 className="text-xl font-black text-primary font-headline">Attendance History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 font-label">
                <th className="px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Check In</th>
                <th className="px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Check Out</th>
                <th className="px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Work Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {attendance.length === 0 ? (
                <tr><td colSpan="5" className="py-20 text-center text-on-surface-variant font-bold uppercase tracking-widest text-xs opacity-50">No attendance history found</td></tr>
              ) : attendance.map((entry) => (
                <tr key={entry._id} className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="px-8 py-6 font-bold text-on-surface">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="px-8 py-6 font-bold text-emerald-600">{entry.checkIn || '--:--'}</td>
                  <td className="px-8 py-6 font-bold text-red-600">{entry.checkOut || '--:--'}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${
                      entry.status === 'present' ? 'bg-emerald-50 text-emerald-700' :
                      entry.status === 'late' ? 'bg-amber-50 text-amber-700' :
                      entry.status === 'absent' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-black text-primary font-headline">{entry.workHours ? `${entry.workHours.toFixed(1)} hrs` : '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default EmployeeAttendance;
