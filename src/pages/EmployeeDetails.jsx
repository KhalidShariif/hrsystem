import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { fetchWithAuth } from '../utils/api';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import ConductReportModal from '../components/ConductReportModal';
import { 
  ArrowLeft, 
  Printer, 
  TableProperties, 
  Edit, 
  UserMinus, 
  Contact, 
  Mail, 
  Smartphone, 
  Globe, 
  Building2, 
  Calendar, 
  Banknote, 
  ClipboardCheck, 
  CalendarClock, 
  ArrowRight, 
  FileText, 
  Lock, 
  Image as ImageIcon, 
  BarChart3, 
  Download,
  AlertOctagon
} from 'lucide-react';

const EmployeeDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isConductModalOpen, setIsConductModalOpen] = useState(false);
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const data = await fetchWithAuth(`/employees/${id}`);
                setEmployee(data);
            } catch (error) {
                console.error('Failed to fetch employee details', error);
                setEmployee(null);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployee();
    }, [id]);

    const handleDelete = async () => {
        try {
            await fetchWithAuth(`/employees/${id}`, { method: 'DELETE' });
            navigate('/admin/employees');
        } catch (error) {
            console.error('Failed to terminate employee', error);
            alert('Failed to delete employee.');
        }
        setIsDeleteModalOpen(false);
    };

    const exportToExcel = () => {
        if (!employee) return;
        const exportData = [
            { Field: 'Employee ID', Value: employee.employeeId },
            { Field: 'Full Name', Value: `${employee.firstName} ${employee.lastName}` },
            { Field: 'Email', Value: employee.email },
            { Field: 'Phone', Value: employee.phone || 'N/A' },
            { Field: 'Position', Value: employee.position || 'N/A' },
            { Field: 'Department', Value: employee.department?.name || 'N/A' },
            { Field: 'Branch', Value: employee.hub || employee.city || 'N/A' },
            { Field: 'Employment Type', Value: employee.employeeType || 'N/A' },
            { Field: 'Hire Date', Value: employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'N/A' },
            { Field: 'Salary', Value: employee.salary || 0 },
            { Field: 'Attendance Rate', Value: `${employee.stats?.attendancePercentage || 0}%` },
            { Field: 'Leave Count', Value: employee.stats?.leaveCount || 0 }
        ];

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Employee Profile');
        XLSX.writeFile(wb, `employee_profile_${employee.employeeId}.xlsx`);
    };

    if (loading) return <div className="p-10 text-center font-bold text-primary">Loading...</div>;
    if (!employee) return <div className="p-10 text-center font-bold text-error text-xl">Employee not found</div>;

    const canSubmitReport = currentUser?.role === 'hr_manager' && currentUser?.region === employee.hub;

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white shadow-md border border-surface-container hover:bg-primary hover:text-white transition-all text-primary group active:scale-90"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform stroke-[3]" />
                    </button>
                    <div>
                        <h1 className="text-[40px] leading-tight font-black text-primary font-headline tracking-tighter">Employee Profile</h1>
                        <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.3em] mt-1 ml-1 opacity-60">Employee ID: {employee.employeeId}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    {canSubmitReport && (
                        <button 
                            onClick={() => setIsConductModalOpen(true)}
                            className="px-6 py-3.5 bg-amber-500 text-white font-black uppercase tracking-widest text-[11px] rounded-xl transition-all flex items-center gap-3 hover:bg-amber-600 shadow-lg shadow-amber-500/20 active:scale-95"
                        >
                            <AlertOctagon size={18} className="stroke-[3]" />
                            Submit Conduct Report
                        </button>
                    )}
                    <button 
                        onClick={() => window.print()}
                        className="px-6 py-3.5 bg-white border border-surface-container text-primary font-black uppercase tracking-widest text-[11px] rounded-xl transition-all flex items-center gap-3 hover:bg-surface-container-low shadow-sm active:scale-95"
                    >
                        <Printer size={18} className="stroke-[3]" />
                        Print
                    </button>
                    <button 
                        onClick={exportToExcel}
                        className="px-6 py-3.5 bg-white border border-surface-container text-primary font-black uppercase tracking-widest text-[11px] rounded-xl transition-all flex items-center gap-3 hover:bg-surface-container-low shadow-sm active:scale-95"
                    >
                        <TableProperties size={18} className="stroke-[3]" />
                        Export Excel
                    </button>
                    {currentUser?.role === 'admin' && (
                        <>
                            <button 
                                onClick={() => navigate(`/admin/employees/edit/${employee._id}`)}
                                className="px-8 py-3.5 bg-surface-container-high text-on-surface font-black uppercase tracking-widest text-[11px] rounded-xl transition-all flex items-center gap-3 hover:bg-surface-container-highest shadow-sm active:scale-95"
                            >
                                <Edit size={18} className="stroke-[3]" />
                                Edit Profile
                            </button>
                            <button 
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="px-8 py-3.5 bg-red-50 text-error border border-error/10 font-black uppercase tracking-widest text-[11px] rounded-xl transition-all flex items-center gap-3 hover:bg-red-100 shadow-sm active:scale-95"
                            >
                                <UserMinus size={18} className="stroke-[3]" />
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                {/* Left Side: Identity Card */}
                <div className="md:col-span-4 space-y-8">
                    <div className="bg-surface-container-lowest rounded-[32px] p-10 border border-surface-container text-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                        
                        <div className="relative mb-8">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl mx-auto flex items-center justify-center bg-primary text-white text-xl md:text-2xl font-black shadow-2xl ring-4 ring-white group-hover:scale-105 transition-transform duration-700">
                                {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ring-2 ring-white">
                                {employee.status}
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-primary font-headline tracking-tight">{employee.firstName} {employee.lastName}</h2>
                        <p className="text-on-surface-variant font-black text-[11px] uppercase tracking-widest mt-2 opacity-60">{employee.position || 'N/A'}</p>
                        
                        <div className="mt-10 pt-10 border-t border-surface-container-high space-y-6 text-left">
                            {[
                                { icon: <Contact size={20} />, val: employee.employeeId, label: 'Employee ID' },
                                { icon: <Mail size={20} />, val: employee.email, label: 'Email' },
                                { icon: <Smartphone size={20} />, val: employee.phone || 'N/A', label: 'Phone Number' },
                                { icon: <Globe size={20} />, val: employee.hub || employee.city || 'N/A', label: 'Branch' },
                                { icon: <Building2 size={20} />, val: employee.department?.name || 'N/A', label: 'Department' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group/item cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all shadow-sm">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 leading-none mb-1">{item.label}</p>
                                        <p className="text-sm font-black text-on-surface-variant">{item.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-primary p-10 rounded-[32px] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                        <h3 className="text-xl font-black font-headline tracking-tight mb-6">Employment Details</h3>
                        <p className="text-sm font-medium leading-relaxed italic text-blue-100">
                            {employee.firstName} is a {employee.employeeType?.replace('_', ' ')} specialist working at the {employee.hub} branch. 
                            Joined on {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'an undisclosed date'}.
                        </p>
                        <div className="mt-8 flex items-center gap-3">
                             <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-8 w-8 rounded-full border-2 border-primary bg-white/10 backdrop-blur-md"></div>
                                ))}
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Team Member</span>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10 scale-150 rotate-12 transform group-hover:translate-x-4 transition-transform duration-700">
                             <Building2 size={32} className="stroke-[1.5]" />
                        </div>
                    </div>
                </div>

                {/* Right Side: Performance & Insights */}
                <div className="md:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {[
                            { label: 'Join Date', val: employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'N/A', icon: <Calendar size={36} className="stroke-[2.5]" />, color: 'text-primary' },
                            { label: 'Salary', val: employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A', icon: <Banknote size={36} className="stroke-[2.5]" />, color: 'text-emerald-600' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-surface-container-lowest p-8 rounded-[32px] border border-surface-container shadow-sm hover:shadow-xl transition-all">
                                <p className="text-[11px] uppercase font-black text-on-surface-variant tracking-[0.25em] mb-4 opacity-50">{stat.label}</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center">
                                        <div className={stat.color}>{stat.icon}</div>
                                    </div>
                                    <p className={`text-3xl font-black ${stat.color} font-headline tracking-tighter`}>{stat.val}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-surface-container-lowest rounded-[32px] p-10 border border-surface-container shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-2xl font-black font-headline text-primary tracking-tight">Performance Overview</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mt-1">Performance and attendance metrics</p>
                            </div>
                            <div className="px-6 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100 mb-2">
                                {employee.stats?.performanceScore > 80 ? 'Top Tier' : 'Standard'}
                            </div>
                        </div>
                        
                        <div className="space-y-10">
                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <span className="text-sm font-black text-on-surface-variant uppercase tracking-widest">Attendance Rate</span>
                                    <span className="text-2xl font-black text-primary font-headline">{employee.stats?.attendancePercentage || 0}%</span>
                                </div>
                                <div className="h-4 w-full bg-surface-container-high rounded-full overflow-hidden shadow-inner">
                                    <div className="bg-primary h-full transition-all duration-1000 shadow-lg" style={{ width: `${employee.stats?.attendancePercentage || 0}%` }}></div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {[
                                    { label: 'Attendance', val: `${employee.stats?.attendancePercentage || 0}%`, icon: <ClipboardCheck size={28} className="stroke-[2.5]" /> },
                                    { label: 'Leaves', val: employee.stats?.leaveCount || 0, icon: <CalendarClock size={28} className="stroke-[2.5]" /> },
                                    { label: 'Status', val: employee.stats?.payrollStatus || 'N/A', icon: <Banknote size={28} className="stroke-[2.5]" /> }
                                ].map((m, i) => (
                                    <div key={i} className="p-6 bg-surface-container-low/40 rounded-2xl text-center border border-transparent hover:border-primary/10 hover:bg-white hover:shadow-md transition-all">
                                        <div className="text-primary mb-2 flex justify-center">{m.icon}</div>
                                        <p className="text-[11px] uppercase font-black text-on-surface-variant/40 tracking-widest mb-1">{m.label}</p>
                                        <p className="text-xl font-black text-primary font-headline tracking-tighter uppercase">{m.val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest rounded-[32px] overflow-hidden border border-surface-container shadow-sm">
                        <div className="p-8 border-b border-surface-container flex justify-between items-center bg-surface-container-low/30">
                            <h3 className="text-xl font-black tracking-tight text-primary font-headline uppercase tracking-widest">Documents</h3>
                            <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest flex items-center gap-2">
                                Access All <ArrowRight size={14} className="stroke-[3]" />
                            </button>
                        </div>
                        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {[
                                 { name: 'Onboarding_Manual.pdf', size: '2.4 MB', icon: <FileText size={20} className="stroke-[2.5]" /> },
                                 { name: 'Contract_2024.sec', size: '1.1 MB', icon: <Lock size={20} className="stroke-[2.5]" /> },
                                 { name: 'ID_Card.png', size: '4.8 MB', icon: <ImageIcon size={20} className="stroke-[2.5]" /> },
                                 { name: 'Performance_Q1.rep', size: '840 KB', icon: <BarChart3 size={20} className="stroke-[2.5]" /> }
                             ].map((doc, i) => (
                                 <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low/40 border border-transparent hover:border-primary/10 hover:bg-white transition-all cursor-pointer group">
                                     <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                         {doc.icon}
                                     </div>
                                     <div className="flex-1 overflow-hidden">
                                         <p className="text-sm font-black text-on-surface truncate font-headline">{doc.name}</p>
                                         <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">{doc.size}</p>
                                     </div>
                                     <Download size={18} className="text-primary stroke-[3] opacity-0 group-hover:opacity-100 transition-opacity" />
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                type="danger"
                title="Delete Employee"
                confirmText="Delete Employee"
                message={`Warning: You are about to permanently delete the employee record for ${employee.firstName} ${employee.lastName}. This action cannot be undone.`}
            />

            <ConductReportModal 
                isOpen={isConductModalOpen}
                onClose={() => setIsConductModalOpen(false)}
                employee={employee}
            />
        </div>
    );
};

export default EmployeeDetails;
