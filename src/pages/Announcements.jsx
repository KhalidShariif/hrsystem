import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/api';
import Modal from '../components/Modal';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Globe, 
  MapPin, 
  Building2,
  Calendar,
  Clock,
  User,
  Send
} from 'lucide-react';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetType: 'all',
    targetValue: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/announcements');
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to load announcements', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetchWithAuth('/announcements', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      setFormData({ title: '', message: '', targetType: 'all', targetValue: '' });
      loadAnnouncements();
    } catch (error) {
      alert(error?.response?.data?.message || error?.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-8 md:mb-10 px-1">
        <div>
          <h2 className="text-on-surface-variant text-[10px] md:text-sm font-semibold tracking-wide uppercase font-label">Communications</h2>
          <h1 className="text-3xl md:text-[40px] leading-tight font-extrabold text-primary tracking-tight mt-1 font-headline">System Announcements</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 group text-sm uppercase tracking-widest font-headline"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300 stroke-[3]" />
          New Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Loading Announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-[32px] p-20 text-center border border-dashed border-surface-container">
            <Megaphone size={64} className="text-outline/20 mx-auto mb-6" />
            <h3 className="text-xl font-black text-primary font-headline mb-2">No Announcements</h3>
            <p className="text-on-surface-variant font-medium">Start communicating with your team by creating the first announcement.</p>
          </div>
        ) : announcements.map((a) => (
          <div key={a._id} className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-surface-container group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                 a.targetType === 'all' ? 'bg-primary text-white' : 
                 a.targetType === 'branch' ? 'bg-emerald-500 text-white' : 
                 'bg-amber-500 text-white'
               }`}>
                 <Megaphone size={28} className="stroke-[2.5]" />
               </div>
               
               <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-surface-container-high rounded-lg text-[9px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      <Clock size={12} /> {new Date(a.createdAt).toLocaleString()}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
                      a.targetType === 'all' ? 'bg-primary/10 text-primary' :
                      a.targetType === 'branch' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {a.targetType === 'all' ? <Globe size={12} /> : a.targetType === 'branch' ? <MapPin size={12} /> : <Building2 size={12} />}
                      {a.targetType === 'all' ? 'Everyone' : a.targetValue}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-primary font-headline tracking-tighter mb-4">{a.title}</h3>
                  <p className="text-on-surface-variant text-base leading-relaxed mb-6 whitespace-pre-wrap">{a.message}</p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-surface-container-high">
                    <div className="flex items-center gap-2 text-[10px] font-black text-outline/60 uppercase tracking-widest">
                       <User size={14} /> Created by Management
                    </div>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Announcement">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Announcement Title</label>
            <input 
              required 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all" 
              placeholder="e.g. Eid Holiday Schedule"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Target Audience</label>
              <select 
                value={formData.targetType}
                onChange={e => setFormData({...formData, targetType: e.target.value, targetValue: ''})}
                className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
              >
                <option value="all">All Employees</option>
                <option value="branch">Specific Branch</option>
                <option value="department">Specific Department</option>
              </select>
            </div>
            
            {formData.targetType !== 'all' && (
              <div className="space-y-1.5 animate-in slide-in-from-right-4 duration-300">
                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Target Value</label>
                <input 
                  required 
                  value={formData.targetValue} 
                  onChange={e => setFormData({...formData, targetValue: e.target.value})}
                  className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all" 
                  placeholder={formData.targetType === 'branch' ? "e.g. Mogadishu" : "e.g. Engineering"}
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Message Content</label>
            <textarea 
              required 
              rows={5}
              value={formData.message} 
              onChange={e => setFormData({...formData, message: e.target.value})}
              className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all resize-none" 
              placeholder="Enter the full message for employees..."
            ></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-surface-container-high text-on-surface font-black uppercase tracking-widest text-[11px] rounded-xl active:scale-95 transition-all">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 py-4 bg-primary text-white font-black uppercase tracking-widest text-[11px] rounded-xl shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 font-headline"
            >
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Send size={16} className="stroke-[3]" /> Post Announcement</>}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Announcements;
