import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
import { 
  ArrowLeft, 
  History, 
  ChevronDown, 
  FileText 
} from 'lucide-react';

const PostJob = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        location: 'Mogadishu',
        type: 'Full-time',
        description: '',
        experience: '',
        salary: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetchWithAuth('/jobs', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            navigate('/admin/recruitment');
        } catch (error) {
            console.error('Failed to post job', error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center gap-6 mb-10">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white shadow-md border border-surface-container hover:bg-primary hover:text-white transition-all text-primary group active:scale-90"
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform stroke-[3]" />
                </button>
                <div>
                    <h1 className="text-[40px] leading-tight font-black text-primary font-headline tracking-tighter">Post Job Opening</h1>
                    <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.3em] mt-1 ml-1 opacity-60">Recruitment Management</p>
                </div>
            </div>

            <div className="bg-surface-container-lowest rounded-[32px] shadow-2xl border border-surface-container p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
                
                <form className="space-y-12 relative z-10" onSubmit={handleSubmit}>
                    {/* Section 1: Specifications */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 text-primary">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <History size={24} className="stroke-[3]" />
                            </div>
                            <div>
                                <h3 className="font-black font-headline text-2xl tracking-tight">Job Details</h3>
                                <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Role details and requirements</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Job Title</label>
                                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-base font-black text-primary placeholder:text-primary/20 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm" placeholder="E.g. Senior Software Engineer" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Branch</label>
                                <div className="relative group">
                                    <select value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-black text-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer">
                                        <option>Mogadishu</option>
                                        <option>Hargeisa</option>
                                        <option>Garowe</option>
                                        <option>Remote</option>
                                    </select>
                                    <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-primary stroke-[3] pointer-events-none group-hover:translate-y-[-2px] transition-transform" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Employment Type</label>
                                <div className="relative group">
                                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-black text-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer">
                                        <option>Full-time</option>
                                        <option>Contract</option>
                                        <option>Consultancy</option>
                                        <option>Internship</option>
                                    </select>
                                    <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-primary stroke-[3] pointer-events-none group-hover:translate-y-[-2px] transition-transform" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-surface-container-high/50"></div>

                    {/* Section 2: Narrative & Experience */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 text-primary">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <FileText size={24} className="stroke-[3]" />
                            </div>
                            <div>
                                <h3 className="font-black font-headline text-2xl tracking-tight">Job Description</h3>
                                <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Role overview and experience requirements.</p>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Description</label>
                                <textarea 
                                    required
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                    className="w-full bg-surface-container-low border-none py-5 px-6 rounded-3xl text-sm font-bold text-primary placeholder:text-primary/20 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm min-h-[180px] leading-relaxed" 
                                    placeholder="Describe the responsibilities and requirements for this role..."
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Minimum Experience</label>
                                    <div className="relative">
                                        <input required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-base font-black text-primary placeholder:text-primary/20 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm" placeholder="E.g. 5" type="number" />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-primary/40">Years</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Salary</label>
                                    <div className="relative">
                                        <input required value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-base font-black text-primary placeholder:text-primary/20 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm pl-12" placeholder="8,000.00" />
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black">$</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-6 pt-10 border-t border-surface-container-high/50">
                        <button 
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-10 py-5 bg-surface-container-high text-on-surface font-black rounded-2xl transition-all hover:bg-surface-container-highest uppercase text-[11px] tracking-widest"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-16 py-5 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 uppercase text-[11px] tracking-[0.3em] font-headline"
                        >
                            Post Job
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostJob;
