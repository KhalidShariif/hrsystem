import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building2, 
  Calendar,
  ShieldCheck,
  Download,
  Printer,
  Banknote,
  Eye,
  EyeOff
} from 'lucide-react';

const EmployeeProfile = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSalary, setShowSalary] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchWithAuth('/employee/me');
        setEmployee(data);
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Fetching Profile...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-10 text-center bg-red-50 rounded-2xl border border-red-100">
        <p className="text-error font-bold">Profile not found. Please contact HR.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-8 md:mb-10 px-1">
        <div>
          <h2 className="text-on-surface-variant text-[10px] md:text-sm font-semibold tracking-wide uppercase font-label">Employee Portal</h2>
          <h1 className="text-3xl md:text-[40px] leading-tight font-extrabold text-primary tracking-tight mt-1 font-headline">My Profile</h1>
        </div>
        <div className="flex items-center gap-3 no-print">
          <button onClick={() => window.print()} className="p-4 bg-white border border-surface-container rounded-xl text-primary hover:bg-surface-container-low transition-all active:scale-95 shadow-sm">
            <Printer size={20} className="stroke-[3]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-10">
        {/* Main Card */}
        <div className="xl:col-span-8 space-y-6 md:space-y-10">
          <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-surface-container relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left mb-10 pb-10 border-b border-surface-container-high">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-[40px] bg-primary/10 flex items-center justify-center text-primary text-5xl font-black shadow-xl shadow-primary/5 ring-8 ring-primary/5">
                {employee.firstName[0]}{employee.lastName[0]}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  <span className="px-4 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20">{employee.employeeId}</span>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${employee.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    Account Status: {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-primary font-headline tracking-tighter mb-2">{employee.firstName} {employee.lastName}</h2>
                <p className="text-lg md:text-xl text-on-surface-variant font-bold opacity-60 uppercase tracking-widest">{employee.position}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative z-10">
              <div className="space-y-8">
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] border-l-4 border-primary pl-4 mb-6">Personal Details</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary/60 shadow-sm"><Mail size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Email Address</p>
                      <p className="text-sm md:text-base font-bold text-on-surface">{employee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary/60 shadow-sm"><Phone size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Phone Number</p>
                      <p className="text-sm md:text-base font-bold text-on-surface">{employee.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary/60 shadow-sm"><MapPin size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Location</p>
                      <p className="text-sm md:text-base font-bold text-on-surface">{employee.district}, {employee.city}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] border-l-4 border-primary pl-4 mb-6">Employment Information</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary/60 shadow-sm"><Building2 size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Department</p>
                      <p className="text-sm md:text-base font-bold text-on-surface">{employee.department?.name || 'HQ'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary/60 shadow-sm"><Briefcase size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Employee Type</p>
                      <p className="text-sm md:text-base font-bold text-on-surface uppercase tracking-tighter">{employee.employeeType.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary/60 shadow-sm"><Calendar size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Joined Date</p>
                      <p className="text-sm md:text-base font-bold text-on-surface">{new Date(employee.hireDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary/60 shadow-sm"><Banknote size={20} /></div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Base Salary</p>
                      <div className="flex items-center gap-4">
                        <p className="text-sm md:text-base font-bold text-primary font-headline">
                          {showSalary ? `$${employee.salary?.toLocaleString()}` : '••••••••'}
                        </p>
                        <button 
                          onClick={() => setShowSalary(!showSalary)}
                          className="p-1 hover:bg-primary/10 rounded transition-colors"
                        >
                          {showSalary ? <EyeOff size={14} className="text-primary/40" /> : <Eye size={14} className="text-primary/40" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="xl:col-span-4 space-y-6 md:space-y-8">
          <div className="bg-primary text-white rounded-[32px] p-8 md:p-10 shadow-2xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 text-center">
              <ShieldCheck size={48} className="mx-auto mb-6 text-white/30" />
              <h3 className="text-xl font-black font-headline uppercase tracking-widest mb-4">Account Verification</h3>
              <p className="text-sm text-blue-100 font-medium leading-relaxed mb-8">This is a verified employee account in the Hayaan HR System.</p>
              <div className="py-6 px-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Branch</p>
                <p className="text-xl font-black font-headline tracking-tight">{employee.hub}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeProfile;
