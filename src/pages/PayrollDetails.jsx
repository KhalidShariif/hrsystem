import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Landmark, 
  ShieldCheck 
} from 'lucide-react';

const PayrollDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const payroll = {
        id: id || 'PAY-2024-088',
        name: 'Mohamed Abdullahi',
        role: 'Senior HR Generalist',
        dept: 'Human Resources',
        period: 'October 1 - October 31, 2023',
        base: 4200.00,
        bonus: 350.00,
        deductions: 205.00,
        net: 4345.00,
        status: 'PAID',
        payDate: 'Nov 02, 2023'
    };
    const exportToExcel = () => {
        const exportData = [
            { Field: 'Reference ID', Value: payroll.id },
            { Field: 'Full Name', Value: payroll.name },
            { Field: 'Position', Value: payroll.role },
            { Field: 'Department', Value: payroll.dept },
            { Field: 'Period', Value: payroll.period },
            { Field: 'Base Salary', Value: payroll.base },
            { Field: 'Performance Bonus', Value: payroll.bonus },
            { Field: 'Deductions', Value: payroll.deductions },
            { Field: 'Net Salary', Value: payroll.net },
            { Field: 'Status', Value: payroll.status },
            { Field: 'Payment Date', Value: payroll.payDate }
        ];

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Payslip');
        XLSX.writeFile(wb, `payslip_${payroll.id}.xlsx`);
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-10 no-print">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white shadow-md border border-surface-container hover:bg-primary hover:text-white transition-all text-primary group active:scale-90"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform stroke-[3]" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-primary font-headline tracking-tighter uppercase tracking-widest leading-tight">Payslip Details</h1>
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] mt-1 ml-1 opacity-60">Reference ID: {payroll.id}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={exportToExcel}
                        className="px-6 py-3 bg-white border border-surface-container text-primary font-black rounded-xl hover:bg-surface-container-low transition-all text-[11px] uppercase tracking-widest shadow-sm flex items-center gap-3 active:scale-95"
                    >
                        <Download size={18} className="stroke-[3]" />
                        Download
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="px-6 py-3 bg-primary text-white font-black rounded-xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all text-[11px] uppercase tracking-widest flex items-center gap-3 active:scale-95 font-headline"
                    >
                        <Printer size={18} className="stroke-[3]" />
                        Print Slip
                    </button>
                </div>
            </div>

            <div id="print-area-payroll-details" className="print-area bg-surface-container-lowest rounded-[32px] shadow-2xl border border-surface-container overflow-hidden relative">
                {/* Print Header */}
                <div className="hidden print:block mb-6 border-b-2 border-primary pb-6 px-10 pt-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-black text-primary font-headline uppercase tracking-tighter">HR System</h1>
                            <h2 className="text-xl font-bold text-on-surface-variant mt-1">Employee Payslip - {payroll.period}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-primary font-headline">Ref: {payroll.id}</p>
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Issued: {payroll.payDate}</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
                
                <div className="p-10 bg-surface-container-low/30 border-b border-surface-container-high/50 flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-5">
                       <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                           <Landmark size={32} className="stroke-[2.5]" />
                       </div>
                       <div>
                           <h2 className="text-2xl font-black text-primary font-headline tracking-tight leading-none">Somali HR</h2>
                           <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-2">HR Department · Mogadishu</p>
                       </div>
                    </div>
                    <div className="text-right">
                        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                            payroll.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                            {payroll.status}
                        </span>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-4">Payment Date</p>
                        <p className="text-sm font-black text-primary font-headline">{payroll.payDate}</p>
                    </div>
                </div>

                <div className="p-10 relative z-10 font-label">
                    <div className="grid grid-cols-2 gap-10 mb-12">
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] border-b border-surface-container pb-2">Employee Information</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Full Name</span>
                                    <span className="text-sm font-black text-on-surface">{payroll.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Position</span>
                                    <span className="text-sm font-black text-on-surface">{payroll.role}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Department</span>
                                    <span className="text-sm font-black text-on-surface">{payroll.dept}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] border-b border-surface-container pb-2">Payment Period</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Payment Cycle</span>
                                    <span className="text-sm font-black text-on-surface">{payroll.period}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Working Days</span>
                                    <span className="text-sm font-black text-on-surface font-headline">22 Days</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Earnings</h4>
                            <div className="rounded-2xl border border-surface-container overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-surface-container-low text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
                                            <th className="px-6 py-3">Component</th>
                                            <th className="px-6 py-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container">
                                        <tr className="hover:bg-primary/[0.02] transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-on-surface-variant">Basic Salary</td>
                                            <td className="px-6 py-4 text-right text-xs font-black text-on-surface">${payroll.base.toFixed(2)}</td>
                                        </tr>
                                        <tr className="hover:bg-primary/[0.02] transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-on-surface-variant">Performance Bonus</td>
                                            <td className="px-6 py-4 text-right text-xs font-black text-emerald-600">${payroll.bonus.toFixed(2)}</td>
                                        </tr>
                                        <tr className="bg-primary/5">
                                            <td className="px-6 py-4 text-xs font-black text-primary uppercase tracking-widest">Gross Salary</td>
                                            <td className="px-6 py-4 text-right text-sm font-black text-primary font-headline">${(payroll.base + payroll.bonus).toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-error uppercase tracking-widest ml-1">Deductions</h4>
                            <div className="rounded-2xl border border-surface-container overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-surface-container-low text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
                                            <th className="px-6 py-3">Component</th>
                                            <th className="px-6 py-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container">
                                        <tr className="hover:bg-error/[0.02] transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-on-surface-variant">Income Tax</td>
                                            <td className="px-6 py-4 text-right text-xs font-black text-error/70">$120.00</td>
                                        </tr>
                                        <tr className="hover:bg-error/[0.02] transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-on-surface-variant">Health Insurance</td>
                                            <td className="px-6 py-4 text-right text-xs font-black text-error/70">$85.00</td>
                                        </tr>
                                        <tr className="bg-red-50/50">
                                            <td className="px-6 py-4 text-xs font-black text-error uppercase tracking-widest">Total Deductions</td>
                                            <td className="px-6 py-4 text-right text-sm font-black text-error font-headline">-${payroll.deductions.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 p-8 bg-primary rounded-[24px] text-white flex justify-between items-center shadow-2xl shadow-primary/30 relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60">Net Salary</p>
                            <h2 className="text-5xl font-black font-headline tracking-tighter mt-2">${payroll.net.toFixed(2)}</h2>
                        </div>
                        <div className="text-right relative z-10">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 ml-auto shadow-inner backdrop-blur-md">
                                <ShieldCheck size={32} className="stroke-[2.5]" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Verified By</p>
                            <p className="text-sm font-black font-headline italic">HR System</p>
                        </div>
                        <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-1000"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayrollDetails;
