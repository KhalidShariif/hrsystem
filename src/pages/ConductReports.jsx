import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/api';
import { 
  FileText, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Eye,
  MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ConductReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await fetchWithAuth('/conduct-reports');
                setReports(data);
            } catch (error) {
                console.error('Failed to fetch conduct reports', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await fetchWithAuth(`/conduct-reports/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            setReports(reports.map(r => r._id === id ? { ...r, status: newStatus } : r));
        } catch (error) {
            console.error('Failed to update report status', error);
            alert('Failed to update status');
        }
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch = (
            report.employeeId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.employeeId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesFilter = filterStatus === 'all' || report.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            case 'resolved': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-600 bg-red-50';
            case 'Medium': return 'text-amber-600 bg-amber-50';
            case 'Low': return 'text-emerald-600 bg-emerald-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-[40px] leading-tight font-black text-primary font-headline tracking-tighter">Conduct Reports</h1>
                    <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.3em] mt-1 ml-1 opacity-60">Manage employee discipline and performance reports</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative group flex-1 sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform stroke-[3]" size={16} />
                        <input 
                            type="text"
                            placeholder="Search reports..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-surface-container py-3.5 pl-12 pr-6 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                        />
                    </div>
                    
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-primary stroke-[3]" size={16} />
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-white border border-surface-container py-3.5 pl-12 pr-10 rounded-2xl text-sm font-black uppercase tracking-widest text-primary appearance-none focus:ring-4 focus:ring-primary/5 transition-all outline-none cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-surface-container shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low/30 border-b border-surface-container">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50">Employee</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50">Report Details</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 text-center">Type</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 text-center">Priority</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 text-center">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center font-black text-primary uppercase tracking-widest animate-pulse">Loading reports...</td>
                                </tr>
                            ) : filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center font-black text-outline/40 uppercase tracking-widest">No reports found</td>
                                </tr>
                            ) : (
                                filteredReports.map((report) => (
                                    <tr key={report._id} className="hover:bg-surface-container-low/20 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-sm border border-primary/10">
                                                    {report.employeeId?.firstName?.charAt(0)}{report.employeeId?.lastName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-primary font-headline capitalize">{report.employeeId?.firstName} {report.employeeId?.lastName}</p>
                                                    <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-0.5">{report.employeeId?.employeeId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="text-sm font-black text-on-surface font-headline leading-tight">{report.title}</p>
                                                <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-tight mt-1 flex items-center gap-1.5">
                                                    <Clock size={12} />
                                                    {new Date(report.createdAt).toLocaleDateString()} by {report.submittedBy?.firstName}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-3 py-1 bg-surface-container-low text-on-surface-variant rounded-lg text-[10px] font-black uppercase tracking-tight">
                                                {report.conductType}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${getPriorityStyle(report.priority)}`}>
                                                {report.priority}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {report.status === 'pending' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleStatusUpdate(report._id, 'approved')}
                                                            title="Approve"
                                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
                                                        >
                                                            <CheckCircle2 size={18} className="stroke-[2.5]" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusUpdate(report._id, 'rejected')}
                                                            title="Reject"
                                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                                                        >
                                                            <XCircle size={18} className="stroke-[2.5]" />
                                                        </button>
                                                    </>
                                                )}
                                                {report.status === 'approved' && (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(report._id, 'resolved')}
                                                        title="Mark Resolved"
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all active:scale-90"
                                                    >
                                                        <CheckCircle2 size={18} className="stroke-[2.5]" />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => navigate(`/admin/employees/${report.employeeId?._id}`)}
                                                    title="View Profile"
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-low text-primary hover:bg-primary hover:text-white transition-all active:scale-90"
                                                >
                                                    <Eye size={18} className="stroke-[2.5]" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ConductReports;
