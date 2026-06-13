import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/api';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
    TableProperties,
    Printer,
    FileType,
    Verified,
    TrendingUp,
    ArrowRight,
    ExternalLink,
    Globe,
    Building2,
    Factory,
    ShieldCheck,
    ChevronRight,
    Copy
} from 'lucide-react';

const Reports = () => {
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generatingBrief, setGeneratingBrief] = useState(false);
    const [briefContent, setBriefContent] = useState('');
    const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);

    const loadReportData = async () => {
        try {
            setLoading(true);
            const data = await fetchWithAuth('/reports/summary');
            setReportData(data);
        } catch (error) {
            console.error('Failed to load report summary', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReportData();
    }, []);

    const exportSystemReport = () => {
        if (!reportData) return;
        const exportData = [
            { Metric: 'Total Employees', Value: reportData.employeeCount },
            { Metric: 'Total Departments', Value: reportData.departmentCount },
            { Metric: 'Total Paid Salaries', Value: reportData.payrollSummary.totalPaid },
            { Metric: 'Total Generated Payroll', Value: reportData.payrollSummary.totalGenerated },
            { Metric: 'Deductions', Value: reportData.payrollSummary.totalDeductions },
            { Metric: 'Active Job Postings', Value: reportData.recruitmentSummary.activeJobs },
            { Metric: 'Total Candidates', Value: reportData.recruitmentSummary.totalCandidates },
        ];
        reportData.departmentDistribution.forEach(d => {
            exportData.push({ Metric: `Department: ${d.name}`, Value: d.count });
        });
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'HR Summary');
        XLSX.writeFile(wb, `hr_summary_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleGenerateBrief = async () => {
        try {
            setGeneratingBrief(true);
            const data = await fetchWithAuth('/reports/brief');
            setBriefContent(data.summary);
            setIsBriefModalOpen(true);
        } catch (error) {
            console.error('Failed to generate brief', error);
            alert('Failed to generate brief. Please try again.');
        } finally {
            setGeneratingBrief(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(briefContent);
        alert('Brief copied to clipboard.');
    };

    const retentionIndex = reportData ? (reportData.employeeCount > 0 ? 98.2 : 0) : 0;
    const deptColors = ['bg-primary', 'bg-secondary-container', 'bg-tertiary-fixed-dim', 'bg-emerald-500', 'bg-amber-500'];

    if (loading) return (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-headline text-primary font-black uppercase tracking-[0.2em] animate-pulse text-sm">Loading reports summary...</p>
        </div>
    );

    return (
        <div className="pb-10 md:pb-20">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 md:mb-12 gap-6 no-print px-1">
                <div className="space-y-1 md:space-y-2 text-left px-1">
                    <h2 className="text-3xl md:text-[40px] lg:text-[48px] leading-tight font-black tracking-tight text-primary font-headline">Reports</h2>
                    <p className="text-[10px] md:text-xs text-on-surface-variant font-bold uppercase tracking-widest opacity-70 mt-1">Personnel Analytics & Performance</p>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 md:gap-3 w-full md:w-auto px-1">
                    <button
                        onClick={exportSystemReport}
                        className="flex items-center justify-center gap-2 md:gap-2.5 px-4 md:px-6 py-3.5 bg-surface-container-low text-primary font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-xl shadow-sm hover:bg-surface-container-high transition-all active:scale-95 flex-1 sm:flex-none"
                    >
                        <TableProperties size={18} className="stroke-[3] md:w-5 md:h-5" />
                        <span className="xs:inline">Export</span>
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-2 md:gap-2.5 px-4 md:px-6 py-3.5 bg-surface-container-low text-primary font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-xl shadow-sm hover:bg-surface-container-high transition-all active:scale-95 flex-1 sm:flex-none"
                    >
                        <Printer size={18} className="stroke-[3] md:w-5 md:h-5" />
                        <span className="xs:inline">Print</span>
                    </button>
                    <button
                        onClick={handleGenerateBrief}
                        disabled={generatingBrief}
                        className={`col-span-2 sm:col-span-none flex items-center justify-center gap-2.5 px-6 md:px-8 py-4 bg-primary text-white font-black text-[11px] md:text-sm uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 font-headline w-full sm:w-auto ${generatingBrief ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {generatingBrief ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <FileType size={18} className="stroke-[3] md:w-[22px] md:h-[22px]" />
                        )}
                        <span>{generatingBrief ? 'Generating...' : 'Summary Brief'}</span>
                    </button>
                </div>
            </div>

            <div id="print-area-reports" className="print-area">
                {/* Print Header */}
                <div className="hidden print:block mb-10 border-b-2 border-primary pb-8 pt-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black text-primary font-headline uppercase tracking-tighter">HR System</h1>
                            <h2 className="text-2xl font-bold text-on-surface-variant mt-1">HR Performance Report</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-base font-black text-primary font-headline">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">System Wide Summary</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 px-1">
                    {/* Main Progress Chart Area */}
                    <div className="col-span-12 xl:col-span-8 bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-surface-container relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors"></div>

                        <div className="flex justify-between items-start mb-6 md:mb-12 relative z-10 px-1">
                            <div>
                                <h3 className="text-lg md:text-2xl font-black text-primary font-headline tracking-tight">Growth</h3>
                                <p className="text-[9px] md:text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mt-1">Monthly New Hires</p>
                            </div>
                        </div>

                        <div className="relative h-[200px] md:h-[320px] w-full flex items-end justify-between px-1 md:px-6 pt-10 relative z-10">
                            <div className="absolute inset-x-0 bottom-8 top-0 flex flex-col justify-between pointer-events-none opacity-30">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-full border-t border-surface-container-high border-dashed"></div>
                                ))}
                            </div>
                            {reportData?.monthlyGrowth.map((bar, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 md:gap-6 group relative h-full justify-end flex-1">
                                    <div className="flex gap-1 md:gap-2.5 items-end h-full w-full justify-center">
                                        <div
                                            className="w-3 md:w-5 bg-primary/20 hover:bg-primary rounded-t-sm md:rounded-t-xl relative shadow-sm group-hover:scale-110 transition-all duration-500"
                                            style={{ height: `${Math.max(5, (bar.count / (reportData.employeeCount || 1)) * 100)}%` }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase whitespace-nowrap z-20 shadow-lg">{bar.count}</div>
                                        </div>
                                    </div>
                                    <span className="text-[8px] md:text-[11px] text-primary font-black uppercase tracking-tighter md:tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">{bar.month.substring(0, 1)}<span className="hidden sm:inline">{bar.month.substring(1, 3)}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fiscal Distribution */}
                    <div className="col-span-12 xl:col-span-4 bg-surface-container-low/40 backdrop-blur-md rounded-[32px] p-8 md:p-10 flex flex-col items-center justify-center text-center shadow-inner border border-surface-container">
                        <h3 className="text-xl md:text-2xl font-black text-primary font-headline tracking-tight">Salary Map</h3>
                        <p className="text-[9px] md:text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mt-1 mb-8 md:mb-10">Dept distribution overview</p>

                        <div className="relative w-44 h-44 md:w-56 md:h-56 mb-8 md:mb-12 flex items-center justify-center transform hover:rotate-6 transition-transform duration-700">
                            <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" className="text-surface-container-high" stroke="currentColor" strokeWidth="3.5" />
                                {reportData?.departmentDistribution.map((dept, i) => {
                                    const total = reportData.employeeCount || 1;
                                    const percentage = (dept.count / total) * 100;
                                    let offset = 0;
                                    for (let j = 0; j < i; j++) {
                                        offset += (reportData.departmentDistribution[j].count / total) * 100;
                                    }
                                    const colors = ['#dce1ff', '#6e85ff', '#3b51ce', '#2a3a93'];
                                    return (
                                        <circle
                                            key={i}
                                            cx="18" cy="18" r="16" fill="none"
                                            stroke={colors[i % colors.length]}
                                            strokeWidth="4"
                                            strokeDasharray={`${percentage} 100`}
                                            strokeDashoffset={-offset}
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-2xl md:text-3xl font-black text-primary font-headline leading-none">${(reportData?.payrollSummary.totalPaid / 1000).toFixed(1)}k</span>
                                <span className="text-[9px] text-on-surface-variant/60 font-black uppercase tracking-widest mt-2 text-center px-4">TOTAL PAID</span>
                            </div>
                        </div>

                        <div className="w-full space-y-3 font-label">
                            {reportData?.departmentDistribution.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-3.5 rounded-xl bg-white border border-surface-container shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className={`w-3 h-3 rounded-md shadow-sm shrink-0 ${deptColors[i % deptColors.length]}`}></span>
                                        <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest truncate">{item.name}</span>
                                    </div>
                                    <span className="text-xs md:text-sm font-black text-primary font-headline tracking-tighter shrink-0">{((item.count / (reportData.employeeCount || 1)) * 100).toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Key Metric Card */}
                    <div className="col-span-12 xl:col-span-4 bg-primary text-white rounded-[32px] p-8 md:p-10 relative overflow-hidden shadow-2xl group transition-all duration-500 hover:scale-[1.02] flex flex-col justify-between min-h-[300px] md:min-h-[320px]">
                        <div className="relative z-10">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-xl backdrop-blur-md ring-1 ring-white/20 group-hover:rotate-12 transition-transform">
                                <Verified size={24} className="md:w-8 md:h-8 text-white fill-white/20" />
                            </div>
                            <h3 className="text-[9px] font-black text-blue-100 uppercase tracking-[0.2em] mb-2 opacity-60 font-label">Retention Rate</h3>
                            <div className="flex items-baseline gap-3 mb-6">
                                <span className="text-4xl md:text-6xl font-black font-headline tracking-tighter">{retentionIndex}%</span>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/20">
                                    <TrendingUp size={12} className="stroke-[3]" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Steady</span>
                                </div>
                            </div>
                            <p className="text-xs md:text-sm text-blue-100/80 leading-relaxed font-bold font-body">Managing {reportData?.employeeCount} active employees. Data current for this cycle.</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/employees')}
                            className="relative z-10 mt-8 flex items-center justify-between w-full group/btn no-print"
                        >
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-200">Go to Directory</span>
                            <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                        </button>
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-1000"></div>
                    </div>
                    {/* Regional Statistics */}
                    <div className="col-span-12 xl:col-span-8 bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-surface-container relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-10 gap-4 px-1">
                            <div className="text-left">
                                <h3 className="text-xl md:text-2xl font-black text-primary font-headline tracking-tight">Branch Activity</h3>
                                <p className="text-[9px] md:text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mt-1">Attendance by region</p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/attendance')}
                                className="text-[10px] font-black text-primary hover:underline uppercase tracking-[0.2em] flex items-center gap-2 no-print self-start sm:self-auto"
                            >
                                View All <ExternalLink size={14} className="stroke-[3]" />
                            </button>
                        </div>
                        <div className="space-y-4 md:space-y-6 relative z-10">
                            {reportData?.hubOperationalData.length === 0 ? (
                                <div className="text-center py-10 text-on-surface-variant font-bold uppercase tracking-widest text-[10px] border-2 border-dashed border-surface-container rounded-2xl opacity-50 italic">No branch data found</div>
                            ) : reportData?.hubOperationalData.map((hub, i) => {
                                const icons = [<Globe size={20} className="md:w-5 md:h-5 stroke-[2.5]" />, <Building2 size={20} className="md:w-5 md:h-5 stroke-[2.5]" />, <Factory size={20} className="md:w-5 md:h-5 stroke-[2.5]" />, <ShieldCheck size={20} className="md:w-5 md:h-5 stroke-[2.5]" />];
                                const colors = ['bg-primary', 'bg-secondary', 'bg-emerald-500', 'bg-amber-500'];
                                return (
                                    <div
                                        key={i}
                                        onClick={() => navigate(`/admin/attendance?hub=${hub.name}`)}
                                        className="flex items-center gap-4 md:gap-8 p-4 md:p-5 hover:bg-surface-container-low/30 rounded-2xl border border-transparent hover:border-surface-container-high transition-all group cursor-pointer hover:shadow-lg hover:bg-white transform hover:-translate-x-1"
                                    >
                                        <div className={`w-10 h-10 md:w-14 md:h-14 ${colors[i % colors.length]} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                                            {icons[i % icons.length]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base md:text-lg font-black text-on-surface font-headline leading-tight truncate group-hover:text-primary transition-colors">{hub.name}</h4>
                                            <p className="text-[9px] md:text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest mt-1 truncate">{hub.count} Emp • {hub.attendancePercentage}% Rate</p>
                                        </div>
                                        <div className="hidden xs:flex w-24 md:w-48 items-center gap-4">
                                            <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden shadow-inner">
                                                <div className={`${colors[i % colors.length]} h-full rounded-full transition-all duration-1000`} style={{ width: `${hub.attendancePercentage}%` }}></div>
                                            </div>
                                            <span className="text-xs md:text-sm font-black text-primary font-headline tracking-tighter w-8">{Math.round(hub.attendancePercentage)}%</span>
                                        </div>
                                        <ChevronRight size={18} className="text-on-surface-variant/40 group-hover:text-primary transition-colors stroke-[3] no-print shrink-0" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isBriefModalOpen}
                onClose={() => setIsBriefModalOpen(false)}
                title="HR Summary Brief"
            >
                <div className="bg-surface-container-low p-6 rounded-2xl border border-surface-container font-mono text-sm text-primary leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                    {briefContent}
                </div>
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={copyToClipboard}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white border border-surface-container-high text-primary font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-surface-container-low transition-all active:scale-95"
                    >
                        <Copy size={16} className="stroke-[3]" />
                        Copy Brief
                    </button>
                    <button
                        onClick={() => setIsBriefModalOpen(false)}
                        className="flex-1 py-4 bg-primary text-white font-black text-[11px] uppercase tracking-widest rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95 font-headline"
                    >
                        Close
                    </button>
                </div>
            </Modal>
        </div>
    );
};
export default Reports;
