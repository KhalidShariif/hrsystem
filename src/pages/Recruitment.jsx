import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
import Modal from '../components/Modal';
import * as XLSX from 'xlsx';
import {
  Printer,
  FileSpreadsheet,
  Link2,
  Plus,
  Users,
  Mic2,
  FileText,
  UserCheck,
  UserMinus,
  Briefcase,
  MapPin,
  Clock,
  Copy,
  Eye,
  RefreshCw,
  PartyPopper,
  Filter,
  MoreVertical,
  Search,
  FileSearch,
  Calendar,
  CheckCircle2,
  Trash2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

const DISTRICT_MAP = {
  Mogadishu: ['Hodan', 'Wadajir', 'Warta Nabada', 'Howlwadaag', 'Yaqshid', 'Dharkenley', 'Daynile', 'Kaxda', 'Waaberi', 'Hamar Weyne', 'Hamar Jajab', 'Shangani', 'Shibis', 'Bondhere', 'Abdiaziz', 'Karaan', 'Garasbaley'],
  Hargeisa: ['26 June', 'Ibrahim Koodbuur', 'Ahmed Dhagax', 'Mohamed Mooge', 'Gacan Libaax', 'Maxamuud Haybe', 'State House', 'Jigjiga Yar'],
  Garowe: ['Wadajir', 'Hantiwadaag', '1da August', 'Horseed'],
  Kismayo: ['Farjano', 'Faanoole', 'Shaqaalaha', 'Calanley', 'Via Afmadow'],
};

const Recruitment = ({ isHR = false }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    status: 'active',
    salary: '',
    description: '',
    requirements: '',
    district: ''
  });
  const [filterStage, setFilterStage] = useState('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [postedJobLink, setPostedJobLink] = useState(null);

  // Confirmation Modals State
  const [confirmation, setConfirmation] = useState({ isOpen: false, type: '', id: '', stage: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [appData, jobsData] = await Promise.all([
        fetchWithAuth('/applications').catch(() => []),
        fetchWithAuth('/jobs').catch(() => [])
      ]);
      setApplications(Array.isArray(appData) ? appData : []);
      setJobPostings(Array.isArray(jobsData) ? jobsData : []);
      // Also fetch departments for the job posting form
      try {
        const deptData = await fetchWithAuth('/departments');
        setDepartments(Array.isArray(deptData) ? deptData : []);
      } catch (_) { }
    } catch (error) {
      console.error('Error fetching recruitment data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const data = await fetchWithAuth('/jobs', {
        method: 'POST',
        body: JSON.stringify(newJob)
      });
      setPostedJobLink(`http://localhost:5174/careers/apply/${data._id}`);
      setNewJob({ title: '', department: '', location: '', type: 'Full-time', status: 'active', salary: '', description: '', requirements: '' });
      await loadData();
    } catch (error) {
      console.error('Error posting job', error);
      alert(error?.response?.data?.message || error?.message || 'Action failed');
    }
  };

  const handleMoveStage = async (id, stage) => {
    // If HIRED or REJECTED, trigger confirmation first
    if ((stage === 'HIRED' || stage === 'REJECTED') && !confirmation.isOpen) {
      setConfirmation({ isOpen: true, type: stage, id, stage });
      setActiveDropdown(null);
      return;
    }

    try {
      await fetchWithAuth(`/applications/${id}/stage`, {
        method: 'PUT',
        body: JSON.stringify({ stage })
      });
      await loadData();
      setActiveDropdown(null);
      setConfirmation({ isOpen: false, type: '', id: '', stage: '' });
      if (stage === 'HIRED') alert('Employee onboarding initiated. Candidate has been added to the Employee Directory.');
    } catch (error) {
      alert(error?.response?.data?.message || error?.message || 'Action failed');
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application? This action is irreversible.')) return;
    try {
      await fetchWithAuth(`/applications/${id}`, { method: 'DELETE' });
      await loadData();
      setActiveDropdown(null);
    } catch (error) {
      alert(error?.response?.data?.message || error?.message || 'Action failed');
    }
  };

  const exportToExcel = () => {
    if (applications.length === 0) return;
    const exportData = applications.map(app => ({
      'Candidate Name': app.fullName,
      'Email': app.email,
      'Phone': app.phone,
      'Applied Role': app.appliedRole || 'General',
      'Stage': app.stage,
      'Status': app.status,
      'Submission Date': new Date(app.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Recruitment Pipeline');
    XLSX.writeFile(wb, `recruitment-report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Filter out HIRED from pending list as per requirements
  const pendingApplications = applications.filter(a => a.stage !== 'HIRED');
  const filteredApplications = pendingApplications.filter(a => filterStage === 'all' || a.stage === filterStage);

  // Statistics Calculation
  const stats = {
    total: applications.length,
    interviews: applications.filter(a => a.stage === 'INTERVIEW').length,
    offers: applications.filter(a => a.stage === 'OFFERED').length,
    hired: applications.filter(a => a.stage === 'HIRED').length,
    rejected: applications.filter(a => a.stage === 'REJECTED').length
  };

  const stageColors = {
    'APPLIED': 'bg-blue-500 text-white',
    'REVIEWING': 'bg-orange-500 text-white',
    'INTERVIEW': 'bg-purple-600 text-white',
    'OFFERED': 'bg-green-500 text-white',
    'HIRED': 'bg-emerald-600 text-white',
    'REJECTED': 'bg-red-500 text-white'
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 md:mb-10 gap-6 no-print px-1">
        <div className="space-y-1 text-left px-1">
          <h2 className="text-3xl md:text-[40px] leading-tight font-black font-headline tracking-tight text-primary">Recruitment</h2>
          <p className="text-[10px] md:text-xs text-on-surface-variant font-bold uppercase tracking-widest opacity-70 mt-1">Pipeline & Talent Acquisition</p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto px-1">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-3 md:px-4 py-3 md:py-3.5 bg-surface-container-low text-primary rounded-xl font-bold shadow-sm hover:bg-surface-container-high transition-all active:scale-95 text-[9px] md:text-[10px] uppercase tracking-widest flex-1 sm:flex-none"
          >
            <Printer size={16} className="stroke-[3] md:size-18" />
            <span className="hidden xs:inline">Print</span>
            <span className="xs:hidden">Print</span>
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center justify-center gap-2 px-3 md:px-4 py-3 md:py-3.5 bg-surface-container-low text-primary rounded-xl font-bold shadow-sm hover:bg-surface-container-high transition-all active:scale-95 text-[9px] md:text-[10px] uppercase tracking-widest flex-1 sm:flex-none"
          >
            <FileSpreadsheet size={16} className="stroke-[3] md:size-18" />
            <span className="hidden xs:inline">Export</span>
            <span className="xs:hidden">Export</span>
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText('http://localhost:5174/careers');
              alert('Careers link copied to clipboard.');
            }}
            className="flex items-center justify-center gap-2 px-3 md:px-4 py-3 md:py-3.5 bg-surface-container-low text-primary rounded-xl font-bold shadow-sm hover:bg-surface-container-high transition-all active:scale-95 text-[9px] md:text-[10px] uppercase tracking-widest group flex-1 sm:flex-none"
          >
            <Link2 size={16} className="text-secondary stroke-[3] md:size-18" />
            <span className="hidden xs:inline">Link</span>
            <span className="xs:hidden">Link</span>
          </button>
          <button
            onClick={() => setIsAddJobModalOpen(true)}
            className="col-span-2 sm:col-span-none flex items-center justify-center gap-3 px-6 py-4 bg-primary text-white rounded-xl font-black shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 text-[11px] md:text-sm group font-headline w-full sm:w-auto uppercase tracking-widest"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300 stroke-[3]" />
            <span className="whitespace-nowrap">New Job</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-10 no-print px-1">
        {[
          { label: 'Applicants', val: stats.total, icon: <Users size={16} className="md:size-18 stroke-[3]" />, color: 'text-primary bg-primary/5' },
          { label: 'Interviews', val: stats.interviews, icon: <Mic2 size={16} className="md:size-18 stroke-[3]" />, color: 'text-purple-600 bg-purple-50' },
          { label: 'Offers', val: stats.offers, icon: <FileText size={16} className="md:size-18 stroke-[3]" />, color: 'text-green-600 bg-green-50' },
          { label: 'Hired', val: stats.hired, icon: <UserCheck size={16} className="md:size-18 stroke-[3]" />, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Rejected', val: stats.rejected, icon: <UserMinus size={16} className="md:size-18 stroke-[3]" />, color: 'text-red-500 bg-red-50' }
        ].map((s, i) => (
          <div key={i} className={`bg-white p-4 md:p-6 rounded-[24px] border border-surface-container shadow-sm flex flex-col justify-between h-32 md:h-44 group hover:border-primary/30 hover:shadow-md transition-all ${i === 4 ? 'md:col-span-2 xl:col-span-1' : ''}`}>
            <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl ${s.color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-[7px] md:text-[10px] font-black text-on-surface-variant uppercase tracking-widest font-label opacity-40 truncate">{s.label}</p>
              <h3 className="text-xl md:text-3xl font-black text-primary mt-1 font-headline tracking-tighter truncate">{s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 no-print px-1">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-surface-container">
            <div className="flex justify-between items-start mb-6 md:mb-8 px-1">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-primary font-headline">Job Openings</h3>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">Live Positions</p>
              </div>
              <span className="bg-secondary text-white text-[8px] md:text-[10px] font-black px-3 py-1.5 rounded-md font-label uppercase tracking-widest shadow-sm">{jobPostings.length} ACTIVE</span>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
              ) : jobPostings.length === 0 ? (
                <div className="text-center py-10 text-on-surface-variant font-bold uppercase tracking-widest text-[10px] border-2 border-dashed border-surface-container rounded-xl opacity-50">No job postings found</div>
              ) : jobPostings.map((job) => (
                <div key={job._id} className="group p-4 md:p-5 bg-surface-container-low/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white hover:shadow-md border border-transparent hover:border-surface-container transition-all cursor-pointer gap-4">
                  <div className="flex gap-4 md:gap-5 items-center min-w-0">
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-primary/5 flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                      <Briefcase size={16} className="md:w-5 md:h-5 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm md:text-base font-bold text-on-surface font-headline group-hover:text-primary transition-colors truncate">{job.title}</h4>
                      <div className="flex flex-wrap items-center gap-x-2.5 md:gap-x-3 gap-y-1 text-[8px] md:text-xs text-on-surface-variant mt-1 md:mt-1.5 font-label font-bold opacity-60">
                        <span className="flex items-center gap-1 uppercase tracking-wider whitespace-nowrap"><MapPin size={12} className="md:w-3 md:h-3 text-primary stroke-[3]" /> {job.location || 'Remote'}</span>
                        <span className="flex items-center gap-1 uppercase tracking-wider whitespace-nowrap"><Clock size={12} className="md:w-3 md:h-3 text-secondary stroke-[3]" /> {job.type || 'FT'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] md:text-sm font-black text-primary font-headline">{job.applicants || 0} Applicants</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(`http://localhost:5174/careers/apply/${job._id}`);
                          alert('Link copied.');
                        }}
                        className="p-2.5 bg-white hover:bg-primary/5 rounded-xl text-primary transition-all border border-surface-container shadow-sm active:scale-90"
                      >
                        <Copy size={16} className="stroke-[3]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/careers/apply/${job._id}`, '_blank');
                        }}
                        className="p-2.5 bg-white hover:bg-secondary/5 rounded-xl text-secondary transition-all border border-surface-container shadow-sm active:scale-90"
                      >
                        <Eye size={16} className="stroke-[3]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container-low/30 backdrop-blur-md rounded-[32px] p-6 md:p-8 h-full flex flex-col shadow-sm border border-surface-container">
            <div className="flex justify-between items-center mb-6 md:mb-8 px-1">
              <h3 className="text-lg md:text-xl font-bold font-headline text-primary">Pipeline Status</h3>
              <button
                onClick={() => setFilterStage('all')}
                className="text-primary font-black text-[9px] md:text-[11px] uppercase tracking-widest flex items-center gap-2 font-label hover:underline group/reset"
              >
                Reset <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500 stroke-[3]" />
              </button>
            </div>
            <div className="flex-1 space-y-6 md:space-y-10">
              <section className="px-1">
                <div className="flex items-center justify-between mb-4 md:mb-5">
                  <h4 className="text-[8px] md:text-[11px] font-black text-on-surface-variant tracking-[0.25em] uppercase font-label">New Apps ({applications.filter(a => a.stage === 'APPLIED').length})</h4>
                  <div className="h-[2px] flex-1 mx-3 md:mx-5 bg-primary/10"></div>
                </div>
                <div className="flex -space-x-2.5 md:-space-x-4 overflow-hidden p-1">
                  {applications.filter(a => a.stage === 'APPLIED').slice(0, 5).map((app, i) => (
                    <div key={app._id || i} className="inline-block h-10 w-10 md:h-12 md:w-12 rounded-full ring-4 ring-white shadow-md bg-blue-100 overflow-hidden transform hover:-translate-y-1 transition-transform cursor-pointer group/avatar shrink-0">
                      <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-[10px] md:text-xs uppercase">
                        {app.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                    </div>
                  ))}
                  {applications.filter(a => a.stage === 'APPLIED').length > 5 && (
                    <div className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full ring-4 ring-white bg-primary text-white text-[10px] md:text-xs font-black font-headline shadow-md cursor-pointer hover:scale-110 transition-transform shrink-0">+{applications.filter(a => a.stage === 'APPLIED').length - 5}</div>
                  )}
                </div>
              </section>

              <section className="px-1">
                <div className="flex items-center justify-between mb-4 md:mb-5">
                  <h4 className="text-[8px] md:text-[11px] font-black text-on-surface-variant tracking-[0.25em] uppercase font-label">Offered ({applications.filter(a => a.stage === 'OFFERED').length})</h4>
                  <div className="h-[2px] flex-1 mx-3 md:mx-5 bg-emerald-500/20"></div>
                </div>
                <div className="p-5 md:p-6 rounded-[24px] bg-gradient-to-br from-primary to-blue-900 text-white flex items-center gap-4 md:gap-5 shadow-xl shadow-primary/30 relative overflow-hidden group cursor-pointer">
                  <PartyPopper size={24} className="md:w-8 md:h-8 text-white/40 group-hover:scale-125 transition-transform duration-500 shrink-0" />
                  <div className="relative z-10 min-w-0">
                    <p className="text-sm md:text-base font-black font-headline tracking-tight truncate">{applications.filter(a => a.stage === 'OFFERED').length} Offers Pending</p>
                    <p className="text-[8px] md:text-[10px] text-blue-200 font-bold uppercase tracking-widest mt-1 opacity-80">Final Stage</p>
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-full bg-white/5 skew-x-[30deg] translate-x-10 group-hover:translate-x-0 transition-all duration-700"></div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div id="print-area-recruitment" className="col-span-12 pb-20 print-area">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container relative overflow-hidden">
            <div className="px-6 md:px-8 py-4 md:py-6 border-b border-surface-container-high flex justify-between items-center bg-surface-container-low/30 no-print rounded-t-2xl">
              <div className="flex items-center gap-4">
                <h3 className="text-lg md:text-xl font-bold text-primary font-headline">Pipeline</h3>
                <span className="hidden sm:inline px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-md">Real-time</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center hover:bg-surface-container rounded-xl text-primary font-bold transition-all border border-surface-container shadow-sm active:scale-95 bg-white group gap-2 px-3 sm:w-auto"
                >
                  <Filter size={18} className="stroke-[3] group-hover:rotate-12 transition-transform" />
                  <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Filter</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-thin scrollbar-track-surface-container scrollbar-thumb-primary/20">
              <table className="w-full text-left min-w-[750px] xl:min-w-0 border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-[9px] md:text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] font-label">
                    <th className="px-6 md:px-8 py-5">Candidate</th>
                    <th className="px-4 md:px-8 py-5">Position</th>
                    <th className="px-4 md:px-8 py-5">Stage</th>
                    <th className="px-4 md:px-8 py-5">Applied</th>
                    <th className="px-6 md:px-8 py-5 text-right no-print">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                  ) : filteredApplications.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-10 text-on-surface-variant font-bold uppercase tracking-widest text-[9px] italic opacity-50">No applications found</td></tr>
                  ) : filteredApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-surface-container-low/40 transition-all group">
                      <td className="px-6 md:px-8 py-4 md:py-6">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] md:text-sm font-headline shadow-sm shrink-0 uppercase">
                            {app.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <span className="text-sm md:text-base font-black text-on-surface font-headline truncate max-w-[120px] md:max-w-none leading-tight">{app.fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-8 py-4 md:py-6 text-[10px] md:text-sm font-bold text-on-surface-variant truncate max-w-[120px] md:max-w-none">{app.appliedRole || 'General'}</td>
                      <td className="px-4 md:px-8 py-4 md:py-6">
                        <span className={`inline-flex items-center justify-center px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-widest shadow-sm whitespace-nowrap ${stageColors[app.stage]}`}>
                          {app.stage}
                        </span>
                      </td>
                      <td className="px-4 md:px-8 py-4 md:py-6 text-[10px] md:text-sm text-on-surface-variant/70 font-bold whitespace-nowrap">{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 md:px-8 py-4 md:py-6 text-right relative no-print">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === app._id ? null : app._id); }}
                          className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-low transition-all ml-auto"
                        >
                          <MoreVertical size={16} className="text-outline hover:text-primary stroke-[3] md:size-18" />
                        </button>
                        {activeDropdown === app._id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                            <div className="absolute right-8 md:right-10 top-12 md:top-14 w-52 md:w-64 bg-white rounded-[24px] shadow-2xl border border-surface-container-high overflow-hidden z-[100] font-label animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                              <button onClick={() => navigate(isHR ? `/hr/recruitment/candidates/${app._id}` : `/admin/recruitment/candidates/${app._id}`)} className="w-full text-left px-5 md:px-6 py-3.5 md:py-4 text-[10px] md:text-[13px] font-bold uppercase tracking-wide text-primary hover:bg-primary/5 transition-colors flex items-center gap-3 md:gap-4 border-b border-surface-container">
                                <Eye size={16} className="stroke-[3] md:size-18" /> View Profile
                              </button>

                              <div className="px-5 md:px-6 py-2 bg-surface-container-low text-[8px] md:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] border-b border-surface-container">Stage Control</div>

                              <div className="max-h-[300px] overflow-y-auto no-scrollbar divide-y divide-surface-container">
                                {app.stage === 'APPLIED' && (
                                  <button onClick={() => handleMoveStage(app._id, 'REVIEWING')} className="w-full text-left px-5 md:px-6 py-3 md:py-4 text-[10px] md:text-[13px] font-bold uppercase tracking-wide text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-3 md:gap-4">
                                    <Search size={16} className="stroke-[3] md:size-18" /> Reviewing
                                  </button>
                                )}

                                {(app.stage === 'APPLIED' || app.stage === 'REVIEWING') && (
                                  <button onClick={() => handleMoveStage(app._id, 'INTERVIEW')} className="w-full text-left px-5 md:px-6 py-3 md:py-4 text-[10px] md:text-[13px] font-bold uppercase tracking-wide text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-3 md:gap-4">
                                    <Mic2 size={16} className="stroke-[3] md:size-18" /> Interview
                                  </button>
                                )}

                                {app.stage === 'INTERVIEW' && (
                                  <button onClick={() => handleMoveStage(app._id, 'OFFERED')} className="w-full text-left px-5 md:px-6 py-3 md:py-4 text-[10px] md:text-[13px] font-bold uppercase tracking-wide text-green-600 hover:bg-green-50 transition-colors flex items-center gap-3 md:gap-4">
                                    <FileText size={16} className="stroke-[3] md:size-18" /> Send Offer
                                  </button>
                                )}

                                {app.stage === 'OFFERED' && (
                                  <button onClick={() => handleMoveStage(app._id, 'HIRED')} className="w-full text-left px-5 md:px-6 py-3 md:py-4 text-[10px] md:text-[13px] font-bold uppercase tracking-wide text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-3 md:gap-4">
                                    <UserCheck size={16} className="stroke-[3] md:size-18" /> Confirm Hire
                                  </button>
                                )}

                                {app.stage !== 'REJECTED' && (
                                  <button onClick={() => handleMoveStage(app._id, 'REJECTED')} className="w-full text-left px-5 md:px-6 py-3 md:py-4 text-[10px] md:text-[13px] font-bold uppercase tracking-wide text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 md:gap-4">
                                    <UserMinus size={16} className="stroke-[3] md:size-18" /> Reject
                                  </button>
                                )}

                                <button onClick={() => handleDeleteApplication(app._id)} className="w-full text-left px-5 md:px-6 py-3 md:py-4 text-[10px] md:text-[13px] font-bold uppercase tracking-wide text-error hover:bg-red-50 transition-colors flex items-center gap-3 md:gap-4">
                                  <Trash2 size={16} className="stroke-[3] md:size-18" /> Delete
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAddJobModalOpen}
        onClose={() => { setIsAddJobModalOpen(false); setPostedJobLink(null); }}
        title="Create New Job Opening"
      >
        {postedJobLink ? (
          <div className="py-10 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={32} className="stroke-[3]" />
            </div>
            <h3 className="text-2xl font-black text-primary font-headline">Job Opening Created</h3>
            <div className="space-y-4">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Job Application Link:</p>
              <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container flex items-center gap-4 overflow-hidden">
                <p className="flex-1 text-xs font-mono text-primary truncate font-bold">{postedJobLink}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(postedJobLink);
                    alert('Link Copied.');
                  }}
                  className="p-2 bg-white rounded-lg shadow-sm text-primary hover:bg-surface-container-high transition-all active:scale-90"
                >
                  <Copy size={16} className="stroke-[3]" />
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <button onClick={() => window.open(postedJobLink, '_blank')} className="flex-1 py-4 bg-white border border-surface-container-high text-primary font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-surface-container-low transition-all">Open Portal</button>
              <button
                onClick={() => {
                  const url = encodeURIComponent(postedJobLink);
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
                }}
                className="flex-1 py-4 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all"
              >
                Share on LinkedIn
              </button>
            </div>
            <button onClick={() => { setIsAddJobModalOpen(false); setPostedJobLink(null); }} className="w-full py-4 text-on-surface-variant font-bold text-xs uppercase tracking-widest hover:underline">Close</button>
          </div>
        ) : (
          <form onSubmit={handlePostJob} className="space-y-6 font-label">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Job Title</label>
                <input
                  type="text"
                  required
                  value={newJob.title}
                  onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold"
                  placeholder="e.g. Lead Software Engineer"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Department</label>
                <select
                  required
                  value={newJob.department}
                  onChange={e => setNewJob({ ...newJob, department: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Location</label>
                <select
                  required
                  value={newJob.location}
                  onChange={e => setNewJob({ ...newJob, location: e.target.value, district: '' })}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold"
                >
                  <option value="">Select City</option>
                  <option value="Mogadishu">Mogadishu</option>
                  <option value="Hargeisa">Hargeisa</option>
                  <option value="Garowe">Garowe</option>
                  <option value="Kismayo">Kismayo</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2 block">District</label>
                <select
                  required
                  disabled={!newJob.location}
                  value={newJob.district}
                  onChange={e => setNewJob({ ...newJob, district: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">{newJob.location ? 'Select District' : 'Select a city first'}</option>
                  {(DISTRICT_MAP[newJob.location] || []).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Job Type</label>
                <select
                  value={newJob.type}
                  onChange={e => setNewJob({ ...newJob, type: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Status</label>
                <select
                  value={newJob.status}
                  onChange={e => setNewJob({ ...newJob, status: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold"
                >
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Salary Range</label>
                <input
                  type="text"
                  value={newJob.salary}
                  onChange={e => setNewJob({ ...newJob, salary: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold"
                  placeholder="e.g. $2,000 - $3,500 / month"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Job Description</label>
                <textarea
                  value={newJob.description}
                  onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold h-24"
                  placeholder="Enter job details and responsibilities..."
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Requirements</label>
                <textarea
                  value={newJob.requirements}
                  onChange={e => setNewJob({ ...newJob, requirements: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold h-24"
                  placeholder="List required skills and experience..."
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsAddJobModalOpen(false)}
                className="flex-1 py-3.5 bg-surface-container text-on-surface font-black rounded-xl uppercase tracking-widest text-[11px] hover:bg-surface-container-high transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 bg-primary text-white font-black rounded-xl uppercase tracking-widest text-[11px] hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
              >
                Post Job
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmation.isOpen}
        onClose={() => setConfirmation({ isOpen: false, type: '', id: '', stage: '' })}
        title="Confirm Action"
      >
        <div className="py-6 text-center space-y-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl ${confirmation.type === 'HIRED' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}>
            {confirmation.type === 'HIRED' ? <UserCheck size={32} /> : <UserMinus size={32} />}
          </div>
          <h3 className="text-xl font-black text-primary font-headline">
            {confirmation.type === 'HIRED' ? 'Confirm Hiring?' : 'Confirm Rejection?'}
          </h3>
          <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
            {confirmation.type === 'HIRED'
              ? "Hiring this candidate will create an employee profile in the system."
              : "Marking this candidate as rejected will end their application process for this role."}
          </p>
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setConfirmation({ isOpen: false, type: '', id: '', stage: '' })}
              className="flex-1 py-4 bg-surface-container text-on-surface font-black uppercase tracking-widest text-[11px] rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => handleMoveStage(confirmation.id, confirmation.stage)}
              className={`flex-1 py-4 text-white font-black uppercase tracking-widest text-[11px] rounded-xl shadow-lg ${confirmation.type === 'HIRED' ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-red-600 shadow-red-500/20'
                }`}
            >
              Confirm Action
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Recruitment Filters">
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Pipeline Stage</label>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'APPLIED', 'REVIEWING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStage(s)}
                  className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${filterStage === s ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'border-surface-container-high hover:bg-primary/5 hover:text-primary'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setIsFilterModalOpen(false)} className="w-full py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20">Apply Filters</button>
        </div>
      </Modal>
    </>
  );
};

export default Recruitment;
