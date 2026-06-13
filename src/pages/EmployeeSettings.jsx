import React, { useState, useEffect } from 'react';
import { Key, User, Bell, ChevronRight, Mail, Phone, Hash, Building2, MapPin, Calendar, Briefcase, CheckCircle2 } from 'lucide-react';
import { fetchWithAuth } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const EmployeeSettings = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('security');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    announcements: true,
    attendance: true,
    leave: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchWithAuth('/employee/me');
        setProfile(data);
        if (data.notificationSettings) {
          setNotificationSettings(data.notificationSettings);
        }
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    try {
      setIsSaving(true);
      setMessage({ type: '', text: '' });
      
      await fetchWithAuth('/employee/me/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      setMessage({ type: 'success', text: 'Password updated' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Update failed' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationSave = async () => {
    try {
      setIsSaving(true);
      setMessage({ type: '', text: '' });
      
      await fetchWithAuth('/employee/me/notifications', {
        method: 'PUT',
        body: JSON.stringify(notificationSettings)
      });

      setMessage({ type: 'success', text: 'Notifications saved' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save' });
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { id: 'security', label: 'Change Password', icon: <Key size={18} /> },
    { id: 'profile', label: 'Profile Information', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <header className="mb-10">
        <h1 className="text-3xl md:text-[40px] leading-tight font-extrabold text-primary tracking-tight font-headline">Settings</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        {/* Navigation Sidebar */}
        <div className="md:col-span-4 space-y-3">
          {sections.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setMessage({ type: '', text: '' });
              }}
              className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border ${
                activeSection === item.id 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20 border-primary' 
                  : 'bg-white text-on-surface-variant hover:bg-surface-container-low border-surface-container'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={activeSection === item.id ? 'text-white' : 'text-primary'}>{item.icon}</div>
                <span className="text-sm font-bold">{item.label}</span>
              </div>
              <ChevronRight size={16} className={activeSection === item.id ? 'text-white/40' : 'text-outline/40'} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-8">
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <p className="text-xs font-bold uppercase tracking-widest">{message.text}</p>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="bg-white rounded-[32px] p-8 md:p-10 border border-surface-container shadow-sm">
              <h3 className="text-xl font-black text-primary font-headline tracking-tight mb-8">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Current Password</label>
                  <input
                    required
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">New Password</label>
                    <input
                      required
                      type="password"
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Confirm Password</label>
                    <input
                      required
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto px-10 py-5 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all text-xs"
                >
                  {isSaving ? 'Saving...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="bg-white rounded-[32px] p-8 md:p-10 border border-surface-container shadow-sm">
              <h3 className="text-xl font-black text-primary font-headline tracking-tight mb-8">Profile Information</h3>
              {loading ? (
                <div className="py-10 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
              ) : profile ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0"><User size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-1">Full Name</p>
                      <p className="text-sm font-bold text-on-surface">{profile.firstName} {profile.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0"><Mail size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-1">Email</p>
                      <p className="text-sm font-bold text-on-surface">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0"><Phone size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-1">Phone</p>
                      <p className="text-sm font-bold text-on-surface">{profile.phone || 'Not Provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0"><Hash size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-1">Employee ID</p>
                      <p className="text-sm font-bold text-on-surface">{profile.employeeId}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0"><Building2 size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-1">Department</p>
                      <p className="text-sm font-bold text-on-surface">{profile.department?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0"><Briefcase size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-1">Position</p>
                      <p className="text-sm font-bold text-on-surface">{profile.position}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0"><MapPin size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-1">Branch/Location</p>
                      <p className="text-sm font-bold text-on-surface">{profile.hub}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0"><Calendar size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-1">Joined Date</p>
                      <p className="text-sm font-bold text-on-surface">{profile.hireDate ? new Date(profile.hireDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-on-surface-variant">Profile not found.</p>
              )}
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="bg-white rounded-[32px] p-8 md:p-10 border border-surface-container shadow-sm">
              <h3 className="text-xl font-black text-primary font-headline tracking-tight mb-8">Notifications</h3>
              <div className="space-y-6 mb-10">
                {[
                  { id: 'announcements', label: 'Announcements', desc: 'Get notified about company-wide updates' },
                  { id: 'attendance', label: 'Attendance updates', desc: 'Receive alerts about your check-in status' },
                  { id: 'leave', label: 'Leave updates', desc: 'Status updates on your leave requests' }
                ].map(toggle => (
                  <div key={toggle.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-surface-container">
                    <div>
                      <p className="text-sm font-bold text-primary">{toggle.label}</p>
                      <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{toggle.desc}</p>
                    </div>
                    <button 
                      onClick={() => setNotificationSettings({...notificationSettings, [toggle.id]: !notificationSettings[toggle.id]})}
                      className={`w-12 h-6 rounded-full relative transition-all duration-300 ${notificationSettings[toggle.id] ? 'bg-primary' : 'bg-outline/20'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${notificationSettings[toggle.id] ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleNotificationSave}
                disabled={isSaving}
                className="w-full sm:w-auto px-10 py-5 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all text-xs flex items-center justify-center gap-3"
              >
                {isSaving ? 'Saving...' : <><CheckCircle2 size={16} className="stroke-[3]" /> Save Changes</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeSettings;
