import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { useMobileMenu } from '../context/MobileMenuContext';
import { fetchWithAuth, API_URL } from '../utils/api';
import { 
  Search, 
  Bell, 
  BellOff, 
  LogOut, 
  CalendarClock, 
  ClipboardCheck, 
  ShieldCheck, 
  UserSearch, 
  Info,
  Camera,
  Menu,
  AlertOctagon
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const { toggleSidebar } = useMobileMenu();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const isHR = location.pathname.startsWith('/hr');

  const [showNotifications, setShowNotifications] = useState(false);

  // Close notifications on route change
  useEffect(() => {
    setShowNotifications(false);
  }, [location.pathname]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchWithAuth('/notifications');
        setNotifications(data);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // Polling every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      await fetchWithAuth(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      await handleMarkAsRead(n._id);
    }
    
    setShowNotifications(false);

    // Dynamic Navigation Logic
    switch (n.type) {
      case 'application':
        if (n.referenceId) {
          navigate(isHR ? `/hr/recruitment/candidates/${n.referenceId}` : `/admin/recruitment/candidates/${n.referenceId}`);
        } else {
          navigate(isHR ? '/hr/recruitment' : '/admin/recruitment');
        }
        break;
      case 'conduct':
      case 'conduct_report':
        if (n.link) {
          navigate(n.link);
        } else if (n.relatedId || n.referenceId) {
          navigate(`/admin/conduct-reports/${n.relatedId || n.referenceId}`);
        }
        break;
      case 'leave':
        navigate(isHR ? '/hr/leave-management' : '/admin/leave-management');
        break;
      case 'attendance':
        navigate(isHR ? '/hr/attendance' : '/admin/attendance');
        break;
      case 'status':
        if (n.title.includes('HR Manager')) {
          navigate(isHR ? '/hr/settings' : '/admin/hr-managers');
        }
        break;
      default:
        if (user.role === 'employee') {
          navigate('/employee/settings');
        } else {
          navigate(isHR ? '/hr/settings' : '/admin/dashboard');
        }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Please select an image file (PNG, JPG, JPEG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Max 5MB allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/hr-managers/me/profile-image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        refreshUser();
      } else {
        const error = await response.json();
        alert(error?.response?.data?.message || error?.message || 'Action failed');
      }
    } catch (error) {
      console.error('Avatar upload failed', error);
      alert('Network error, please try again');
    } finally {
      setIsUploading(false);
    }
  };

  const API_URL_BASE = 'http://localhost:5000';
  const profileImage = user?.profileImage ? `${API_URL_BASE}${user.profileImage}` : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=00236F&color=fff`;

  if (!user) return null;

  return (
    <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex justify-between items-center border-b border-surface-container-high transition-all">
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden w-11 h-11 flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant rounded-xl transition-all shrink-0 active:scale-90"
        >
          <Menu size={20} className="stroke-[2.5]" />
        </button>
        
        <div className="relative w-full max-w-xs md:max-w-md group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform duration-200 stroke-[3]" />
          <input 
            className="w-full bg-surface-container-low border-none py-3 pl-12 pr-6 text-sm focus:ring-2 focus:ring-primary/10 focus:bg-white rounded-xl transition-all placeholder:text-outline/50 font-medium" 
            placeholder="Search..." 
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 mr-4 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-11 h-11 flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant rounded-full transition-all relative group active:scale-90"
            >
              <Bell size={20} className="group-hover:rotate-12 transition-transform stroke-[2.5]" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-error text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-surface px-1">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-2xl border border-surface-container overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low/30">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary font-headline">Notifications</h4>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded-full uppercase tracking-tighter">{unreadCount} Recent</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center">
                        <BellOff size={32} className="text-outline/30 mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-outline/50">No recent notifications</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n._id} 
                          onClick={() => handleNotificationClick(n)}
                          className={`p-4 border-b border-surface-container last:border-0 cursor-pointer transition-all hover:bg-surface-container-low hover:shadow-inner relative ${!n.isRead ? 'bg-primary/[0.03]' : 'opacity-70'}`}
                        >
                          {!n.isRead && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>}
                          <div className="flex gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                              n.type === 'leave' ? 'bg-blue-50 text-blue-600' :
                              n.type === 'attendance' ? 'bg-amber-50 text-amber-600' :
                              n.type === 'status' ? 'bg-emerald-50 text-emerald-600' :
                              n.type === 'application' ? 'bg-purple-50 text-purple-600' :
                              (n.type === 'conduct' || n.type === 'conduct_report') ? 'bg-red-50 text-error' :
                              'bg-primary/10 text-primary'
                            }`}>
                               {n.type === 'leave' ? <CalendarClock size={20} className="stroke-[2.5]" /> :
                                n.type === 'attendance' ? <ClipboardCheck size={20} className="stroke-[2.5]" /> :
                                n.type === 'status' ? <ShieldCheck size={20} className="stroke-[2.5]" /> :
                                n.type === 'application' ? <UserSearch size={20} className="stroke-[2.5]" /> :
                                (n.type === 'conduct' || n.type === 'conduct_report') ? <AlertOctagon size={20} className="stroke-[2.5]" /> :
                               <Info size={20} className="stroke-[2.5]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[11px] font-black uppercase tracking-tight leading-tight mb-1 truncate ${!n.isRead ? 'text-primary' : 'text-on-surface'}`}>{n.title}</p>
                              <p className="text-[10px] font-medium text-on-surface-variant leading-tight line-clamp-2">{n.message}</p>
                              <p className="text-[8px] font-black uppercase tracking-tighter text-outline/40 mt-1">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(n.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <button 
                    onClick={() => { 
                      setShowNotifications(false); 
                      if (user.role === 'employee') {
                        navigate('/employee/settings');
                      } else {
                        navigate(isHR ? '/hr/settings' : '/admin/settings'); 
                      }
                    }}
                    className="w-full p-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/5 transition-colors border-t border-surface-container bg-white font-headline"
                  >
                    View All
                  </button>
                </div>
              </>
            )}

            <button 
              onClick={handleLogout}
              className="w-11 h-11 flex items-center justify-center hover:bg-red-50 text-error rounded-full transition-all group active:scale-90"
              title="Sign Out"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform stroke-[3]" />
            </button>
        </div>
        <div className="h-10 w-[1px] bg-outline-variant/30 hidden xs:block"></div>
        <div className="flex items-center gap-4 ml-4">
          <div className="text-right hidden sm:block">
            <span className="block text-sm font-bold text-primary font-headline leading-none capitalize">{user?.fullName || user?.name}</span>
            <div className="flex items-center justify-end gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${user.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {user.status || 'Active'}
              </span>
              <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest truncate max-w-[100px]">{user.role}</span>
            </div>
          </div>
          <div className="relative group/avatar cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarUpload}
              disabled={isUploading}
            />
            <img 
              className={`w-10 h-10 rounded-full border-2 border-white shadow-md object-cover transition-all ${isUploading ? 'opacity-50 grayscale' : 'group-hover/avatar:brightness-75'}`} 
              alt={user.name}
              src={profileImage}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Camera size={16} className="text-white" />
              )}
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${user.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          </div>
        </div>
      </div>
    </header>
  );
};;

export default Navbar;
