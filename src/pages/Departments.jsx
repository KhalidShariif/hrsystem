import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { fetchWithAuth } from '../utils/api';
import { 
  Printer, 
  Plus, 
  Building2, 
  ArrowRight, 
  Settings, 
  Edit, 
  Trash2, 
  Users, 
  Wallet 
} from 'lucide-react';

const Departments = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({ name: '', description: '' });
    const [editingDept, setEditingDept] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deptToDelete, setDeptToDelete] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [analyticsDept, setAnalyticsDept] = useState(null);

    const [stats, setStats] = useState(null);

    const loadDepartments = async () => {
        try {
            setLoading(true);
            const [deptData, statsData, empData] = await Promise.all([
                fetchWithAuth('/departments').catch(() => []),
                fetchWithAuth('/dashboard/stats').catch(() => null),
                fetchWithAuth('/employees').catch(() => [])
            ]);
            setDepartments(deptData);
            setStats(statsData);
            setEmployees(empData);
        } catch (error) {
            console.error('Error fetching departments', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingDept ? 'PUT' : 'POST';
            const endpoint = editingDept ? `/departments/${editingDept._id}` : '/departments';
            await fetchWithAuth(endpoint, {
                method,
                body: JSON.stringify(formData),
            });
            setIsAddModalOpen(false);
            setEditingDept(null);
            setFormData({ name: '', description: '' });
            await loadDepartments();
        } catch (error) {
            console.error('Error adding department', error);
        }
    };

    const handleDelete = async () => {
        if (!deptToDelete) return;
        try {
            await fetchWithAuth(`/departments/${deptToDelete._id}`, { method: 'DELETE' });
            setIsDeleteModalOpen(false);
            setDeptToDelete(null);
            await loadDepartments();
        } catch (error) {
            console.error('Error deleting department', error);
            alert('Failed to delete department.');
        }
    };

    return (
        <>
            <section className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 md:mb-10 gap-6 no-print px-1">
                <div className="text-left">
                    <h2 className="text-3xl md:text-[40px] leading-tight font-black tracking-tight text-primary font-headline">Departments</h2>
                    <p className="text-[10px] md:text-xs text-on-surface-variant font-bold uppercase tracking-widest opacity-70 mt-1">Organizational Structure Management</p>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 md:gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-2 md:gap-3 px-5 md:px-6 py-3.5 bg-surface-container-low text-primary rounded-xl font-bold shadow-sm hover:bg-surface-container-high transition-all active:scale-95 text-[9px] md:text-[10px] uppercase tracking-widest"
                    >
                        <Printer size={18} className="stroke-[3]" />
                        <span className="hidden xs:inline">Print</span>
                    </button>
                    <button 
                        onClick={() => { setEditingDept(null); setFormData({ name: '', description: '' }); setIsAddModalOpen(true); }}
                        className="col-span-1 flex items-center justify-center gap-3 px-8 py-3.5 bg-primary text-white rounded-xl font-black shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 group flex-1 md:flex-none text-[9px] md:text-[10px] uppercase tracking-widest font-headline"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform stroke-[3]" />
                        New Dept
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-10 no-print px-1">
                {[
                    { label: 'Depts', value: departments.length < 10 ? `0${departments.length}` : departments.length.toString(), sub: 'Active', color: 'border-primary' },
                    { label: 'Staff', value: employees.length.toString(), sub: 'Total Members', color: 'border-secondary' },
                    { label: 'Cap', value: `${Math.min(100, Math.round((employees.length / (departments.length * 10 || 1)) * 100))}%`, sub: 'Utilization', color: 'border-tertiary' },
                    { label: 'Growth', value: employees.length > 0 ? '98.2%' : '0%', sub: 'Retention', color: 'border-secondary-container' }
                ].map((stat, i) => (
                    <div key={i} className={`bg-white p-4 md:p-6 rounded-[24px] shadow-sm flex flex-col gap-1 border border-surface-container hover:border-primary/30 transition-all group`}>
                        <span className="text-on-surface-variant text-[8px] md:text-[10px] font-black uppercase tracking-widest font-label opacity-40">{stat.label}</span>
                        <span className="text-2xl md:text-3xl font-headline font-black text-primary mt-1 group-hover:scale-105 transition-transform origin-left truncate">{stat.value}</span>
                        <p className="text-[8px] md:text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-1 hidden sm:block">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div id="print-area-departments" className="print-area">
                {/* Print Header */}
                <div className="hidden print:block mb-8 border-b-2 border-primary pb-6 pt-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-black text-primary font-headline uppercase tracking-tighter">HR System</h1>
                            <h2 className="text-xl font-bold text-on-surface-variant mt-1">Department Structure Report</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-primary font-headline">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Total Departments: {departments.length}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
                {loading ? (
                    <div className="col-span-full py-10 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : departments.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-on-surface-variant">No departments found</div>
                ) : departments.map((dept) => (
                    <div key={dept._id} className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-surface-container group">
                        <div className="h-2" style={{ backgroundColor: '#00236f' }}></div>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <Building2 size={28} style={{ color: '#00236f' }} className="stroke-[2.5]" />
                                </div>
                                <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-black rounded-md uppercase tracking-widest">Active</span>
                            </div>
                            <h3 className="text-2xl font-headline font-black text-on-surface tracking-tight group-hover:text-primary transition-colors">{dept.name}</h3>
                            <p className="text-sm text-on-surface-variant mt-2 font-medium leading-relaxed">{dept.description || 'Responsible for managing department specific operations.'}</p>
                            
                            <div className="mt-8 pt-8 border-t border-surface-container-high space-y-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-label">Department Head</span>
                                    <span className="text-sm font-black text-primary font-headline tracking-tighter">
                                        {dept.manager ? `${dept.manager.firstName} ${dept.manager.lastName}` : 'No manager assigned'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-label">Team Size</span>
                                    <span className="text-sm font-black text-on-surface font-headline">
                                        {employees.filter(e => e.department && (e.department._id === dept._id || e.department === dept._id)).length} Members
                                    </span>
                                </div>
                                <div className="space-y-2 pt-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                                        <span>Department Share</span>
                                        <span>{Math.round((employees.filter(e => e.department && (e.department._id === dept._id || e.department === dept._id)).length / (employees.length || 1)) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.round((employees.filter(e => e.department && (e.department._id === dept._id || e.department === dept._id)).length / (employees.length || 1)) * 100)}%`, backgroundColor: '#00236f' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-8 py-5 bg-surface-container-low flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 relative no-print">
                            <button onClick={() => setAnalyticsDept(dept)} className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:underline">
                                View Details <ArrowRight size={14} className="stroke-[3]" />
                            </button>
                            <div className="relative">
                                <button onClick={() => setActiveDropdown(activeDropdown === dept._id ? null : dept._id)} className="w-10 h-10 rounded-xl bg-white border border-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary shadow-sm relative z-10">
                                    <Settings size={20} className="stroke-[2.5]" />
                                </button>
                                {activeDropdown === dept._id && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-[20px] shadow-2xl border border-surface-container overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                            <button onClick={() => { setEditingDept(dept); setFormData({ name: dept.name, description: dept.description || '' }); setIsAddModalOpen(true); setActiveDropdown(null); }} className="w-full text-left px-6 py-4 text-[11px] font-black uppercase tracking-widest text-primary hover:bg-surface-container-low transition-colors flex items-center gap-3 border-b border-surface-container"><Edit size={16} className="stroke-[3]" /> Edit Department</button>
                                            <button onClick={() => { setDeptToDelete(dept); setIsDeleteModalOpen(true); setActiveDropdown(null); }} className="w-full text-left px-6 py-4 text-[11px] font-black uppercase tracking-widest text-error hover:bg-red-50 transition-colors flex items-center gap-3"><Trash2 size={16} className="stroke-[3]" /> Delete</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Card */}
                <div 
                    onClick={() => { setEditingDept(null); setFormData({ name: '', description: '' }); setIsAddModalOpen(true); }}
                    className="border-2 border-dashed border-outline-variant/50 rounded-2xl flex flex-col items-center justify-center p-10 text-center bg-surface-container-low/20 hover:bg-surface-container-low hover:border-primary/30 transition-all cursor-pointer group no-print"
                >
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-90">
                        <Plus size={32} className="text-primary stroke-[3]" />
                    </div>
                    <h3 className="text-xl font-headline font-black text-primary tracking-tight">Add New Department</h3>
                    <p className="text-sm text-on-surface-variant mt-3 max-w-[200px] font-medium leading-relaxed">Create a new department to organize your team.</p>
                </div>
            </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setEditingDept(null); }} title={editingDept ? "Edit Department" : "Add New Department"}>
                <form className="space-y-6" onSubmit={handleAddSubmit}>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Department Name</label>
                        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container-low border-none py-3.5 px-5 rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all font-bold placeholder:text-outline/40" placeholder="E.g. Logistics & Supply Chain" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Description</label>
                        <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-surface-container-low border-none py-3.5 px-5 rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all font-bold placeholder:text-outline/40" placeholder="E.g. Core Delivery" />
                    </div>
                    <div className="pt-6 flex gap-3 pb-2">
                        <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingDept(null); }} className="flex-1 py-4 bg-surface-container-high text-on-surface font-black rounded-xl active:scale-95 transition-all text-sm uppercase tracking-widest">Cancel</button>
                        <button type="submit" className="flex-1 py-4 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all font-headline text-sm uppercase tracking-widest">{editingDept ? "Update Department" : "Save Department"}</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!analyticsDept} onClose={() => setAnalyticsDept(null)} title="Department Details">
                {analyticsDept && (
                    <div className="space-y-6">
                        <div className="p-6 bg-surface-container-low rounded-2xl">
                            <h3 className="text-2xl font-black text-primary font-headline">{analyticsDept.name}</h3>
                            <p className="text-sm font-medium text-on-surface-variant mt-1">{analyticsDept.description || 'No description provided.'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 border border-surface-container-high rounded-xl text-center">
                                <Users size={32} className="text-primary mx-auto mb-2 stroke-[2.5]" />
                                <p className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Active Employees</p>
                                <p className="text-2xl font-black text-primary mt-1">{employees.filter(e => e.department && (e.department._id === analyticsDept._id || e.department === analyticsDept._id)).length}</p>
                            </div>
                            <div className="p-6 border border-surface-container-high rounded-xl text-center">
                                <Wallet size={32} className="text-primary mx-auto mb-2 stroke-[2.5]" />
                                <p className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Share of Workforce</p>
                                <p className="text-2xl font-black text-emerald-600 mt-1">{Math.round((employees.filter(e => e.department && (e.department._id === analyticsDept._id || e.department === analyticsDept._id)).length / (employees.length || 1)) * 100)}%</p>
                            </div>
                            <div className="col-span-2 p-6 border border-surface-container-high rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Department Head</p>
                                    <p className="text-sm font-black text-primary">{analyticsDept.manager ? `${analyticsDept.manager.firstName} ${analyticsDept.manager.lastName}` : 'No manager assigned'}</p>
                                </div>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-md">Optimal</span>
                            </div>
                        </div>
                        <button onClick={() => setAnalyticsDept(null)} className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all">Close</button>
                    </div>
                )}
            </Modal>

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setDeptToDelete(null); }}
                onConfirm={handleDelete}
                title="Delete Department"
                message={`Warning: You are about to permanently delete the ${deptToDelete?.name} department. This will affect all employees in this department. Do you wish to proceed?`}
                confirmText="Delete Department"
            />
        </>
    );
};

export default Departments;
