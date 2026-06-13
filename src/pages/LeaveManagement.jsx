import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { fetchWithAuth } from '../utils/api';
import { DISTRICT_MAP, CITIES } from '../utils/constants';
import { 
  Printer, 
  Download, 
  Plus, 
  ClipboardList, 
  CheckCircle2, 
  PlaneTakeoff, 
  AlertTriangle, 
  Filter, 
  CheckCheck, 
  X, 
  MoreVertical,
  Search,
  ChevronDown
} from 'lucide-react';

const LeaveManagement = () => {
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [newLeave, setNewLeave] = useState({
        employee: '',
        leaveType: 'Annual',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const loadLeaves = async () => {
        try {
            setLoading(true);
            const [leaveData, statsData, empData] = await Promise.all([
                fetchWithAuth('/leaves'),
                fetchWithAuth('/dashboard/stats').catch(() => null),
                fetchWithAuth('/employees').catch(() => [])
            ]);
            setLeaveRequests(leaveData);
            setStats(statsData);
            setEmployees(empData);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaves();
    }, []);

    const handleApprove = (req) => {
        setSelectedRequest(req);
        setIsApproveModalOpen(true);
    };

    const handleReject = (req) => {
        setSelectedRequest(req);
        setIsRejectModalOpen(true);
    };

    const submitApproval = async () => {
        if (!selectedRequest) return;
        try {
            await fetchWithAuth(`/leaves/${selectedRequest._id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'approved' }),
            });
            await loadLeaves();
        } catch (error) {
            console.error('Error approving leave', error);
        }
        setIsApproveModalOpen(false);
    };

    const submitRejection = async () => {
        if (!selectedRequest) return;
        try {
            await fetchWithAuth(`/leaves/${selectedRequest._id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'rejected' }),
            });
            await loadLeaves();
        } catch (error) {
            console.error('Error rejecting leave', error);
        }
        setIsRejectModalOpen(false);
    };

    const handleAddLeave = async (e) => {
        e.preventDefault();
        try {
            await fetchWithAuth('/leaves', {
                method: 'POST',
                body: JSON.stringify(newLeave),
            });
            setIsAddModalOpen(false);
            setNewLeave({ employee: '', leaveType: 'Annual', startDate: '', endDate: '', reason: '' });
            await loadLeaves();
        } catch (error) {
            alert(error?.response?.data?.message || error?.message || 'Action failed');
        }
    };

    const exportToExcel = () => {
        if (filteredRequests.length === 0) return;
        const exportData = filteredRequests.map(req => {
            const days = Math.max(1, Math.ceil((new Date(req.endDate) - new Date(req.startDate)) / (1000 * 60 * 60 * 24)) + (new Date(req.endDate).toDateString() === new Date(req.startDate).toDateString() ? 1 : 0));
            return {
                'Employee': `${req.employee?.firstName} ${req.employee?.lastName}`,
                'Employee ID': req.employee?.employeeId,
                'Leave Type': req.leaveType,
                'Start Date': new Date(req.startDate).toLocaleDateString(),
                'End Date': new Date(req.endDate).toLocaleDateString(),
                'Days': days,
                'Status': req.status,
                'Reason': req.reason
            };
        });
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Leave Records');
        XLSX.writeFile(wb, `leave-report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const [searchQuery, setSearchQuery] = useState({
        name: '',
        employeeId: '',
        leaveType: '',
        status: '',
        reason: '',
        city: 'all',
        district: 'all'
    });

    const filteredRequests = leaveRequests.filter(req => {
        if (!req.employee) return false;
        
        const fullName = `${req.employee.firstName} ${req.employee.lastName}`.toLowerCase();
        const matchesName = fullName.includes(searchQuery.name.toLowerCase());
        const matchesId = req.employee.employeeId?.toLowerCase().includes(searchQuery.employeeId.toLowerCase());
        const matchesType = req.leaveType?.toLowerCase().includes(searchQuery.leaveType.toLowerCase());
        const matchesStatus = searchQuery.status === '' || req.status === searchQuery.status;
        const matchesReason = req.reason?.toLowerCase().includes(searchQuery.reason.toLowerCase());
        
        const matchesCity = searchQuery.city === 'all' || req.employee.hub === searchQuery.city || req.employee.city === searchQuery.city;
        const matchesDistrict = searchQuery.district === 'all' || req.employee.district === searchQuery.district;

        const matchesTab = activeTab === 'all' || 
                           (activeTab === 'pending' && req.status === 'pending') ||
                           (activeTab === 'processed' && (req.status === 'approved' || req.status === 'rejected'));

        return matchesName && matchesId && matchesType && matchesStatus && matchesReason && matchesTab && matchesCity && matchesDistrict;
    });

    const pendingCount = leaveRequests.filter(l => l.status === 'pending').length;
    const approvedToday = stats?.approvedToday || 0;

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-10 no-print px-1">
                <div className="text-left">
                    <h2 className="text-3xl md:text-[40px] leading-tight font-black tracking-tight text-primary font-headline">Leaves</h2>
                    <p className="text-[10px] md:text-xs text-on-surface-variant font-bold uppercase tracking-widest opacity-70 mt-1">Personnel Time-Off Management</p>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto px-1">
                    <button 
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3.5 bg-surface-container-low text-primary font-black rounded-xl hover:bg-surface-container-high transition-all active:scale-95 text-[9px] md:text-[10px] uppercase tracking-widest shadow-sm flex-1 sm:flex-none"
                    >
                        <Printer size={18} className="stroke-[3]" />
                        <span className="hidden xs:inline">Print</span>
                        <span className="xs:hidden">Print</span>
                    </button>
                    <button 
                        onClick={exportToExcel}
                        className="flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3.5 bg-surface-container-low text-primary font-black rounded-xl hover:bg-surface-container-high transition-all active:scale-95 text-[9px] md:text-[10px] uppercase tracking-widest shadow-sm flex-1 sm:flex-none"
                    >
                        <Download size={18} className="stroke-[3]" />
                        <span className="hidden xs:inline">Export</span>
                        <span className="xs:hidden">Export</span>
                    </button>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="col-span-2 sm:col-span-none flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white font-black rounded-xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 text-[10px] md:text-[11px] font-headline uppercase tracking-widest w-full sm:w-auto"
                    >
                        <Plus size={18} className="stroke-[3]" />
                        <span className="whitespace-nowrap">New Request</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-10 no-print px-1">
                {[
                    { label: 'Pending', val: pendingCount.toString(), icon: <ClipboardList size={18} className="md:w-6 md:h-6" />, color: 'bg-secondary/10 text-secondary' },
                    { label: 'Approved Today', val: approvedToday.toString(), icon: <CheckCircle2 size={18} className="md:w-6 md:h-6" />, color: 'bg-green-100 text-green-700' },
                    { label: 'Total On Leave', val: (stats?.totalOnLeave || 0).toString(), icon: <PlaneTakeoff size={18} className="md:w-6 md:h-6" />, color: 'bg-primary/10 text-primary' },
                    { label: 'Absenteeism', val: `${stats?.absenteeismRate || 0}%`, icon: <AlertTriangle size={18} className="md:w-6 md:h-6" />, color: 'bg-red-50 text-error' }
                ].map((stat, i) => (
                    <div key={i} className="p-4 md:p-6 bg-white rounded-[24px] flex flex-col justify-between h-32 md:h-44 shadow-sm transition-all hover:shadow-md border border-surface-container group">
                        <div className="flex justify-between items-start">
                            <div className={`w-9 h-9 md:w-[44px] md:h-[44px] flex items-center justify-center shrink-0 ${stat.color} rounded-xl shadow-sm group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                            <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest opacity-40 font-label hidden sm:block">{stat.label}</span>
                        </div>
                        <div>
                            <div className="text-xl md:text-4xl font-black text-primary font-headline tracking-tighter truncate">{stat.val}</div>
                            <div className="text-[7px] md:text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-1 font-label">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-surface-container-low/40 backdrop-blur-md rounded-[24px] p-5 md:p-8 mb-8 md:mb-10 flex flex-col gap-6 border border-surface-container no-print mx-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Search Employee</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform duration-200 stroke-[3]" size={16} />
                            <input 
                                type="text" 
                                placeholder="Name or ID..." 
                                value={searchQuery.name}
                                onChange={(e) => setSearchQuery({...searchQuery, name: e.target.value})}
                                className="w-full bg-white border border-surface-container rounded-xl py-3 pl-11 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-outline/40 font-label"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Leave Type</label>
                        <div className="relative group">
                            <select 
                                value={searchQuery.leaveType}
                                onChange={(e) => setSearchQuery({...searchQuery, leaveType: e.target.value})}
                                className="appearance-none w-full bg-white border border-surface-container rounded-xl py-3 px-4 text-[9px] font-black text-primary uppercase tracking-widest focus:ring-2 focus:ring-primary/10 cursor-pointer shadow-sm font-label"
                            >
                                <option value="">All Types</option>
                                <option value="Annual">Annual</option>
                                <option value="Sick">Sick</option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="Emergency">Emergency</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary stroke-[4]" size={14} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Status</label>
                        <div className="relative group">
                            <select 
                                value={searchQuery.status}
                                onChange={(e) => setSearchQuery({...searchQuery, status: e.target.value})}
                                className="appearance-none w-full bg-white border border-surface-container rounded-xl py-3 px-4 text-[9px] font-black text-primary uppercase tracking-widest focus:ring-2 focus:ring-primary/10 cursor-pointer shadow-sm font-label"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary stroke-[4]" size={14} />
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={() => setIsFilterModalOpen(true)}
                            className="w-full h-11 flex items-center justify-center bg-white border border-surface-container hover:bg-surface-container-low text-primary rounded-xl transition-all shadow-sm active:scale-95 group gap-3 font-black text-[10px] uppercase tracking-widest"
                        >
                            <Filter size={16} className="group-hover:rotate-12 transition-transform stroke-[3]" />
                            More Filters
                        </button>
                    </div>
                </div>
            </div>

            <div id="print-area-leave" className="print-area bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-surface-container mb-20">
                <div className="px-6 md:px-8 py-5 md:py-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-surface-container-low/30 border-b border-surface-container no-print">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-8 w-full xl:w-auto">
                        <h3 className="text-xl font-bold text-primary font-headline">Leaves</h3>
                        <div className="flex bg-surface-container-high p-1 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest font-label shadow-inner w-full sm:w-auto overflow-x-auto no-scrollbar">
                            <button onClick={() => setActiveTab('all')} className={`flex-1 sm:flex-none px-4 md:px-5 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}>All</button>
                            <button onClick={() => setActiveTab('pending')} className={`flex-1 sm:flex-none px-4 md:px-5 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === 'pending' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}>Pending</button>
                            <button onClick={() => setActiveTab('processed')} className={`flex-1 sm:flex-none px-4 md:px-5 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === 'processed' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}>Processed</button>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsFilterModalOpen(true)}
                        className="p-2.5 hover:bg-surface-container-high rounded-xl transition-all border border-surface-container-high text-primary shadow-sm bg-white active:scale-95 ml-auto xl:ml-0"
                    >
                        <Filter size={18} className="stroke-[3]" />
                    </button>
                </div>

                {/* Print Header */}
                <div className="hidden print:block mb-8 border-b-2 border-primary pb-6 px-8 pt-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-black text-primary font-headline uppercase tracking-tighter">HR System</h1>
                            <h2 className="text-xl font-bold text-on-surface-variant mt-1">Leave Management Report</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-primary font-headline">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Total Records: {filteredRequests.length}</p>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto scrollbar-thin scrollbar-track-surface-container scrollbar-thumb-primary/20">
                    <table className="w-full text-left min-w-[700px] lg:min-w-0">
                        <thead>
                            <tr className="bg-surface-container-low font-label">
                                <th className="px-6 md:px-8 py-4 text-[9px] md:text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Employee</th>
                                <th className="px-4 md:px-6 py-4 text-[9px] md:text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Type</th>
                                <th className="px-4 md:px-6 py-4 text-[9px] md:text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Duration</th>
                                <th className="px-4 md:px-6 py-4 text-[9px] md:text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Status</th>
                                <th className="px-6 md:px-8 py-4 text-[9px] md:text-[11px] font-black text-on-surface-variant uppercase tracking-widest text-right no-print">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-10 text-on-surface-variant font-bold uppercase tracking-widest text-[9px] opacity-50">No leave records found</td></tr>
                            ) : filteredRequests.map((req) => (
                                <tr key={req._id} className="hover:bg-surface-container-low/20 transition-all group">
                                    <td className="px-6 md:px-8 py-4 md:py-6">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black shadow-sm text-[10px] md:text-sm">
                                                {req.employee?.firstName?.charAt(0)}{req.employee?.lastName?.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-on-surface font-headline text-sm md:text-base leading-tight truncate max-w-[120px] md:max-w-none">{req.employee?.firstName} {req.employee?.lastName}</p>
                                                <p className="text-[8px] md:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5 leading-tight opacity-60 truncate">{req.employee?.employeeId} · <span className="hidden sm:inline">{req.employee?.district || req.employee?.hub}</span></p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 md:py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 shadow-sm"></div>
                                            <span className="text-[10px] md:text-sm font-bold text-on-surface-variant font-label">{req.leaveType}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 md:py-6 font-bold">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] md:text-sm font-black text-primary font-headline leading-tight">{Math.max(1, Math.ceil((new Date(req.endDate) - new Date(req.startDate)) / (1000 * 60 * 60 * 24)) + (new Date(req.endDate).toDateString() === new Date(req.startDate).toDateString() ? 1 : 0))} Days</p>
                                            <p className="text-[7px] md:text-[10px] text-on-surface-variant/70 uppercase tracking-tighter leading-tight">{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 md:py-6">
                                        <span className={`inline-flex items-center justify-center px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[7px] md:text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                            req.status === 'pending' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' :
                                            req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-red-50 text-error ring-1 ring-red-100'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 md:px-8 py-4 md:py-6 text-right no-print">
                                        <div className="flex justify-end gap-1.5 md:gap-2">
                                            {req.status === 'pending' ? (
                                                <>
                                                    <button 
                                                        onClick={() => handleApprove(req)}
                                                        className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all shadow-sm active:scale-90"
                                                    >
                                                        <CheckCheck size={16} className="stroke-[3] md:size-18" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(req)}
                                                        className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center bg-red-50 text-error rounded-xl hover:bg-red-100 transition-all shadow-sm active:scale-90"
                                                    >
                                                        <X size={16} className="stroke-[3] md:size-18" />
                                                    </button>
                                                </>
                                            ) : (
                                                <button className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container rounded-xl transition-all active:scale-90">
                                                    <MoreVertical size={16} className="stroke-[3] md:size-18" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal 
                isOpen={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                onConfirm={submitApproval}
                type="primary"
                confirmText="Approve Request"
                title="Approve Leave"
                message={`You are about to approve the leave request for ${selectedRequest?.employee?.firstName}. The employee will be notified of the approval.`}
            />

            <ConfirmModal 
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onConfirm={submitRejection}
                type="danger"
                confirmText="Reject Request"
                title="Reject Leave"
                message={`Are you sure you want to reject ${selectedRequest?.employee?.firstName}'s request? The employee will be notified of the decision.`}
            />

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Leave">
                <form onSubmit={handleAddLeave} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Select Employee</label>
                        <select required value={newLeave.employee} onChange={e => setNewLeave({...newLeave, employee: e.target.value})} className="w-full bg-surface-container-low border-none py-3.5 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all">
                            <option value="">Choose Employee...</option>
                            {employees.map(e => (
                                <option key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Leave Type</label>
                            <select value={newLeave.leaveType} onChange={e => setNewLeave({...newLeave, leaveType: e.target.value})} className="w-full bg-surface-container-low border-none py-3.5 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all">
                                <option value="Annual">Annual Leave</option>
                                <option value="Sick">Sick Leave</option>
                                <option value="Unpaid">Unpaid Leave</option>
                                <option value="Emergency">Emergency Leave</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Current Status</label>
                            <div className="py-3.5 px-6 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-black uppercase tracking-widest border border-emerald-100">Approved</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Start Date</label>
                            <input required type="date" value={newLeave.startDate} onChange={e => setNewLeave({...newLeave, startDate: e.target.value})} className="w-full bg-surface-container-low border-none py-3.5 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">End Date</label>
                            <input required type="date" value={newLeave.endDate} onChange={e => setNewLeave({...newLeave, endDate: e.target.value})} className="w-full bg-surface-container-low border-none py-3.5 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Reason</label>
                        <textarea value={newLeave.reason} onChange={e => setNewLeave({...newLeave, reason: e.target.value})} className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all h-24" placeholder="Enter the reason for leave..." />
                    </div>
                    <button type="submit" className="w-full py-5 bg-primary text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all font-headline text-xs">Save Leave</button>
                </form>
            </Modal>

            <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Leave Filters">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">City</label>
                            <select 
                                value={searchQuery.city} 
                                onChange={e => setSearchQuery({...searchQuery, city: e.target.value, district: 'all'})}
                                className="w-full bg-surface-container-low border-none py-3.5 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all"
                            >
                                <option value="all">All Cities</option>
                                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        {searchQuery.city !== 'all' && (
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">District</label>
                                <select 
                                    value={searchQuery.district} 
                                    onChange={e => setSearchQuery({...searchQuery, district: e.target.value})}
                                    className="w-full bg-surface-container-low border-none py-3.5 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all"
                                >
                                    <option value="all">All Districts</option>
                                    {(DISTRICT_MAP[searchQuery.city] || []).map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setIsFilterModalOpen(false)} className="w-full py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20">Apply Filters</button>
                </div>
            </Modal>
        </>
    );
};

export default LeaveManagement;
