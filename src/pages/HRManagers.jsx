import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { fetchWithAuth } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { DISTRICT_MAP } from '../utils/constants';
import { 
  Printer, 
  Plus, 
  Users, 
  MapPin, 
  ShieldCheck, 
  BarChart3, 
  Filter, 
  Download, 
  Edit, 
  Trash2,
  Power
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

const performanceData = [
  { name: 'W1', val: 40 },
  { name: 'W2', val: 55 },
  { name: 'W3', val: 48 },
  { name: 'W4', val: 70 },
  { name: 'W5', val: 87 },
];

const HRManagers = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Form State
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    phone: '',
    role: 'hr_manager',
    region: 'Mogadishu',
    district: '',
    status: 'active'
  });

  const [districtOptions, setDistrictOptions] = useState(DISTRICT_MAP['Mogadishu'] || []);

  const loadManagers = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/hr-managers?role=hr_manager');
      setManagers(data);
    } catch (error) {
      console.error('Error fetching HR managers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagers();
  }, []);

  const handleEditClick = (manager) => {
    setSelectedManager(manager);
    setIsEdit(true);
    setFormData({
      firstName: manager.firstName,
      lastName: manager.lastName,
      email: manager.email,
      phone: manager.phone || '',
      password: '', // Leave empty for edit unless changing
      role: 'hr_manager',
      region: manager.region || 'Mogadishu',
      district: manager.district || '',
      status: manager.status || 'active'
    });
    setDistrictOptions(DISTRICT_MAP[manager.region || 'Mogadishu'] || []);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (manager) => {
    setSelectedManager(manager);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedManager) return;
    try {
      await fetchWithAuth(`/hr-managers/${selectedManager._id}`, { method: 'DELETE' });
      await loadManagers();
    } catch (error) {
      console.error('Error deleting manager', error);
    }
    setIsDeleteModalOpen(false);
  };

  const handleToggleStatus = async (manager) => {
    try {
      const newStatus = manager.status === 'cancelled' ? 'active' : 'cancelled';
      await fetchWithAuth(`/hr-managers/${manager._id}/toggle-status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      await loadManagers();
    } catch (error) {
      console.error('Error toggling manager status', error);
      alert(error?.response?.data?.message || error?.message || 'Action failed');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isEdit ? `/hr-managers/${selectedManager._id}` : '/hr-managers';
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload = { ...formData };
      if (isEdit && !payload.password) delete payload.password;

      await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(payload),
      });
      
      setIsAddModalOpen(false);
      resetForm();
      await loadManagers();
    } catch (error) {
      console.error('Error saving manager', error);
      alert(error?.response?.data?.message || error?.message || 'Action failed');
    }
  };

  const resetForm = () => {
    setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'hr_manager', region: 'Mogadishu', district: '', status: 'active' });
    setDistrictOptions(DISTRICT_MAP['Mogadishu'] || []);
    setIsEdit(false);
    setSelectedManager(null);
  };

  const activeCount = managers.filter(m => m.status !== 'cancelled').length;
  const activePercentage = managers.length ? Math.round((activeCount / managers.length) * 100) : 0;
  
  // Top Region logic
  const regions = managers.reduce((acc, m) => {
    acc[m.region] = (acc[m.region] || 0) + 1;
    return acc;
  }, {});
  const topRegion = Object.keys(regions).reduce((a, b) => regions[a] > regions[b] ? a : b, 'N/A');

  const filteredManagers = managers.filter(m => regionFilter === 'all' || m.region === regionFilter);

  const exportToCSV = () => {
    if (managers.length === 0) return;
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Region', 'Status'];
    const rows = filteredManagers.map(m => [
      m.firstName,
      m.lastName,
      m.email,
      m.phone || '',
      m.region || 'HQ',
      m.district || 'All Districts',
      m.status
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `hr_managers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statCards = [
    { label: 'Total Managers', value: managers.length.toString(), icon: <Users size={24} className="stroke-[2.5]" />, sub: 'Active Admin', color: 'bg-secondary-fixed text-on-secondary-fixed' },
    { label: 'Top Region', value: topRegion, icon: <MapPin size={24} className="stroke-[2.5]" />, color: 'bg-primary-fixed text-on-primary-fixed' },
    { label: 'Account Status', value: `${activePercentage}%`, icon: <ShieldCheck size={24} className="stroke-[2.5]" />, color: 'bg-green-100 text-green-800' },
    { 
      label: 'Performance', 
      value: managers.length > 0 ? '87% Efficient' : 'N/A', 
      icon: <BarChart3 size={24} className="stroke-[2.5]" />, 
      color: 'bg-tertiary-fixed text-on-tertiary-fixed',
      isChart: true,
      performanceLabel: 'Excellent'
    }
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-8 md:mb-10 px-1">
        <div>
          <h2 className="text-on-surface-variant text-[10px] md:text-sm font-semibold tracking-wide uppercase font-label">Administration</h2>
          <h1 className="text-3xl md:text-[40px] leading-tight font-extrabold text-primary tracking-tight mt-1 font-headline">HR Managers</h1>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto no-print px-1">
          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 md:gap-3 bg-white border border-surface-container text-primary px-4 md:px-6 py-3.5 md:py-4 rounded-xl font-bold shadow-sm hover:bg-surface-container-low transition-all active:scale-95 text-[9px] md:text-[11px] uppercase tracking-widest flex-1 sm:flex-none"
          >
            <Printer size={18} className="stroke-[3]" />
            <span className="whitespace-nowrap hidden xs:inline">Print List</span>
            <span className="xs:hidden">Print</span>
          </button>
          {isAdmin && (
            <button 
              onClick={() => { resetForm(); setIsAddModalOpen(true); }}
              className="col-span-2 sm:col-span-none flex items-center justify-center gap-2 md:gap-3 bg-primary text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl font-bold shadow-xl hover:shadow-primary/30 transition-all active:scale-95 group text-[10px] md:text-sm w-full sm:w-auto"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300 stroke-[3]" />
              <span className="whitespace-nowrap font-headline uppercase tracking-widest">New Manager</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6 mb-10 no-print px-1">
        {statCards.map((stat, i) => (
            <div key={i} className={`bg-surface-container-lowest p-4 md:p-6 rounded-2xl shadow-sm border border-surface-container hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between h-36 md:h-[180px]`}>
                <div>
                  <div className="flex justify-between items-start mb-2 md:mb-4">
                      <div className={`w-9 h-9 md:w-[44px] md:h-[44px] ${stat.color} rounded-xl shadow-sm flex items-center justify-center shrink-0`}>
                          {React.cloneElement(stat.icon, { size: 24, className: 'md:w-6 md:h-6 stroke-[2.5]' })}
                      </div>
                      {stat.sub && <span className="text-[7px] md:text-xs font-black text-tertiary-container bg-tertiary-fixed px-2 py-1 rounded-md hidden sm:block">{stat.sub}</span>}
                      {stat.isChart && stat.performanceLabel && (
                        <span className="text-[7px] md:text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md uppercase tracking-wider hidden sm:block">{stat.performanceLabel}</span>
                      )}
                  </div>
                  <p className="text-[7px] md:text-xs text-on-surface-variant font-bold uppercase tracking-widest font-label truncate opacity-60">{stat.label}</p>
                  <h3 className="text-xl md:text-2xl font-black text-primary mt-1 font-headline tracking-tighter truncate">{stat.value}</h3>
                </div>

                {stat.isChart && (
                  <div className="absolute inset-x-0 bottom-0 h-12 md:h-16 opacity-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <Line 
                          type="monotone" 
                          dataKey="val" 
                          stroke="#00236f" 
                          strokeWidth={3} 
                          dot={false} 
                          isAnimationActive={true}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
            </div>
        ))}
      </div>

      <div id="print-area-hr-managers" className="print-area bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-surface-container">
        <div className="px-8 py-6 flex justify-between items-center bg-surface-container-low/50 no-print">
          <h3 className="text-xl font-bold text-primary font-headline">HR Managers</h3>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-surface-container rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors shadow-sm"
            >
              <Filter size={16} className="stroke-[3]" />
              {regionFilter === 'all' ? 'Filters' : regionFilter}
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-surface-container rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors shadow-sm"
            >
              <Download size={16} className="stroke-[3]" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block mb-8 border-b-2 border-primary pb-6 px-8 pt-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-primary font-headline uppercase tracking-tighter">HR System</h1>
                    <h2 className="text-xl font-bold text-on-surface-variant mt-1">HR Manager Directory Report</h2>
                </div>
                <div className="text-right">
                    <p className="text-sm font-black text-primary font-headline">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Total Administrators: {managers.length}</p>
                </div>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left bg-surface-container-low font-label">
                <th className="px-8 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Manager</th>
                <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Region</th>
                <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Account Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Live Status</th>
                <th className="px-8 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-6">
                  <div className="flex flex-col items-center gap-2 py-10">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">Loading Manager List...</p>
                  </div>
                </td></tr>
              ) : filteredManagers.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-20 text-on-surface-variant font-bold uppercase tracking-widest text-xs">No HR managers found for {regionFilter}</td></tr>
              ) : filteredManagers.map((manager) => (
                <tr key={manager._id} className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shadow-sm`}>
                        {manager.firstName.charAt(0)}{manager.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface font-headline">{manager.firstName} {manager.lastName}</p>
                        <p className="text-[10px] text-primary font-black uppercase tracking-tighter">{manager.district || 'All Districts'}</p>
                        <p className="text-sm text-on-surface-variant font-medium">{manager.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-on-surface-variant font-bold text-sm">
                      <span className={`w-2.5 h-2.5 rounded-full bg-primary`}></span>
                      {manager.region || 'HQ'}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm ${manager.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                      {manager.status === 'cancelled' ? 'Cancelled' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${manager.onlineStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-surface-container-highest'}`}></span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${manager.onlineStatus === 'active' ? 'text-green-700' : 'text-on-surface-variant opacity-60'}`}>
                        {manager.onlineStatus === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right no-print">
                    {isAdmin && (
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {user?._id !== manager._id && (
                            <button 
                              onClick={() => handleToggleStatus(manager)}
                              className={`p-2.5 rounded-xl transition-all active:scale-90 ${manager.status === 'cancelled' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
                              title={manager.status === 'cancelled' ? "Enable Account" : "Disable Account"}
                            >
                                <Power size={18} className="stroke-[3]" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleEditClick(manager)}
                            className="p-2.5 hover:bg-primary/5 rounded-xl text-primary transition-all active:scale-90"
                          >
                              <Edit size={18} className="stroke-[3]" />
                          </button>
                          <button 
                              onClick={() => handleDeleteClick(manager)}
                              className="p-2.5 hover:bg-red-50 rounded-xl text-error transition-all active:scale-90"
                          >
                              <Trash2 size={18} className="stroke-[3]" />
                          </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={isEdit ? "Edit HR Manager" : "Add New HR Manager"}>
        <form className="space-y-6" onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">First Name</label>
                  <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-surface-container-low border-none py-3 px-5 rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all font-medium" placeholder="Sahra" />
              </div>
              <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Last Name</label>
                  <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-surface-container-low border-none py-3 px-5 rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all font-medium" placeholder="Abdi" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Email</label>
                  <input required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-surface-container-low border-none py-3 px-5 rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all font-medium" placeholder="s.abdi@hayaanhir.so" type="email" />
              </div>
              <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Phone</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-surface-container-low border-none py-3 px-5 rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all font-medium" placeholder="+252 61..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Branch</label>
                  <select 
                    value={formData.region} 
                    onChange={e => {
                      const newRegion = e.target.value;
                      setFormData({...formData, region: newRegion, district: ''});
                      setDistrictOptions(DISTRICT_MAP[newRegion] || []);
                    }} 
                    className="w-full bg-surface-container-low border-none py-3 px-5 rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all font-bold cursor-pointer"
                  >
                    <option value="Mogadishu">Mogadishu</option>
                    <option value="Hargeisa">Hargeisa</option>
                    <option value="Garowe">Garowe</option>
                    <option value="Kismayo">Kismayo</option>
                  </select>
              </div>
              <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Assigned District</label>
                  <select 
                    value={formData.district} 
                    onChange={e => setFormData({...formData, district: e.target.value})} 
                    className="w-full bg-surface-container-low border-none py-3 px-5 rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all font-bold cursor-pointer"
                  >
                    <option value="">All Districts</option>
                    {districtOptions.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
              </div>
              <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Account Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-surface-container-low border-none py-3 px-5 rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all font-bold cursor-pointer">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="cancelled">Cancelled (Disabled)</option>
                  </select>
              </div>
            </div>
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">{isEdit ? 'New Password (Optional)' : 'Access Password'}</label>
                <input required={!isEdit} minLength="6" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-surface-container-low border-none py-3 px-5 rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all font-medium" placeholder="••••••••" type="password" />
            </div>
            <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-surface-container-high text-on-surface font-bold rounded-xl active:scale-95 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all font-headline">
                  {isEdit ? 'Save Changes' : 'Add Manager'}
                </button>
            </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={confirmDelete}
        title="Delete Manager"
        message={`Are you sure you want to delete the HR manager account for ${selectedManager?.firstName}? This action cannot be undone.`}
      />

      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filter by Branch">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {['all', 'Mogadishu', 'Hargeisa', 'Garowe', 'Kismayo'].map(r => (
              <button 
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`px-4 py-3 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${regionFilter === r ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'border-surface-container-high hover:bg-primary/5 hover:text-primary'}`}
              >
                {r === 'all' ? 'All Branches' : r}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsFilterModalOpen(false)}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 mt-4 active:scale-95 transition-all font-headline text-xs uppercase tracking-widest"
          >
            Apply Filter
          </button>
        </div>
      </Modal>
    </>
  );
};

export default HRManagers;
