import React, { useState } from 'react';
import { X, Send, AlertCircle, FileText, Paperclip, ChevronDown } from 'lucide-react';
import { fetchWithAuth } from '../utils/api';

const ConductReportModal = ({ isOpen, onClose, employee }) => {
    const [title, setTitle] = useState('');
    const [conductType, setConductType] = useState('Warning');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [attachment, setAttachment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await fetchWithAuth('/conduct-reports', {
                method: 'POST',
                body: JSON.stringify({
                    employeeId: employee._id,
                    title,
                    conductType,
                    description,
                    priority,
                    attachment
                })
            });
            onClose();
            alert('Conduct report submitted to Admin');
        } catch (err) {
            console.error('Failed to submit conduct report', err);
            setError(err.response?.data?.message || err.message || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const conductTypes = [
        'Good Performance',
        'Warning',
        'Misconduct',
        'Absence Issue',
        'Late Attendance',
        'Other'
    ];

    const priorities = ['Low', 'Medium', 'High'];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
            
            <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-surface-container">
                <div className="p-8 border-b border-surface-container flex justify-between items-center bg-surface-container-low/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <FileText size={24} className="stroke-[2.5]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-primary font-headline tracking-tight">Conduct Report</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 mt-0.5">Submit report for {employee.firstName} {employee.lastName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-red-50 text-outline hover:text-error rounded-2xl transition-all active:scale-90">
                        <X size={20} className="stroke-[3]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 animate-shake">
                            <AlertCircle size={20} className="text-error stroke-[2.5]" />
                            <p className="text-sm font-bold text-error tracking-tight">{error}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Report Title</label>
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-6 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface placeholder:text-outline/40 focus:ring-2 focus:ring-primary/10 transition-all font-bold"
                            placeholder="Brief title of the conduct report"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Conduct Type</label>
                            <div className="relative">
                                <select
                                    value={conductType}
                                    onChange={(e) => setConductType(e.target.value)}
                                    className="w-full px-6 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface appearance-none focus:ring-2 focus:ring-primary/10 transition-all font-bold cursor-pointer"
                                >
                                    {conductTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={18} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Priority Level</label>
                            <div className="flex gap-2">
                                {priorities.map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            priority === p 
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                                            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Description</label>
                        <textarea
                            required
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-6 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface placeholder:text-outline/40 focus:ring-2 focus:ring-primary/10 transition-all font-bold resize-none"
                            placeholder="Detailed description of the conduct/issue..."
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Attachment Link (Optional)</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={attachment}
                                onChange={(e) => setAttachment(e.target.value)}
                                className="w-full px-6 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface placeholder:text-outline/40 focus:ring-2 focus:ring-primary/10 transition-all font-bold pl-14"
                                placeholder="Link to evidence or document"
                            />
                            <Paperclip className="absolute left-6 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={18} />
                        </div>
                    </div>
                </form>

                <div className="p-8 border-t border-surface-container flex gap-4 bg-surface-container-lowest">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 px-6 border border-surface-container text-on-surface-variant font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-surface-container-low transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-[2] py-4 px-6 bg-primary text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Send size={18} className="stroke-[3]" />
                                Submit Report
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConductReportModal;
