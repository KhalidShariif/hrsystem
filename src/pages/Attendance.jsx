import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { fetchWithAuth } from '../utils/api';
import { DISTRICT_MAP, CITIES } from '../utils/constants';
import * as XLSX from 'xlsx';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Calendar, 
  SlidersHorizontal, 
  Search, 
  ChevronDown, 
  PlusCircle, 
  TableProperties, 
  Printer, 
  MapPin, 
  MoreVertical, 
  Edit2, 
  Trash2,
  ChevronLeft
} from 'lucide-react';

import { PageHeader, StatCard, ActionButton, TYPOGRAPHY, UI_CLASSES } from '../components/ui/DesignSystem';

const Attendance = ({ isHR = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAttendance, setEditingAttendance] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [attendanceToDelete, setAttendanceToDelete] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [deptFilter, setDeptFilter] = useState('all');
    const [cityFilter, setCityFilter] = useState('all');
    const [districtFilter, setDistrictFilter] = useState('all');
    const [empSearch, setEmpSearch] = useState('');
    const [showResults, setShowResults] = useState(false);

    // Helper to filter by city and district
    const matchesRegionalParameters = (emp) => {
        const matchesCity = cityFilter === 'all' || emp.hub === cityFilter || emp.city === cityFilter;
        const matchesDistrict = districtFilter === 'all' || emp.district === districtFilter;
        return matchesCity && matchesDistrict;
    };

    const [formData, setFormData] = useState({ employee: '', date: new Date().toISOString().split('T')[0], checkInTime: '', checkOutTime: '', status: 'present', location: 'Main Office', reason: '' });

    const loadData = async () => {
        try {
            setLoading(true);
            const [attData, empData] = await Promise.all([
                fetchWithAuth('/attendance?date=today'),
                fetchWithAuth('/employees')
            ]);
            setAttendanceRecords(Array.isArray(attData) ? attData : []);
            setEmployees(Array.isArray(empData) ? empData : []);
            return empData;
        } catch (error) {
            console.error('Error fetching data', error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const loadAttendance = async () => {
        try {
            setLoading(true);
            const [attData, empData] = await Promise.all([
                fetchWithAuth('/attendance'),
                fetchWithAuth('/employees')
            ]);
            setAttendanceRecords(Array.isArray(attData) ? attData : []);
            setEmployees(Array.isArray(empData) ? empData : []);
        } catch (error) {
            console.error('Error fetching attendance', error);
        } finally {
            setLoading(false);
        }
    };

    const basePath = isHR ? '/hr' : '/admin';

    useEffect(() => {
        loadData().then(() => {
            const queryParams = new URLSearchParams(location.search);
            const empId = queryParams.get('employeeId');
            if (empId) {
                setFormData(prev => ({ ...prev, employee: empId, checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
                setIsAddModalOpen(true);
                navigate(`${basePath}/attendance`, { replace: true });
            }
        });
    }, [location.search, navigate, basePath]);

    useEffect(() => {
        if (formData.employee) {
            const emp = employees.find(e => e._id === formData.employee);
            if (emp) {
                setEmpSearch(`${emp.firstName} ${emp.lastName} (${emp.employeeId})`);
            }
        } else {
            setEmpSearch('');
        }
    }, [formData.employee, employees]);

    const filteredEmployees = employees.filter(emp => {
        const name = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const id = (emp.employeeId || '').toLowerCase();
        const search = empSearch.toLowerCase();
        return name.includes(search) || id.includes(search);
    });

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        
        let normalizedStatus = (formData.status || '').toLowerCase().trim();
        if (normalizedStatus === 'on leave') normalizedStatus = 'leave';

        if (['present', 'late'].includes(normalizedStatus)) {
            if (!formData.checkInTime || !formData.checkOutTime) {
                alert('Check-in and Check-out are required');
                return;
            }
            if (formData.checkOutTime <= formData.checkInTime) {
                alert('Check-out must be after check-in');
                return;
            }
        }

        try {
            setLoading(true);
            const existingRecord = attendanceRecords.find(a => 
                (a.employee?._id === formData.employee || a.employee === formData.employee) && 
                a.date.split('T')[0] === formData.date
            );
            
            const isUpdate = editingAttendance || existingRecord;
            const recordId = editingAttendance?._id || existingRecord?._id;

            const method = isUpdate ? 'PUT' : 'POST';
            const endpoint = isUpdate ? `/attendance/${recordId}` : '/attendance';
            const payload = {
                employee: formData.employee,
                date: formData.date,
                status: normalizedStatus,
                checkIn: formData.checkInTime,
                checkOut: formData.checkOutTime,
                location: formData.location,
                reason: formData.reason
            };
            
            const response = await fetchWithAuth(endpoint, {
                method,
                body: JSON.stringify(payload),
            });

            if (response.message && response.message.includes('already')) {
                throw new Error(response.message);
            }

            setIsAddModalOpen(false);
            setEditingAttendance(null);
            setFormData({ employee: '', date: new Date().toISOString().split('T')[0], checkInTime: '', checkOutTime: '', status: 'present', location: 'Main Office', reason: '' });
            await loadData();
        } catch (error) {
            console.error('Error adding attendance', error);
            alert(error?.response?.data?.message || error?.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetchWithAuth(`/attendance/${selectedRecord._id}`, {
                method: 'PUT',
                body: JSON.stringify(selectedRecord)
            });
            setIsEditModalOpen(false);
            await loadAttendance();
        } catch (error) {
            alert(error?.response?.data?.message || error?.message || 'Action failed');
        }
    };

    const handleDelete = async () => {
        if (!selectedRecord) return;
        try {
            await fetchWithAuth(`/attendance/${selectedRecord._id}`, { method: 'DELETE' });
            setIsDeleteModalOpen(false);
            setSelectedRecord(null);
            await loadAttendance();
        } catch (error) {
            console.error('Error deleting attendance', error);
        }
    };

    const todayLocal = new Date();
    const todayStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth()+1).padStart(2,'0')}-${String(todayLocal.getDate()).padStart(2,'0')}`;

    const [searchQuery, setSearchQuery] = useState('');

    const todaysMergedRecords = employees.map(emp => {
        const record = attendanceRecords.find(a => a.employee?._id === emp._id || a.employee === emp._id);
        if (record) return record;

        return {
            _id: `synthetic-${emp._id}`,
            employee: emp,
            date: todayLocal.toISOString(),
            status: 'Not Marked',
            checkIn: '',
            checkOut: '',
            isSynthetic: true
        };
    }).filter(a => {
        const matchesDept = deptFilter === 'all' || a.employee?.department?.name === deptFilter;
        const emp = a.employee || {};
        const matchesRegion = matchesRegionalParameters(emp);
            
        const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
        const employeeId = (emp.employeeId || '').toLowerCase();
        const matchesSearch = !searchQuery || 
                             fullName.includes(searchQuery.toLowerCase()) || 
                             employeeId.includes(searchQuery.toLowerCase());

        return matchesDept && matchesRegion && matchesSearch;
    });

    const exportToExcel = () => {
        if (todaysMergedRecords.length === 0) return;
        
        const exportData = todaysMergedRecords.map(r => ({
            'Employee': `${r.employee?.firstName} ${r.employee?.lastName}`,
            'Employee ID': r.employee?.employeeId,
            'Branch': r.employee?.city || r.location || 'Main Office',
            'Check In': r.checkIn || '--:--',
            'Check Out': r.checkOut || '--:--',
            'Status': r.status,
            'Reason': r.reason || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
        XLSX.writeFile(wb, `attendance-report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const presentCount = todaysMergedRecords.filter(a => a.status === 'present').length;
    const lateCount = todaysMergedRecords.filter(a => a.status === 'late').length;
    const absentCount = todaysMergedRecords.filter(a => a.status === 'absent').length;

    return (
        <>
            <PageHeader 
                title="Attendance" 
                subtitle="Today's Attendance Overview"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 no-print px-1">
                <div className="col-span-1 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatCard label="Present" value={presentCount} icon={CheckCircle2} colorClass="bg-emerald-50 text-emerald-600" subValue="Today" />
                    <StatCard label="Late" value={lateCount} icon={Clock} colorClass="bg-amber-50 text-amber-600" subValue="Today" />
                    <StatCard label="Absent" value={absentCount} icon={XCircle} colorClass="bg-red-50 text-error" subValue="Today" />
                </div>

                <div className="col-span-1 lg:col-span-4 bg-primary text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar size={16} className="text-blue-200 stroke-[3]" />
                            <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Active Date</p>
                        </div>
                        <h3 className="text-2xl font-bold font-headline tracking-tight mb-4">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
                    </div>
                    <div className="relative z-10 flex gap-3">
                        <button onClick={() => setIsFilterModalOpen(true)} className="flex-1 bg-white/10 hover:bg-white text-white hover:text-primary transition-all py-3.5 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/10 active:scale-95">Change Date</button>
                        <button onClick={() => setIsFilterModalOpen(true)} className="w-12 h-12 flex items-center justify-center shrink-0 bg-white/20 hover:bg-white/30 rounded-xl transition-all border border-white/10 active:scale-95">
                            <SlidersHorizontal size={20} className="stroke-[3]" />
                        </button>
                    </div>
                </div>
            </div>

            <div className={UI_CLASSES.CARD + " mb-10 flex flex-col gap-6 no-print mx-1"}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full">
                    <div className="relative flex-1 group w-full min-w-0">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform duration-200 stroke-[3]" />
                        <input 
                            className={UI_CLASSES.INPUT + " pl-12 font-semibold"} 
                            placeholder="Search employee..." 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 lg:flex items-center gap-2 w-full lg:w-auto">
                        <div className="relative bg-surface-container-low rounded-xl px-4 py-2.5 border border-surface-container group">
                            <select 
                                value={cityFilter} 
                                onChange={e => {setCityFilter(e.target.value); setDistrictFilter('all');}}
                                className="appearance-none w-full bg-transparent border-none text-[10px] font-black text-primary uppercase tracking-widest focus:ring-0 cursor-pointer pr-8 min-w-[120px]"
                            >
                                <option value="all">Cities</option>
                                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary stroke-[4] pointer-events-none" />
                        </div>
                        <div className="relative bg-surface-container-low rounded-xl px-4 py-2.5 border border-surface-container group">
                            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="appearance-none w-full bg-transparent border-none text-[10px] font-black text-primary uppercase tracking-widest focus:ring-0 cursor-pointer pr-8 min-w-[120px]">
                                <option value="all">Depts</option>
                                {[...new Set(employees.map(e => e.department?.name).filter(Boolean))].map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary stroke-[4] pointer-events-none" />
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full">
                    <ActionButton 
                        onClick={() => {
                            setFormData({ employee: '', date: new Date().toISOString().split('T')[0], checkInTime: '08:00', checkOutTime: '17:00', status: 'present', location: 'Main Office', reason: '' });
                            setEditingAttendance(null);
                            setIsAddModalOpen(true);
                        }}
                        icon={PlusCircle}
                    >
                        Mark Attendance
                    </ActionButton>
                    <ActionButton variant="secondary" icon={TableProperties} onClick={exportToExcel}>Export</ActionButton>
                    <ActionButton variant="secondary" icon={Printer} onClick={() => window.print()}>Print</ActionButton>
                </div>
            </div>

            <div id="print-area-attendance" className="print-area">
                <div className="overflow-x-auto scrollbar-thin scrollbar-track-surface-container scrollbar-thumb-primary/20">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-surface-container-low/50 border-b border-surface-container">
                                <th className={"px-8 py-5 " + TYPOGRAPHY.TABLE_HEADER}>Employee</th>
                                <th className={"px-6 py-5 " + TYPOGRAPHY.TABLE_HEADER}>Branch</th>
                                <th className={"px-6 py-5 " + TYPOGRAPHY.TABLE_HEADER}>Clock In</th>
                                <th className={"px-6 py-5 " + TYPOGRAPHY.TABLE_HEADER}>Clock Out</th>
                                <th className={"px-6 py-5 " + TYPOGRAPHY.TABLE_HEADER}>Status</th>
                                <th className={"px-6 py-5 " + TYPOGRAPHY.TABLE_HEADER}>Progress</th>
                                <th className="px-8 py-5 no-print"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container">
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-10 text-on-surface-variant font-bold text-xs">Loading records...</td></tr>
                            ) : todaysMergedRecords.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-10 text-on-surface-variant font-bold text-xs uppercase tracking-widest opacity-50">No records matching criteria</td></tr>
                            ) : todaysMergedRecords.map((record) => (
                                <tr key={record._id} className="hover:bg-surface-container-low/40 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-110 transition-transform shrink-0">
                                                {record.employee?.firstName?.charAt(0)}{record.employee?.lastName?.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-base font-bold text-on-surface font-headline leading-tight truncate">{record.employee?.firstName} {record.employee?.lastName}</p>
                                                <p className={TYPOGRAPHY.SMALL + " uppercase tracking-widest mt-0.5"}>{record.employee?.employeeId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-primary stroke-[2.5]" />
                                            <span className="text-sm font-bold text-on-surface-variant truncate">{record.employee?.district || record.employee?.city || record.location || 'Main Office'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6"><span className={`text-sm font-bold ${!record.checkIn ? 'text-outline/30' : 'text-primary font-headline'}`}>{record.checkIn || '--:--'}</span></td>
                                    <td className="px-6 py-6"><span className={`text-sm font-bold ${!record.checkOut ? 'text-outline/30' : 'text-primary font-headline'}`}>{record.checkOut || '--:--'}</span></td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                                                record.status === 'present' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                record.status === 'leave' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                record.status === 'late' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                                record.status === 'Not Marked' ? 'bg-surface-container text-on-surface-variant border-surface-container-high' :
                                                'bg-red-50 text-error border-red-100'
                                            }`}>
                                                {record.status}
                                            </span>
                                            {['absent', 'late', 'leave'].includes(record.status) && record.reason && (
                                                <p className="text-[9px] text-on-surface-variant font-bold truncate max-w-[150px] opacity-60" title={record.reason}>{record.reason}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="w-20 md:w-32 bg-surface-container-high h-2 md:h-2.5 rounded-full overflow-hidden shadow-inner">
                                            <div className={`${record.status === 'late' ? 'bg-amber-500' : record.status === 'absent' ? 'bg-error' : 'bg-emerald-500'} h-full rounded-full transition-all duration-1000`} style={{ width: record.status === 'absent' ? '0%' : '100%' }}></div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right relative no-print">
                                         {record.isSynthetic ? (
                                             <button 
                                                 onClick={() => {
                                                     setFormData({
                                                         ...formData,
                                                         employee: record.employee._id,
                                                         status: 'present',
                                                         checkInTime: '08:00',
                                                         checkOutTime: '17:00'
                                                     });
                                                     setEditingAttendance(null);
                                                     setIsAddModalOpen(true);
                                                 }}
                                                 className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-100 transition-all border border-emerald-100 active:scale-95 whitespace-nowrap"
                                             >
                                                 Mark Now
                                             </button>
                                         ) : (
                                             <>
                                                 <button onClick={() => setActiveDropdown(activeDropdown === record._id ? null : record._id)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-low transition-all relative z-10 ml-auto">
                                                     <MoreVertical size={18} className="text-outline hover:text-primary stroke-[3]" />
                                                 </button>
                                                 {activeDropdown === record._id && (
                                                     <>
                                                         <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                                                         <div className="absolute right-10 top-14 w-44 md:w-52 bg-white rounded-2xl shadow-2xl border border-surface-container overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                                             <button onClick={() => {
                                                                 setSelectedRecord(record);
                                                                 setFormData({
                                                                     employee: record.employee._id || record.employee,
                                                                     date: record.date.split('T')[0],
                                                                     status: record.status,
                                                                     checkInTime: record.checkIn || '',
                                                                     checkOutTime: record.checkOut || '',
                                                                     location: record.location || 'Main Office',
                                                                     reason: record.reason || ''
                                                                 });
                                                                 setEditingAttendance(record);
                                                                 setIsAddModalOpen(true);
                                                                 setActiveDropdown(null);
                                                             }} className="w-full text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors flex items-center gap-3">
                                                                 <Edit2 size={14} className="stroke-[3]" /> Edit
                                                             </button>
                                                             <button onClick={() => {
                                                                 setSelectedRecord(record);
                                                                 setIsDeleteModalOpen(true);
                                                                 setActiveDropdown(null);
                                                             }} className="w-full text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-error hover:bg-red-50 transition-colors border-t border-surface-container-low flex items-center gap-3">
                                                                 <Trash2 size={14} className="stroke-[3]" /> Delete
                                                             </button>
                                                         </div>
                                                     </>
                                                 )}
                                             </>
                                         )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Attendance Filters">
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsFilterModalOpen(false); }}>
                    <div className="space-y-2">
                        <label className={TYPOGRAPHY.SMALL + " uppercase tracking-widest ml-1"}>Select Date</label>
                        <input type="date" className={UI_CLASSES.INPUT + " font-bold"} />
                    </div>
                    <div className="space-y-2">
                        <label className={TYPOGRAPHY.SMALL + " uppercase tracking-widest ml-1"}>Branch</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Mogadishu', 'Hargeisa', 'Garowe', 'Kismayo'].map(hub => (
                                <button key={hub} type="button" className="p-3 text-[10px] font-bold uppercase tracking-widest border border-surface-container rounded-xl hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all">{hub}</button>
                            ))}
                        </div>
                    </div>
                    <ActionButton className="w-full mt-4">Show Attendance</ActionButton>
                </form>
            </Modal>

            <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setEditingAttendance(null); }} title={editingAttendance ? "Edit Attendance" : "Add Attendance"}>
                 <form className="space-y-6" onSubmit={handleAddSubmit}>
                     <div className="space-y-2 relative">
                        <label className={TYPOGRAPHY.SMALL + " uppercase tracking-widest ml-1"}>Employee</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary stroke-[3]" size={18} />
                            <input 
                                type="text"
                                placeholder="Search by name or ID..."
                                value={empSearch}
                                onChange={(e) => {
                                    setEmpSearch(e.target.value);
                                    setShowResults(true);
                                    if (!e.target.value) setFormData({ ...formData, employee: '' });
                                }}
                                onFocus={() => setShowResults(true)}
                                disabled={!!editingAttendance}
                                className={UI_CLASSES.INPUT + " pl-12 font-bold placeholder:text-outline/40"}
                            />
                            
                            {showResults && !editingAttendance && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={() => setShowResults(false)}></div>
                                    <div className="absolute top-full left-0 w-full bg-white mt-2 rounded-2xl shadow-2xl border border-surface-container overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                                            {filteredEmployees.length === 0 ? (
                                                <div className="p-4 text-center">
                                                    <p className={TYPOGRAPHY.SMALL + " uppercase tracking-widest opacity-50"}>No employee found</p>
                                                </div>
                                            ) : (
                                                filteredEmployees.map(emp => (
                                                    <div 
                                                        key={emp._id}
                                                        onClick={() => {
                                                            setFormData({ ...formData, employee: emp._id });
                                                            setEmpSearch(`${emp.firstName} ${emp.lastName} (${emp.employeeId})`);
                                                            setShowResults(false);
                                                        }}
                                                        className="p-3 rounded-xl hover:bg-primary/5 cursor-pointer transition-all flex items-center justify-between group"
                                                    >
                                                        <div>
                                                            <p className="text-xs font-bold text-on-surface">{emp.firstName} {emp.lastName}</p>
                                                            <p className="text-[9px] font-bold text-primary uppercase tracking-tighter">{emp.employeeId}</p>
                                                        </div>
                                                        <PlusCircle size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity stroke-[3]" />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className={TYPOGRAPHY.SMALL + " uppercase tracking-widest ml-1"}>Status</label>
                        <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className={UI_CLASSES.INPUT + " font-bold appearance-none bg-surface-container-low"}>
                            <option value="present">Present</option>
                            <option value="late">Late</option>
                            <option value="absent">Absent</option>
                            <option value="leave">On Leave</option>
                        </select>
                    </div>
                    {['absent', 'leave', 'late'].includes(formData.status) && (
                        <div className="space-y-2">
                            <label className={TYPOGRAPHY.SMALL + " uppercase tracking-widest ml-1"}>Reason <span className="text-error font-bold">*</span></label>
                            <textarea required={['absent', 'leave'].includes(formData.status)} value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className={UI_CLASSES.INPUT + " py-3 h-auto min-h-[80px] font-bold"} rows="2" placeholder="Enter reason..."></textarea>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className={TYPOGRAPHY.SMALL + " uppercase tracking-widest ml-1"}>Check In {['present', 'late'].includes(formData.status) && <span className="text-error font-bold">*</span>}</label>
                            <input required={['present', 'late'].includes(formData.status)} value={formData.checkInTime} onChange={e => setFormData({...formData, checkInTime: e.target.value})} className={UI_CLASSES.INPUT + " font-bold"} type="time" disabled={['absent', 'leave'].includes(formData.status)} />
                        </div>
                        <div className="space-y-2">
                            <label className={TYPOGRAPHY.SMALL + " uppercase tracking-widest ml-1"}>Check Out {['present', 'late'].includes(formData.status) && <span className="text-error font-bold">*</span>}</label>
                            <input required={['present', 'late'].includes(formData.status)} value={formData.checkOutTime} onChange={e => setFormData({...formData, checkOutTime: e.target.value})} className={UI_CLASSES.INPUT + " font-bold"} type="time" disabled={['absent', 'leave'].includes(formData.status)} />
                        </div>
                    </div>
                    <ActionButton 
                        type="submit" 
                        disabled={['present', 'late'].includes(formData.status) && (!formData.checkInTime || !formData.checkOutTime)} 
                        className="w-full mt-4"
                    >
                        {editingAttendance ? "Update Record" : "Add Entry"}
                    </ActionButton>
                 </form>
            </Modal>

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setSelectedRecord(null); }}
                onConfirm={handleDelete}
                title="Delete Record"
                message={`Are you sure you want to permanently delete this attendance record? This action is irreversible.`}
            />
        </>
    );
};

export default Attendance;
