import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
import * as XLSX from 'xlsx';
import { 
  ArrowLeft, 
  Printer, 
  TableProperties, 
  Mail, 
  Phone, 
  FileText, 
  Download, 
  UserSquare2, 
  Quote, 
  Calendar, 
  Star 
} from 'lucide-react';

const CandidateDetails = ({ isHR = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCandidate = async () => {
      try {
        setLoading(true);
        const data = await fetchWithAuth(`/applications/${id}`);
        setCandidate(data);
      } catch (error) {
        console.error('Error fetching candidate details', error);
        alert(error?.response?.data?.message || error?.message || 'Action failed');
        navigate(isHR ? '/hr/recruitment' : '/admin/recruitment');
      } finally {
        setLoading(false);
      }
    };
    loadCandidate();
  }, [id, navigate, isHR]);

  const exportToExcel = () => {
    if (!candidate) return;
    const exportData = [
      { Field: 'Application ID', Value: candidate._id },
      { Field: 'Full Name', Value: candidate.fullName },
      { Field: 'Email', Value: candidate.email },
      { Field: 'Phone', Value: candidate.phone },
      { Field: 'Applied Role', Value: candidate.appliedRole },
      { Field: 'Status', Value: candidate.status },
      { Field: 'Stage', Value: candidate.stage },
      { Field: 'Submission Date', Value: new Date(candidate.createdAt).toLocaleDateString() },
      { Field: 'Cover Letter', Value: candidate.coverLetter || 'N/A' }
    ];

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Candidate Profile');
    XLSX.writeFile(wb, `candidate_${candidate.fullName.replace(/\s+/g, '_')}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!candidate) return null;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(isHR ? '/hr/recruitment' : '/admin/recruitment')}
            className="p-2 hover:bg-surface-container rounded-xl text-primary transition-all active:scale-95 border border-surface-container shadow-sm"
          >
            <ArrowLeft size={20} className="stroke-[3]" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-primary font-headline tracking-tight">Candidate Details</h1>
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em] mt-1 opacity-60">Recruitment Management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="px-6 py-2 bg-white border border-surface-container text-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-surface-container-low transition-all flex items-center gap-2 active:scale-95"
          >
            <Printer size={16} className="stroke-[3]" />
            Print
          </button>
          <button 
            onClick={exportToExcel}
            className="px-6 py-2 bg-white border border-surface-container text-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-surface-container-low transition-all flex items-center gap-2 active:scale-95"
          >
            <TableProperties size={16} className="stroke-[3]" />
            Export Excel
          </button>
          <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md ${
            candidate.status === 'Active' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'
          }`}>
            {candidate.status}
          </span>
          <span className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20">
            {candidate.stage}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-surface-container shadow-xl shadow-primary/5 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-20"></div>
            <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-white shadow-xl group-hover:rotate-6 transition-transform duration-500">
              <span className="text-4xl font-black text-primary font-headline">
                {candidate.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-black text-on-surface font-headline mb-1">{candidate.fullName}</h2>
            <p className="text-xs font-black text-primary uppercase tracking-widest mb-6">{candidate.appliedRole}</p>
            
            <div className="space-y-4 text-left">
              <div className="p-4 bg-surface-container-low rounded-2xl border border-surface-container flex items-center gap-4 group/item hover:bg-white transition-all cursor-pointer">
                <Mail size={18} className="text-primary/40 group-hover/item:text-primary transition-colors stroke-[2.5]" />
                <div className="overflow-hidden">
                  <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-bold text-on-surface truncate">{candidate.email}</p>
                </div>
              </div>
              <div className="p-4 bg-surface-container-low rounded-2xl border border-surface-container flex items-center gap-4 group/item hover:bg-white transition-all cursor-pointer">
                <Phone size={18} className="text-primary/40 group-hover/item:text-primary transition-colors stroke-[2.5]" />
                <div>
                  <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Phone Number</p>
                  <p className="text-sm font-bold text-on-surface">{candidate.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-blue-900 p-8 rounded-[2rem] text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
            <FileText size={32} className="absolute right-0 bottom-0 opacity-10 group-hover:scale-125 transition-transform duration-700 stroke-[1.5]" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-4">Resume</p>
            <h3 className="text-xl font-black font-headline mb-6">Resume / CV</h3>
            {candidate.cvFile ? (
              <a 
                href={candidate.cvFile} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-4 bg-white text-primary rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Download size={14} className="stroke-[3]" />
                Review CV
              </a>
            ) : (
              <p className="text-xs font-bold opacity-60 italic">No CV document provided</p>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white p-10 rounded-[2rem] border border-surface-container shadow-xl shadow-primary/5 space-y-10 relative overflow-hidden">
             <div className="flex items-center justify-between pb-6 border-b border-surface-container">
               <h3 className="text-xl font-black text-primary font-headline flex items-center gap-3">
                 <UserSquare2 size={24} className="stroke-[2.5]" />
                 Candidate Background
               </h3>
               <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest bg-surface-container px-3 py-1.5 rounded-lg">ID: {candidate._id.slice(-8)}</span>
             </div>

             <section className="space-y-4">
               <div className="flex items-center gap-4">
                 <div className="h-[2px] w-8 bg-primary/20"></div>
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Cover Letter</h4>
               </div>
               <div className="bg-surface-container-lowest p-8 rounded-3xl border border-dashed border-surface-container-high relative">
                 <Quote size={24} className="text-primary/10 absolute top-4 right-4 stroke-[3]" />
                 <p className="text-base text-on-surface leading-relaxed font-medium">
                    {candidate.coverLetter || "No cover letter provided."}
                 </p>
               </div>
             </section>

             <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-surface-container-low rounded-2xl border border-surface-container">
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">Submission Date</p>
                  <p className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <Calendar size={16} className="text-primary/50 stroke-[2.5]" />
                    {new Date(candidate.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </p>
                </div>
                <div className="p-6 bg-surface-container-low rounded-2xl border border-surface-container">
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">Internal Priority</p>
                  <p className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <Star size={16} className="text-primary/50 stroke-[2.5]" />
                    Standard Priority
                  </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails;
