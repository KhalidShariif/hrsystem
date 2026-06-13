import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Paperclip,
  ExternalLink,
  Shield
} from 'lucide-react';

const ConductReportDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const data = await fetchWithAuth(`/conduct-reports/${id}`);
                setReport(data);
            } catch (error) {
                console.error('Failed to fetch report details', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            await fetchWithAuth(`/conduct-reports/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            setReport({ ...report, status: newStatus });
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status');
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-primary">Loading...</div>;
    if (!report) return <div className="p-10 text-center font-bold text-error">Report not found</div>;

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-200';
            case 'resolved': return 'bg-blue-50 text-blue-600 border-blue-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex items-center gap-6 mb-10">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white shadow-md border border-surface-container hover:bg-primary hover:text-white transition-all text-primary group active:scale-90"
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform stroke-[3]" />
                </button>
                <div>
                    <h1 className="text-[40px] leading-tight font-black text-primary font-headline tracking-tighter">Report Details</h1>
                    <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.3em] mt-1 ml-1 opacity-60">Reference ID: {report._id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white rounded-[32px] p-10 border border-surface-container shadow-sm">
                        <div className="flex justify-between items-start mb-8">
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(report.status)}`}>
                                {report.status}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">
                                <Clock size={14} />
                                {new Date(report.createdAt).toLocaleString()}
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-primary font-headline tracking-tight mb-6">{report.title}</h2>
                        
                        <div className="flex flex-wrap gap-4 mb-10">
                            <div className="px-4 py-2 bg-surface-container-low rounded-xl text-xs font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle size={14} />
                                Type: {report.conductType}
                            </div>
                            <div className="px-4 py-2 bg-surface-container-low rounded-xl text-xs font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                                <Shield size={14} />
                                Priority: {report.priority}
                            </div>
                        </div>

                        <div className="prose max-w-none">
                            <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4">Description</h3>
                            <p className="text-on-surface-variant leading-relaxed font-medium bg-surface-container-low/30 p-6 rounded-2xl border border-surface-container-low">
                                {report.description}
                            </p>
                        </div>

                        {report.attachment && (
                            <div className="mt-10 pt-10 border-t border-surface-container">
                                <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4">Attachments & Evidence</h3>
                                <a 
                                    href={report.attachment} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                        <Paperclip size={20} className="stroke-[2.5]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black font-headline">View Attachment</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">External Resource</p>
                                    </div>
                                    <ExternalLink size={18} className="stroke-[3] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white rounded-[32px] p-8 border border-surface-container shadow-sm">
                        <h3 className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-6">Subject Employee</h3>
                        <div 
                            onClick={() => navigate(`/admin/employees/${report.employeeId?._id}`)}
                            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-low transition-all cursor-pointer group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-105 transition-transform">
                                {report.employeeId?.firstName?.charAt(0)}{report.employeeId?.lastName?.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-base font-black text-primary font-headline truncate capitalize">{report.employeeId?.firstName} {report.employeeId?.lastName}</p>
                                <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-0.5">{report.employeeId?.employeeId}</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-surface-container space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Position</span>
                                <span className="text-[11px] font-black text-on-surface-variant">{report.employeeId?.position || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Branch</span>
                                <span className="text-[11px] font-black text-on-surface-variant">{report.employeeId?.hub || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] p-8 border border-surface-container shadow-sm">
                        <h3 className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-6">Submitted By</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                                <User size={20} className="stroke-[2.5]" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-primary font-headline capitalize">{report.submittedBy?.firstName} {report.submittedBy?.lastName}</p>
                                <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-0.5">{report.submittedBy?.role}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] p-8 border border-surface-container shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-2">Actions</h3>
                        {report.status === 'pending' && (
                            <div className="grid grid-cols-1 gap-3">
                                <button 
                                    onClick={() => handleStatusUpdate('approved')}
                                    className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
                                >
                                    <CheckCircle2 size={18} className="stroke-[3]" />
                                    Approve Report
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate('rejected')}
                                    className="w-full py-4 bg-red-50 text-error border border-error/10 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-red-100 transition-all flex items-center justify-center gap-3"
                                >
                                    <XCircle size={18} className="stroke-[3]" />
                                    Reject Report
                                </button>
                            </div>
                        )}
                        {report.status === 'approved' && (
                            <button 
                                onClick={() => handleStatusUpdate('resolved')}
                                className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
                            >
                                <CheckCircle2 size={18} className="stroke-[3]" />
                                Mark as Resolved
                            </button>
                        )}
                        <button 
                            className="w-full py-4 bg-surface-container-low text-primary rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-surface-container-high transition-all flex items-center justify-center gap-3"
                            onClick={() => window.print()}
                        >
                            <FileText size={18} className="stroke-[3]" />
                            Print Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConductReportDetails;
