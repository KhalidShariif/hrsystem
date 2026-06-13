import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import ConfirmModal from '../components/ConfirmModal';
import Modal from '../components/Modal';
import { fetchWithAuth } from '../utils/api';
import { DISTRICT_MAP, CITIES } from '../utils/constants';
import { 
  Printer, 
  Download, 
  Bolt, 
  CreditCard, 
  Hourglass, 
  Wallet, 
  RefreshCcw, 
  CalendarDays, 
  Search, 
  SlidersHorizontal, 
  MoreVertical, 
  Edit2, 
  CheckCircle2, 
  Trash2,
  ChevronDown
} from 'lucide-react';

const Payroll = () => {
    const navigate = useNavigate();
    const [isRunModalOpen, setIsRunModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [payrollRecords, setPayrollRecords] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [editForm, setEditForm] = useState({ allowances: 0, deductions: 0, status: 'pending' });
    const [filterType, setFilterType] = useState('Active');
    const [cityFilter, setCityFilter] = useState('all');
    const [districtFilter, setDistrictFilter] = useState('all');
    const [isTuneModalOpen, setIsTuneModalOpen] = useState(false);

    const loadPayrollData = async () => {
        try {
            setLoading(true);
            const [recordsData, statsData] = await Promise.all([
                fetchWithAuth('/payroll'),
                fetchWithAuth('/payroll/stats').catch(() => null)
            ]);
            setPayrollRecords(Array.isArray(recordsData) ? recordsData : []);
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching payroll data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayrollData();
    }, []);

    const handleRunPayroll = async () => {
        try {
            await fetchWithAuth('/payroll/generate', {
                method: 'POST'
            });
            await loadPayrollData();
        } catch (error) {
            console.error('Error generating payroll', error);
            alert(error?.response?.data?.message || error?.message || 'Action failed');
        }
        setIsRunModalOpen(false);
    };

    const handleMarkAsPaid = async (id) => {
        try {
            await fetchWithAuth(`/payroll/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'paid', paidDate: new Date() })
            });
            await loadPayrollData();
        } catch (error) {
            console.error('Error marking as paid', error);
        }
        setActiveDropdown(null);
    };

    const openEditModal = (record) => {
        setEditingRecord(record);
        setEditForm({
            allowances: record.allowances || 0,
            deductions: record.deductions || 0,
            status: record.status || 'pending'
        });
        setIsEditModalOpen(true);
        setActiveDropdown(null);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetchWithAuth(`/payroll/${editingRecord._id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    allowances: Number(editForm.allowances),
                    deductions: Number(editForm.deductions),
                    status: editForm.status
                })
            });
            setIsEditModalOpen(false);
            setEditingRecord(null);
            await loadPayrollData();
        } catch (error) {
            alert(error?.response?.data?.message || error?.message || 'Action failed');
        }
    };

    const handleDelete = async () => {
        try {
            await fetchWithAuth(`/payroll/${deletingId}`, { method: 'DELETE' });
            await loadPayrollData();
        } catch (error) {
            console.error('Error deleting payroll', error);
        }
        setIsDeleteModalOpen(false);
        setDeletingId(null);
        setActiveDropdown(null);
    };

    const exportToExcel = () => {
        if (filteredPayroll.length === 0) return;
        
        const exportData = filteredPayroll.map(r => ({
            'Employee': `${r.employeeId?.firstName} ${r.employeeId?.lastName}`,
            'Employee ID': r.employeeId?.employeeId,
            'Department': r.employeeId?.department?.name || 'HQ',
            'Basic Salary': r.basicSalary,
            'Allowances': r.allowances,
            'Deductions': r.deductions,
            'Net Salary': r.netSalary,
            'Status': r.status,
            'Month': r.month,
            'Year': r.year
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Payroll Records');
        XLSX.writeFile(wb, `payroll-report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const parseMoney = (val) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        return Number(val.toString().replace(/[$,]/g, '')) || 0;
    };

    const totalNetPaid = payrollRecords
        .filter(r => r.status === 'paid')
        .reduce((sum, r) => sum + parseMoney(r.netSalary || r.totalNet), 0);

    const pendingCount = payrollRecords.filter(r => r.status === 'pending').length;
    
    const deductionsTotal = payrollRecords.reduce((sum, r) => sum + parseMoney(r.deductions), 0);
    
    const totalGenerated = payrollRecords.reduce((sum, r) => sum + parseMoney(r.netSalary || r.totalNet), 0);

    const [searchQuery, setSearchQuery] = useState('');

    const filteredPayroll = payrollRecords.filter(r => {
        if (!r.employeeId) return false;
        
        const fullName = `${r.employeeId.firstName || ''} ${r.employeeId.lastName || ''}`.toLowerCase();
        const employeeId = (r.employeeId.employeeId || '').toLowerCase();
        const matchesSearch = !searchQuery || 
                             fullName.includes(searchQuery.toLowerCase()) || 
                             employeeId.includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        const matchesCity = cityFilter === 'all' || r.employeeId.hub === cityFilter || r.employeeId.city === cityFilter;
        const matchesDistrict = districtFilter === 'all' || r.employeeId.district === districtFilter;
        if (!matchesCity || !matchesDistrict) return false;

        if (filterType === 'Active') return r.employeeId?.employeeType !== 'contractor' && r.employeeId?.status === 'active';
        if (filterType === 'Contractors') return r.employeeId?.employeeType === 'contractor';
        return true;
    });

    const filteredNetPaid = filteredPayroll.filter(r => r.status === 'paid').reduce((sum, r) => sum + parseMoney(r.netSalary || r.totalNet), 0);
    const filteredDeductions = filteredPayroll.reduce((sum, r) => sum + parseMoney(r.deductions), 0);
    const filteredGenerated = filteredPayroll.reduce((sum, r) => sum + parseMoney(r.netSalary || r.totalNet), 0);

    const statCards = [
        { label: 'Total Net Paid', val: `$${totalNetPaid.toLocaleString()}`, icon: <CreditCard size={22} />, sub: 'Current Month', color: 'bg-primary/10 text-primary' },
        { label: 'Pending Payments', val: pendingCount.toString(), icon: <Hourglass size={22} />, sub: 'Employees', color: 'bg-amber-50 text-amber-600' },
        { label: 'Total Deductions', val: `$${deductionsTotal.toLocaleString()}`, icon: <Wallet size={22} />, sub: '100% Compliant', color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Total Generated', val: `$${totalGenerated.toLocaleString()}`, icon: <RefreshCcw size={22} />, sub: 'Gross Total', color: 'bg-primary text-white', dark: true }
    ];

    return (
        <>
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-10 no-print px-1">
                <div className="text-left px-1">
                    <h1 className="text-3xl md:text-[40px] leading-tight font-black tracking-tight text-primary mb-2 font-headline">Payroll</h1>
                    <div className="flex items-center gap-2 md:gap-3 font-bold text-[8px] md:text-[10px] uppercase tracking-widest font-label text-on-surface-variant">
                        <CalendarDays size={14} className="text-primary stroke-[3]" />
                        <span className="bg-primary/5 px-2 py-0.5 rounded text-primary">Cycle: {stats?.month || new Date().toLocaleString('en-US', { month: 'long' })} {stats?.year || new Date().getFullYear()}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 md:gap-3 w-full lg:w-auto px-1">
                    <button 
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3.5 bg-surface-container-low text-primary font-black rounded-xl hover:bg-surface-container-high transition-all text-[9px] md:text-[10px] uppercase tracking-widest shadow-sm active:scale-95 flex-1 sm:flex-none"
                    >
                        <Printer size={18} className="stroke-[3]" />
                        <span className="hidden xs:inline">Print</span>
                        <span className="xs:hidden">Print</span>
                    </button>
                    <button 
                        onClick={exportToExcel}
                        className="flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3.5 bg-surface-container-low text-primary font-black rounded-xl hover:bg-surface-container-high transition-all text-[9px] md:text-[10px] uppercase tracking-widest shadow-sm active:scale-95 flex-1 sm:flex-none"
                    >
                        <Download size={18} className="stroke-[3]" />
                        <span className="hidden xs:inline">Export</span>
                        <span className="xs:hidden">Export</span>
                    </button>
                    <button 
                        onClick={() => setIsRunModalOpen(true)}
                        className="col-span-2 sm:col-span-none flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white font-black rounded-xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all text-[11px] md:text-sm group active:scale-95 font-headline w-full sm:w-auto uppercase tracking-widest"
                    >
                        <Bolt size={18} className="md:w-[22px] md:h-[22px] group-hover:rotate-12 transition-transform stroke-[3]" />
                        <span className="whitespace-nowrap">Run Cycle</span>
                    </button>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-10 font-label no-print px-1">
                {statCards.map((stat, i) => (
                    <div key={i} className={`${stat.dark ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white border border-surface-container'} p-4 md:p-6 rounded-[24px] flex flex-col justify-between h-32 md:h-44 shadow-sm hover:shadow-md transition-all group`}>
                        <div className="flex justify-between items-start">
                            <div className={`p-2 md:p-3 ${stat.dark ? 'bg-white/10' : stat.color} rounded-xl shadow-sm group-hover:scale-110 transition-transform`}>
                                {React.cloneElement(stat.icon, { size: 16, className: 'md:w-6 md:h-6' })}
                            </div>
                            <span className={`text-[7px] md:text-[9px] font-black uppercase tracking-widest opacity-40 font-label hidden sm:block ${stat.dark ? 'text-white' : 'text-on-surface-variant'}`}>{stat.sub}</span>
                        </div>
                        <div>
                            <p className={`text-[7px] md:text-[10px] font-black uppercase tracking-widest opacity-40 ${stat.dark ? 'text-white' : 'text-on-surface-variant'}`}>{stat.label}</p>
                            <h3 className="text-xl md:text-3xl font-black mt-1 font-headline tracking-tighter truncate">{stat.val}</h3>
                        </div>
                    </div>
                ))}
            </section>

            <section id="print-area-payroll" className="print-area bg-surface-container-lowest rounded-[24px] md:rounded-2xl overflow-hidden shadow-sm border border-surface-container mb-10 mx-1">
                <div className="p-4 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface-container-low/20 border-b border-surface-container no-print">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1 w-full">
                        <div className="relative flex-1 group w-full">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform duration-200 stroke-[3]" />
                            <input 
                                className="w-full bg-white border border-surface-container py-3.5 pl-12 pr-6 text-sm focus:ring-2 focus:ring-primary/10 rounded-2xl transition-all placeholder:text-outline/40 font-bold font-label" 
                                placeholder="Search employees..." 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:flex-none bg-white rounded-xl shadow-sm px-4 py-2.5 border border-surface-container group">
                                <select 
                                    value={cityFilter} 
                                    onChange={e => {setCityFilter(e.target.value); setDistrictFilter('all');}}
                                    className="w-full appearance-none bg-transparent border-none text-[10px] font-black text-primary uppercase tracking-widest focus:ring-0 cursor-pointer font-label pr-8"
                                >
                                    <option value="all">Cities</option>
                                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary stroke-[4] pointer-events-none" />
                            </div>
                            <button 
                                onClick={() => setIsTuneModalOpen(true)}
                                className="h-11 w-11 flex items-center justify-center bg-white border border-surface-container hover:bg-surface-container-low rounded-xl text-primary transition-colors shadow-sm active:scale-95 group"
                            >
                                <SlidersHorizontal size={18} className="group-hover:rotate-12 transition-transform stroke-[3]" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-thin scrollbar-track-surface-container scrollbar-thumb-primary/20">
                    <table className="w-full text-left border-collapse min-w-[850px] lg:min-w-0">
                        <thead>
                            <tr className="bg-surface-container-low/50 font-label">
                                <th className="px-6 md:px-8 py-5 text-[9px] md:text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Employee</th>
                                <th className="px-4 md:px-6 py-5 text-[9px] md:text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Dept</th>
                                <th className="px-4 md:px-6 py-5 text-[9px] md:text-[11px] font-black text-on-surface-variant uppercase tracking-widest text-right">Base</th>
                                <th className="px-4 md:px-6 py-5 text-[9px] md:text-[11px] font-black text-on-surface-variant uppercase tracking-widest text-right">Allow.</th>
                                <th className="px-4 md:px-6 py-5 text-[9px] md:text-[11px] font-black text-on-surface-variant uppercase tracking-widest text-right">Deduc.</th>
                                <th className="px-4 md:px-6 py-5 text-[9px] md:text-[11px] font-black text-on-surface-variant uppercase tracking-widest text-right">Net</th>
                                <th className="px-4 md:px-6 py-5 text-[9px] md:text-[11px] font-black text-on-surface-variant uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 md:px-8 py-5 no-print"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container">
                            {loading ? (
                                <tr><td colSpan="8" className="text-center py-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                            ) : filteredPayroll.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-10 text-on-surface-variant font-bold uppercase tracking-widest text-[9px] opacity-50">
                                    {filterType === 'Contractors' ? 'No contractor records' : `No records found`}
                                </td></tr>
                            ) : filteredPayroll.map((row) => (
                                <tr key={row._id} className="hover:bg-surface-container-low/40 transition-all group">
                                    <td className="px-6 md:px-8 py-4 md:py-6">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] md:text-sm shadow-sm group-hover:scale-110 transition-transform uppercase">
                                                {row.employeeId?.firstName?.charAt(0)}{row.employeeId?.lastName?.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm md:text-base font-black text-on-surface font-headline leading-tight truncate max-w-[120px] md:max-w-none">{row.employeeId?.firstName} {row.employeeId?.lastName}</p>
                                                <p className="text-[8px] md:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5 leading-tight opacity-60 truncate">{row.employeeId?.position} · <span className="hidden sm:inline">{row.employeeId?.district || row.employeeId?.city}</span></p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 md:py-6">
                                        <span className="px-2 md:px-3 py-1 text-[8px] md:text-[10px] font-black bg-surface-container-high text-on-surface-variant rounded-md uppercase tracking-wider">{row.employeeId?.department?.name || 'HQ'}</span>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 md:py-6 text-right text-[11px] md:text-sm font-bold text-on-surface-variant">${row.basicSalary?.toLocaleString()}</td>
                                    <td className="px-4 md:px-6 py-4 md:py-6 text-right text-[11px] md:text-sm font-bold text-emerald-600">${row.allowances?.toLocaleString() || '0'}</td>
                                    <td className="px-4 md:px-6 py-4 md:py-6 text-right text-[11px] md:text-sm font-bold text-error">${row.deductions?.toLocaleString() || '0'}</td>
                                    <td className="px-4 md:px-6 py-4 md:py-6 text-right text-xs md:text-base font-black text-primary font-headline">${row.netSalary?.toLocaleString()}</td>
                                    <td className="px-4 md:px-6 py-4 md:py-6 text-center">
                                        <span className={`inline-flex items-center justify-center px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[7px] md:text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                            row.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                                            row.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 
                                            'bg-red-50 text-error border border-red-100'
                                        }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 md:px-8 py-4 md:py-6 text-right relative no-print">
                                        <button onClick={() => setActiveDropdown(activeDropdown === row._id ? null : row._id)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-low transition-all ml-auto">
                                            <MoreVertical size={16} className="text-outline hover:text-primary stroke-[3] md:size-18" />
                                        </button>
                                        {activeDropdown === row._id && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                                                <div className="absolute right-8 md:right-10 top-12 md:top-14 w-44 md:w-52 bg-white rounded-[20px] shadow-2xl border border-surface-container overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                                    <button onClick={() => openEditModal(row)} className="w-full text-left px-5 md:px-6 py-3.5 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors flex items-center gap-3 border-b border-surface-container">
                                                        <Edit2 size={14} className="stroke-[3] md:size-16" /> Edit
                                                    </button>
                                                    {row.status !== 'paid' && (
                                                        <button onClick={() => handleMarkAsPaid(row._id)} className="w-full text-left px-5 md:px-6 py-3.5 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-3 border-b border-surface-container">
                                                            <CheckCircle2 size={14} className="stroke-[3] md:size-16" /> Mark Paid
                                                        </button>
                                                    )}
                                                    <button onClick={() => { setDeletingId(row._id); setIsDeleteModalOpen(true); setActiveDropdown(null); }} className="w-full text-left px-5 md:px-6 py-3.5 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-error hover:bg-red-50 transition-colors flex items-center gap-3">
                                                        <Trash2 size={14} className="stroke-[3] md:size-16" /> Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {filteredPayroll.length > 0 && (
                            <tfoot className="bg-surface-container-low/50 font-label border-t-2 border-surface-container">
                                <tr>
                                    <td colSpan="4" className="px-6 md:px-8 py-4 md:py-5 text-right font-black text-on-surface-variant uppercase tracking-widest text-[10px] md:text-[11px]">Totals</td>
                                    <td className="px-4 md:px-6 py-4 md:py-5 text-right text-error font-black text-xs md:text-sm">${filteredDeductions.toLocaleString()}</td>
                                    <td className="px-4 md:px-6 py-4 md:py-5 text-right text-primary font-black text-sm md:text-base font-headline">${filteredGenerated.toLocaleString()}</td>
                                    <td colSpan="2" className="px-4 md:px-6 py-4 md:py-5 text-left text-[9px] md:text-[11px] uppercase tracking-widest font-black text-on-surface-variant">
                                        Paid: <span className="text-emerald-600">${filteredNetPaid.toLocaleString()}</span>
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </section>

            <ConfirmModal 
                isOpen={isRunModalOpen}
                onClose={() => setIsRunModalOpen(false)}
                onConfirm={handleRunPayroll}
                title="Run Payroll Cycle"
                message="You are about to run the payroll for the current month. This will process payments for all active employees. This action is irreversible once committed."
                confirmText="Confirm"
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setDeletingId(null); }}
                onConfirm={handleDelete}
                title="Delete Payroll Record"
                message="Are you sure you want to permanently delete this payroll record? This action cannot be undone."
            />

            <Modal 
                isOpen={isEditModalOpen} 
                onClose={() => { setIsEditModalOpen(false); setEditingRecord(null); }} 
                title="Edit Payroll Record"
            >
                {editingRecord && (
                    <form onSubmit={handleEditSubmit} className="space-y-6">
                        <div className="bg-surface-container-low rounded-2xl p-5 space-y-1">
                            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Employee</p>
                            <p className="text-base font-black text-primary font-headline">{editingRecord.employeeId?.firstName} {editingRecord.employeeId?.lastName}</p>
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{editingRecord.employeeId?.position}</p>
                        </div>

                        <div className="bg-surface-container-low rounded-2xl p-5 flex justify-between items-center">
                            <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Base Salary</p>
                            <p className="text-xl font-black text-primary font-headline">${editingRecord.basicSalary?.toLocaleString()}</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Allowances <span className="text-emerald-600">+</span></label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600 font-black">$</span>
                                <input
                                    type="number" min="0"
                                    value={editForm.allowances}
                                    onChange={e => setEditForm(f => ({ ...f, allowances: e.target.value }))}
                                    className="w-full bg-emerald-50 border border-emerald-100 py-3.5 pl-10 pr-6 rounded-2xl text-sm font-black text-emerald-700 focus:ring-2 focus:ring-emerald-200 transition-all"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Deductions <span className="text-error">−</span></label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-error font-black">$</span>
                                <input
                                    type="number" min="0"
                                    value={editForm.deductions}
                                    onChange={e => setEditForm(f => ({ ...f, deductions: e.target.value }))}
                                    className="w-full bg-red-50 border border-red-100 py-3.5 pl-10 pr-6 rounded-2xl text-sm font-black text-error focus:ring-2 focus:ring-red-100 transition-all"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex justify-between items-center">
                            <p className="text-[11px] font-black text-primary uppercase tracking-widest">Net Salary</p>
                            <p className={`text-2xl font-black font-headline ${
                                (editingRecord.basicSalary + Number(editForm.allowances) - Number(editForm.deductions)) < 0
                                    ? 'text-error' : 'text-primary'
                            }`}>
                                ${Math.max(0, editingRecord.basicSalary + Number(editForm.allowances || 0) - Number(editForm.deductions || 0)).toLocaleString()}
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Status</label>
                            <select
                                value={editForm.status}
                                onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                                className="w-full bg-surface-container-low border-none py-3.5 px-6 rounded-2xl text-sm font-black focus:ring-2 focus:ring-primary/10 transition-all"
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>

                        {(editingRecord.basicSalary + Number(editForm.allowances || 0) - Number(editForm.deductions || 0)) < 0 && (
                            <p className="text-error text-xs font-black uppercase tracking-widest">⚠ Deductions exceed salary + allowances. Net salary cannot be negative.</p>
                        )}

                        <button
                            type="submit"
                            disabled={(editingRecord.basicSalary + Number(editForm.allowances || 0) - Number(editForm.deductions || 0)) < 0}
                            className="w-full py-5 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all font-headline text-xs mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Save Changes
                        </button>
                    </form>
                )}
            </Modal>

            <Modal 
                isOpen={isTuneModalOpen} 
                onClose={() => setIsTuneModalOpen(false)} 
                title="Payroll Settings"
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Payment Cycle</label>
                        <select className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-bold">
                            <option>Monthly</option>
                            <option>Bi-Weekly</option>
                            <option>Quarterly</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Automated Deductions</label>
                        <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
                            <span className="text-xs font-bold">Tax Compliance</span>
                            <div className="w-10 h-6 bg-primary rounded-full relative">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsTuneModalOpen(false)} 
                        className="w-full py-5 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20"
                    >
                        Save Settings
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default Payroll;
