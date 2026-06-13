import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/api';
import { 
  Megaphone, 
  Calendar, 
  User, 
  ArrowRight,
  Bell,
  Clock,
  MapPin,
  Building2,
  Globe,
  CheckCircle2
} from 'lucide-react';

const EmployeeEvents = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await fetchWithAuth('/announcements');
        setAnnouncements(data);
      } catch (error) {
        console.error('Failed to load announcements', error);
      } finally {
        setLoading(false);
      }
    };
    loadAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Loading Announcements...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-8 md:mb-10 px-1">
        <div>
          <h2 className="text-on-surface-variant text-[10px] md:text-sm font-semibold tracking-wide uppercase font-label">News & Announcements</h2>
          <h1 className="text-3xl md:text-[40px] leading-tight font-extrabold text-primary tracking-tight mt-1 font-headline">Company Announcements</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12">
        <div className="xl:col-span-8 space-y-6 md:space-y-8">
          {announcements.length === 0 ? (
            <div className="bg-white rounded-[32px] p-20 text-center border border-dashed border-surface-container">
              <Megaphone size={64} className="text-outline/20 mx-auto mb-6" />
              <h3 className="text-xl font-black text-primary font-headline mb-2">No Announcements</h3>
              <p className="text-on-surface-variant font-medium">There are no active company announcements at this time.</p>
            </div>
          ) : announcements.map((a) => (
            <div key={a._id} className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-surface-container hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
              
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] ${
                    a.targetType === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' :
                    a.targetType === 'branch' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {a.targetType === 'all' ? <Globe size={12} /> : a.targetType === 'branch' ? <MapPin size={12} /> : <Building2 size={12} />}
                    {a.targetType === 'all' ? 'Company-wide Notice' : a.targetValue}
                  </span>
                  <span className="flex items-center gap-2 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">
                    <Clock size={12} /> {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-black text-primary font-headline tracking-tighter mb-4 group-hover:text-primary-variant transition-colors">{a.title}</h3>
                <p className="text-on-surface-variant text-base md:text-lg leading-relaxed font-medium mb-8 whitespace-pre-wrap">{a.message}</p>
                
                <div className="pt-8 border-t border-surface-container-high flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User size={18} className="text-primary" />
                    </div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">HR Department</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="xl:col-span-4 space-y-6 md:space-y-8">
          <div className="bg-surface-container-lowest rounded-[32px] p-8 md:p-10 border border-surface-container relative overflow-hidden shadow-inner">
             <div className="relative z-10">
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-8">Portal Status</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><CheckCircle2 size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface mb-1">Network</p>
                      <p className="text-xs font-medium text-on-surface-variant">Active Connection</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><Clock size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface mb-1">Time Sync</p>
                      <p className="text-xs font-medium text-on-surface-variant">Last synced 2m ago</p>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          <div className="sidebar-gradient rounded-[32px] p-8 md:p-10 text-white relative overflow-hidden group shadow-2xl shadow-primary/20">
             <div className="absolute top-0 left-0 w-full h-full bg-primary mix-blend-overlay opacity-50"></div>
              <div className="relative z-10">
                <Bell size={40} className="text-white/30 mb-6 group-hover:rotate-12 transition-transform" />
                <h3 className="text-xl font-black font-headline tracking-tighter mb-4">Company Updates</h3>
                <p className="text-sm text-blue-100 font-bold leading-relaxed mb-8">All company updates are verified by the HR Management office before posting.</p>
                <div className="p-5 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">Announcement Count</p>
                   <p className="text-2xl font-black font-headline tracking-tighter">{announcements.length}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeEvents;
