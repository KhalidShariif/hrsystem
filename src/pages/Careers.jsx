import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  SearchX, 
  MapPin, 
  CheckCircle2, 
  Banknote, 
  UserSquare2 
} from 'lucide-react';
import { useBranding } from '../context/BrandingContext';
import { fetchWithAuth, API_URL } from '../utils/api';

const Careers = () => {
    const { branding } = useBranding();
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        appliedRole: '',
        jobId: '',
        coverLetter: '',
        cvFile: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const loadJobs = async () => {
            try {
                const response = await fetch(`${API_URL}/jobs`);
                const data = await response.json();
                setJobs(Array.isArray(data) ? data.filter(j => j.status === 'active') : []);
            } catch (error) {
                console.error('Failed to load jobs', error);
            } finally {
                setLoading(false);
            }
        };
        loadJobs();
    }, []);

    useEffect(() => {
        const fetchJob = async () => {
            if (!jobId) return;
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/jobs/${jobId}`);
                if (!response.ok) throw new Error('Job not found');
                const data = await response.json();
                if (data.status !== 'active') throw new Error('Job closed');
                
                setSelectedJob(data);
                setFormData(prev => ({ ...prev, appliedRole: data.title, jobId: data._id }));
                setIsApplyModalOpen(true);
            } catch (error) {
                console.error('Failed to load specific job', error);
                setSelectedJob(null);
            } finally {
                setLoading(false);
            }
        };
        if (jobId) {
            fetchJob();
        }
    }, [jobId]);

    useEffect(() => {
        if (!jobId && jobs.length > 0) {
            setSelectedJob(null);
            setIsApplyModalOpen(false);
        }
    }, [jobId, jobs]);

    const handleApply = (job) => {
        setSelectedJob(job);
        setFormData({ ...formData, appliedRole: job.title, jobId: job._id });
        navigate(`/careers/apply/${job._id}`);
    };

    const handleCloseModal = () => {
        setIsApplyModalOpen(false);
        navigate('/careers');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Submission failed');
            setSuccess(true);
            setTimeout(() => {
                setIsApplyModalOpen(false);
                setSuccess(false);
                setFormData({ fullName: '', email: '', phone: '', appliedRole: '', jobId: '', coverLetter: '', cvFile: '' });
                navigate('/careers');
            }, 3000);
        } catch (error) {
            alert(error?.response?.data?.message || error?.message || 'Action failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-container-lowest font-sans selection:bg-primary/20">
            {/* Header */}
            <header className="bg-white border-b border-surface-container py-4 md:py-6 sticky top-0 z-30 px-1">
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden shrink-0">
                            {branding.logo ? (
                                <img 
                                    src={branding.logo.startsWith('http') ? branding.logo : `${API_URL.replace('/api', '')}${branding.logo}`} 
                                    alt="Logo" 
                                    className="w-full h-full object-contain p-1"
                                />
                            ) : (
                                <Rocket size={20} className="text-white md:w-6 md:h-6 stroke-[2.5]" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg md:text-xl font-black text-primary font-headline tracking-tighter leading-none truncate">Hayaan HR</h1>
                            <p className="text-[8px] md:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mt-1 truncate">Careers Portal</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16">
                <section className="text-center mb-16">
                    <h2 className="text-5xl font-black text-primary font-headline tracking-tight mb-4">Join Our Team</h2>
                    <p className="text-lg text-on-surface-variant max-w-2xl mx-auto font-medium leading-relaxed">
                        Help us build the future of Somalia's administrative infrastructure. We are looking for talented individuals to join our growing team.
                    </p>
                </section>

                <div className="space-y-4 md:space-y-6 px-1">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="bg-white p-8 md:p-12 rounded-3xl border border-surface-container text-center shadow-sm">
                            <SearchX size={32} className="md:w-8 md:h-8 text-outline/30 mx-auto mb-4" />
                            <h3 className="text-lg md:text-xl font-bold text-primary mb-2">No Open Positions</h3>
                            <p className="text-on-surface-variant text-sm px-4">All positions are currently filled. Please check back later for new opportunities.</p>
                        </div>
                    ) : (
                        jobs.map(job => (
                            <div key={job._id} className="bg-white p-6 md:p-8 rounded-3xl border border-surface-container hover:border-primary/30 transition-all group shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="space-y-3 w-full md:w-auto">
                                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                            <span className="px-2.5 py-1 bg-primary/10 text-primary text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-lg">{job.department}</span>
                                            <span className="text-[8px] md:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1">
                                                <MapPin size={10} className="md:size-12 stroke-[3]" /> {job.location}{job.district ? ` · ${job.district}` : ''}
                                            </span>
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-black text-on-surface group-hover:text-primary transition-colors font-headline leading-tight">{job.title}</h3>
                                        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[10px] md:text-xs font-bold text-on-surface-variant/70">
                                            <span>Full-time</span>
                                            <span className="w-1 h-1 rounded-full bg-surface-container shrink-0"></span>
                                            <span>Competitive Benefits</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleApply(job)}
                                        className="w-full md:w-auto px-10 py-4 bg-primary text-white font-black uppercase tracking-[0.25em] text-[10px] md:text-[11px] rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all font-headline"
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            <footer className="py-12 border-t border-surface-container bg-white">
                <div className="max-w-7xl mx-auto px-6 text-center text-[10px] font-black text-on-surface-variant/50 uppercase tracking-[0.3em]">
                    &copy; 2026 Hayaan HR · All Rights Reserved
                </div>
            </footer>

            <Modal isOpen={isApplyModalOpen} onClose={() => !submitting && handleCloseModal()} title={`Apply for ${selectedJob?.title}`}>
                {success ? (
                    <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
                            <CheckCircle2 size={36} className="stroke-[3]" />
                        </div>
                        <h3 className="text-2xl font-black text-primary font-headline">Application Submitted</h3>
                        <p className="text-on-surface-variant font-medium">Your application has been successfully submitted to our HR team.</p>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest pt-4">Status: Submitted Successfully</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Job Details Display */}
                        <div className="bg-surface-container-low p-6 rounded-3xl space-y-4 border border-surface-container">
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded">{selectedJob?.department}</span>
                                <span className="px-2 py-1 bg-secondary/10 text-secondary text-[9px] font-black uppercase tracking-widest rounded">{selectedJob?.type}</span>
                                <span className="px-2 py-1 bg-surface-container text-on-surface-variant text-[9px] font-black uppercase tracking-widest rounded">{selectedJob?.location}</span>
                            </div>
                            <h4 className="text-xl font-black text-primary font-headline leading-tight">{selectedJob?.title}</h4>
                            {selectedJob?.salary && (
                                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 uppercase tracking-widest">
                                    <Banknote size={14} className="stroke-[3]" /> {selectedJob.salary}
                                </p>
                            )}
                            <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
                                {selectedJob?.description && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">Job Description</p>
                                        <p className="font-medium">{selectedJob.description}</p>
                                    </div>
                                )}
                                {selectedJob?.requirements && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">Requirements</p>
                                        <p className="font-medium italic">{selectedJob.requirements}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="h-[1px] bg-surface-container mx-4"></div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Full Name</label>
                            <input 
                                required 
                                type="text" 
                                value={formData.fullName}
                                onChange={e => setFormData({...formData, fullName: e.target.value})}
                                className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all" 
                                placeholder="Enter your full legal name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Email Address</label>
                                <input 
                                    required 
                                    type="email" 
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all" 
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Phone Number</label>
                                <input 
                                    required 
                                    type="tel" 
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all" 
                                    placeholder="+252 ..."
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Cover Letter</label>
                            <textarea 
                                value={formData.coverLetter}
                                onChange={e => setFormData({...formData, coverLetter: e.target.value})}
                                className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all h-32" 
                                placeholder="Describe why you are a good fit..."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">CV / Resume Link (URL)</label>
                            <input 
                                required 
                                type="url" 
                                value={formData.cvFile}
                                onChange={e => setFormData({...formData, cvFile: e.target.value})}
                                className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all" 
                                placeholder="https://drive.google.com/..."
                            />
                        </div>
                        <button 
                            disabled={submitting}
                            type="submit" 
                            className="w-full py-5 bg-primary text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all font-headline text-xs disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                        </form>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Careers;
