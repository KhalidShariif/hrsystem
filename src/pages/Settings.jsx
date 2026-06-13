import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { fetchWithAuth, API_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Settings2, 
  Palette, 
  UserPlus, 
  Shield, 
  Upload, 
  Users, 
  CheckCircle2, 
  XCircle, 
  FileUp 
} from 'lucide-react';
import { useBranding } from '../context/BrandingContext';

const Settings = ({ isHR = false }) => {
    const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedManager, setSelectedManager] = useState(null);
    const [hrManagers, setHrManagers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const { branding: globalBranding, updateBranding: saveBranding } = useBranding();
    const [localBranding, setLocalBranding] = useState({ logo: null, primaryColor: '#00236F' });
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const { refreshUser } = useAuth();

    useEffect(() => {
        if (globalBranding) {
            setLocalBranding({
                logo: globalBranding.logo,
                primaryColor: globalBranding.primaryColor || '#00236F'
            });
            if (globalBranding.logo) {
                setLogoPreview(globalBranding.logo.startsWith('http') ? globalBranding.logo : `${API_URL.replace('/api', '')}${globalBranding.logo}`);
            }
        }
    }, [globalBranding]);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            alert('Please select an image file (PNG, JPG, SVG)');
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            alert('File is too large. Max 20MB allowed.');
            return;
        }

        setLogoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveBranding = async () => {
        try {
            setIsSaving(true);
            const formData = new FormData();
            formData.append('primaryColor', localBranding.primaryColor);
            if (logoFile) {
                formData.append('logo', logoFile);
            }

            await saveBranding(formData);
            alert('Branding updated successfully');
            setLogoFile(null);
        } catch (error) {
            console.error('Failed to save branding', error);
            alert(error?.response?.data?.message || error?.message || 'Action failed');
        } finally {
            setIsSaving(false);
        }
    };

    const isBrandingChanged = 
        localBranding.primaryColor !== globalBranding?.primaryColor || 
        logoFile !== null;

    const [formData, setFormData] = useState({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        password: '', 
        phone: '',
        role: 'hr_manager',
        region: 'Mogadishu',
        status: 'active'
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [managersData, meData] = await Promise.all([
                fetchWithAuth('/hr-managers?role=hr_manager').catch(() => []),
                fetchWithAuth('/auth/me').catch(() => null)
            ]);
            
            const managersList = Array.isArray(managersData) ? managersData : [];
            setHrManagers(managersList);
            setCurrentUser(meData);

            if (managersList.length === 0 && meData && meData.role === 'hr_manager') {
                setHrManagers([meData]);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleEditClick = (manager) => {
        setSelectedManager(manager);
        setFormData({
            firstName: manager.firstName,
            lastName: manager.lastName,
            email: manager.email,
            password: '', 
            phone: manager.phone || '',
            role: manager.role,
            region: manager.region || 'Mogadishu',
            status: manager.status
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updateData = { ...formData };
            if (!updateData.password) delete updateData.password;
            
            await fetchWithAuth(`/hr-managers/${selectedManager._id}`, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
            setIsEditModalOpen(false);
            loadData();
        } catch (error) {
            console.error('Failed to update manager', error);
            alert(error?.response?.data?.message || error?.message || 'Action failed');
        }
    };

    const handleInitialize = async (e) => {
        e.preventDefault();
        try {
            await fetchWithAuth('/hr-managers', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            setIsAddRoleModalOpen(false);
            setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'hr_manager', region: 'Mogadishu', status: 'active' });
            loadData();
        } catch (error) {
            console.error('Failed to initialize role', error);
            alert(error?.response?.data?.message || error?.message || 'Action failed');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (!file.type.match('image.*')) {
            alert('Please select an image file (PNG, JPG, JPEG)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('File is too large. Max 5MB allowed.');
            return;
        }

        const uploadFormData = new FormData();
        uploadFormData.append('profileImage', file);

        try {
            setUploading(true);
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const response = await fetch(`${API_URL}/hr-managers/me/profile-image`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadFormData
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Profile image upload successful:', data);
                
                // Update the global auth state and local storage
                if (data.user) {
                    refreshUser();
                    alert('Profile image updated successfully');
                }
                await loadData();
            } else {
                let errorMessage = 'Upload failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Detailed upload error:', error);
            alert(`Upload error: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const activeCount = hrManagers.filter(m => m.status === 'active').length;
    const inactiveCount = hrManagers.filter(m => m.status !== 'active').length;

    return (
        <>
            <header className="mb-8 md:mb-10 text-left no-print px-1">
                <h2 className="text-3xl md:text-[40px] leading-tight font-black text-primary font-headline tracking-tight px-1">Settings</h2>
                <p className="text-[10px] md:text-xs text-on-surface-variant font-bold uppercase tracking-widest opacity-70 mt-1 px-1">System Architecture & Branding</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pb-20 no-print px-1">
                <nav className="col-span-1 lg:col-span-3 sticky top-0 z-30 bg-surface-container-lowest/80 backdrop-blur-lg lg:bg-transparent lg:backdrop-blur-none py-2 lg:py-0 border-b lg:border-none border-surface-container">
                    <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar snap-x px-1">
                        <a className="flex items-center gap-3 md:gap-4 px-5 md:px-6 py-3.5 md:py-4 bg-primary text-white shadow-lg shadow-primary/20 rounded-2xl font-black transition-all transform active:scale-95 shrink-0 snap-start" href="#roles">
                            <Settings2 size={18} className="stroke-[3] md:size-7" />
                            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">Access</span>
                        </a>
                        {!isHR && (
                            <>
                                <a className="flex items-center gap-3 md:gap-4 px-5 md:px-6 py-3.5 md:py-4 bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low rounded-2xl text-on-surface-variant font-black transition-all group active:scale-95 shrink-0 snap-start" href="#security">
                                    <Shield size={18} className="group-hover:text-primary transition-colors stroke-[2.5] md:size-7" />
                                    <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">Security</span>
                                </a>
                                <a className="flex items-center gap-3 md:gap-4 px-5 md:px-6 py-3.5 md:py-4 bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low rounded-2xl text-on-surface-variant font-black transition-all group active:scale-95 shrink-0 snap-start" href="#branding">
                                    <Palette size={18} className="group-hover:text-primary transition-colors stroke-[2.5] md:size-7" />
                                    <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">Branding</span>
                                </a>
                            </>
                        )}
                    </div>
                </nav>

                <div className="col-span-1 lg:col-span-9 space-y-6 md:space-y-10 px-1 mt-4 lg:mt-0">
                    {/* Status Toggle for HR */}
                    {isHR && currentUser && (
                        <section className="bg-surface-container-lowest rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm border border-surface-container flex flex-col sm:flex-row justify-between items-start sm:items-center overflow-hidden relative group gap-6 mx-1">
                            <div className="relative z-10 px-1">
                                <h3 className="text-xl font-black font-headline text-primary tracking-tight">Availability Status</h3>
                                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">Update your system visibility.</p>
                            </div>
                            <div className="flex items-center gap-6 relative z-10 w-full sm:w-auto justify-between sm:justify-end px-1">
                                <div className="text-left sm:text-right">
                                    <p className={`text-sm font-black uppercase tracking-widest ${currentUser.status === 'active' ? 'text-emerald-600' : 'text-error'}`}>
                                        {currentUser.status === 'active' ? 'Available' : 'Away'}
                                    </p>
                                    <p className="text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-tighter">Current State</p>
                                </div>
                                <button 
                                    onClick={async () => {
                                        try {
                                            const newStatus = currentUser.status === 'active' ? 'inactive' : 'active';
                                            await fetchWithAuth(`/hr-managers/${currentUser._id}`, {
                                                method: 'PUT',
                                                body: JSON.stringify({ status: newStatus })
                                            });
                                            await loadData();
                                            refreshUser();
                                        } catch (err) {
                                            alert('Failed to update status');
                                        }
                                    }}
                                    className={`w-14 h-7 md:w-16 md:h-8 rounded-full relative transition-all duration-500 shrink-0 ${currentUser.status === 'active' ? 'bg-emerald-500' : 'bg-surface-container-high'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transition-all duration-500 ${currentUser.status === 'active' ? 'left-8 md:left-9' : 'left-1'}`}></div>
                                </button>
                            </div>
                            <div className={`absolute right-0 top-0 w-32 h-32 blur-3xl opacity-10 rounded-full -mr-16 -mt-16 transition-colors duration-1000 ${currentUser.status === 'active' ? 'bg-emerald-500' : 'bg-error'}`}></div>
                        </section>
                    )}

                    <section className="bg-surface-container-lowest rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-sm border border-surface-container mx-1" id="roles">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 md:mb-10 gap-6 px-1">
                            <div>
                                <h3 className="text-xl md:text-2xl font-black font-headline text-primary tracking-tight">Access Control</h3>
                                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">Manage permissions for HR.</p>
                            </div>
                            {!isHR && (
                                <button 
                                    onClick={() => { setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'hr_manager', region: 'Mogadishu', status: 'active' }); setIsAddRoleModalOpen(true); }}
                                    className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-xl text-[11px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 font-headline"
                                >
                                    <UserPlus size={18} className="stroke-[3]" />
                                    <span className="whitespace-nowrap">Add Manager</span>
                                </button>
                            )}
                        </div>
                        
                        {loading ? (
                            <div className="py-10 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                        ) : hrManagers.length === 0 ? (
                            <div className="py-10 text-center text-on-surface-variant font-bold uppercase tracking-widest text-[10px] border-2 border-dashed border-surface-container rounded-2xl opacity-50 italic">No managers found</div>
                        ) : (
                            <div className={`grid grid-cols-1 ${isHR ? 'md:grid-cols-1' : 'md:grid-cols-1 xl:grid-cols-2'} gap-4 md:gap-6`}>
                                {(isHR ? hrManagers.filter(m => m._id === currentUser?._id) : hrManagers).map((manager) => (
                                    <div key={manager._id} className="p-6 md:p-8 rounded-2xl bg-surface-container-low/40 border-2 border-transparent hover:border-primary/20 transition-all group hover:bg-white hover:shadow-lg">
                                        <div className="flex items-center justify-between mb-6 md:mb-8">
                                            <div className={`w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500`}>
                                                <ShieldCheck size={24} className="md:w-[38px] md:h-[38px] stroke-[2.5]" />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {currentUser?._id === manager._id && (
                                                    <span className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">You</span>
                                                )}
                                                <button 
                                                    onClick={() => handleEditClick(manager)}
                                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline px-2 py-1 bg-primary/5 rounded-lg transition-colors"
                                                >
                                                    Settings
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="text-base md:text-xl font-black text-on-surface mb-1 font-headline truncate">{manager.firstName} {manager.lastName}</h4>
                                        <p className="text-[11px] md:text-sm font-medium text-on-surface-variant/70 mb-6 truncate">{manager.email}</p>
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            <span className="px-2.5 py-1 bg-surface-container-high text-on-surface-variant text-[8px] font-black uppercase rounded-lg tracking-widest">{manager.region || 'HQ'}</span>
                                            <span className={`px-2.5 py-1 ${manager.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-error'} text-[8px] font-black uppercase rounded-lg tracking-widest`}>{manager.status || 'Active'}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex -space-x-3">
                                                {manager.profileImage ? (
                                                    <img 
                                                        src={manager.profileImage.startsWith('http') ? manager.profileImage : `http://localhost:5000${manager.profileImage}`} 
                                                        alt="Profile" 
                                                        className="h-10 w-10 md:h-12 md:w-12 rounded-full ring-2 ring-white object-cover shadow-sm shrink-0"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full ring-2 ring-white bg-primary text-white flex items-center justify-center text-[10px] font-bold shadow-sm shrink-0 uppercase">
                                                        {manager.firstName?.charAt(0)}{manager.lastName?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex items-center justify-between min-w-0">
                                                <span className="text-[9px] md:text-[10px] font-black text-on-surface-variant uppercase tracking-widest truncate">Since {manager.createdAt ? new Date(manager.createdAt).toLocaleDateString() : 'N/A'}</span>
                                                {currentUser?._id === manager._id && (
                                                    <div className="relative shrink-0">
                                                        <input 
                                                            type="file" 
                                                            id="profile-upload" 
                                                            className="hidden" 
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            disabled={uploading}
                                                        />
                                                        <label 
                                                            htmlFor="profile-upload" 
                                                            className={`flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${uploading ? 'text-outline/50 cursor-wait' : 'text-primary hover:bg-primary/5 cursor-pointer active:scale-95'}`}
                                                        >
                                                            {uploading ? (
                                                                <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                                                            ) : (
                                                                <Upload size={14} className="stroke-[3]" />
                                                            )}
                                                            {uploading ? 'Wait' : 'Photo'}
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {!isHR && (
                        <>
                            <section className="bg-surface-container-lowest rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-sm border border-surface-container mx-1" id="security">
                                <div className="mb-8 md:mb-10 text-left px-1">
                                    <h3 className="text-xl md:text-2xl font-black font-headline text-primary tracking-tight">Security</h3>
                                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">Personnel data safeguards.</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 px-1">
                                    {[
                                        { label: 'Total HR', val: hrManagers.length, icon: <Users size={24} className="md:w-6 md:h-6 stroke-[2.5]" /> },
                                        { label: 'Active', val: activeCount, icon: <CheckCircle2 size={24} className="md:w-6 md:h-6 stroke-[2.5]" /> },
                                        { label: 'Away', val: inactiveCount, icon: <XCircle size={24} className="md:w-6 md:h-6 stroke-[2.5]" /> }
                                    ].map((stat, i) => (
                                        <div key={i} className="flex flex-col items-center p-6 md:p-8 bg-surface-container-low/40 rounded-2xl border border-surface-container hover:bg-white transition-all group">
                                            <div className="text-primary mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
                                            <p className="text-[9px] md:text-[10px] font-black text-on-surface-variant uppercase tracking-widest font-label opacity-50">{stat.label}</p>
                                            <p className="text-2xl md:text-3xl font-black text-primary font-headline mt-1">{stat.val}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                    <section className="bg-surface-container-lowest rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-sm border border-surface-container mx-1" id="branding">
                        <div className="mb-8 md:mb-10 text-left px-1">
                            <h3 className="text-xl md:text-2xl font-black font-headline text-primary tracking-tight">Branding</h3>
                            <p className="text-[10px] md:text-xs text-on-surface-variant font-bold uppercase tracking-widest opacity-60 mt-1">Identity & Colors</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 px-1">
                            <div className="space-y-4">
                                <label className="text-[10px] md:text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] block font-label ml-1 opacity-50">Workspace Logo</label>
                                <div 
                                    onClick={() => document.getElementById('logo-upload').click()}
                                    className="border-4 border-dashed border-primary/10 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center bg-surface-container-low h-48 md:h-64 hover:bg-white hover:border-primary/30 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    <input 
                                        type="file" 
                                        id="logo-upload" 
                                        className="hidden" 
                                        accept=".png,.jpg,.jpeg,.svg"
                                        onChange={handleLogoChange}
                                    />
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-2 md:p-4 relative z-10" />
                                    ) : (
                                        <>
                                            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                                <FileUp size={32} className="md:w-8 md:h-8 text-primary stroke-[2.5]" />
                                            </div>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Select Image</p>
                                            <p className="text-[9px] text-on-surface-variant/60 font-bold mt-1 uppercase">PNG, SVG or JPG</p>
                                        </>
                                    )}
                                    {logoPreview && (
                                        <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
                                            <p className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Change Logo</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col justify-end space-y-6 md:space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] md:text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] block font-label ml-1 opacity-50">Accent Color</label>
                                    <div className="flex items-center gap-5 bg-surface-container-low p-5 rounded-2xl border border-surface-container shadow-inner">
                                        <div 
                                            className="w-14 h-14 md:w-16 md:h-16 rounded-xl shadow-xl ring-4 ring-white cursor-pointer relative overflow-hidden shrink-0" 
                                            style={{ backgroundColor: localBranding.primaryColor }}
                                        >
                                            <input 
                                                type="color" 
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150" 
                                                value={localBranding.primaryColor}
                                                onChange={e => setLocalBranding({...localBranding, primaryColor: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-50">Hex Code</p>
                                            <input 
                                                className="w-full bg-transparent border-none p-0 text-xl md:text-2xl font-black text-primary font-mono focus:ring-0 uppercase tracking-tighter" 
                                                type="text" 
                                                value={localBranding.primaryColor}
                                                onChange={e => setLocalBranding({...localBranding, primaryColor: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 md:gap-6 pt-6 md:pt-10 px-1">
                                <button 
                                    onClick={() => {
                                        if (window.confirm('Discard changes? Unsaved branding changes will be lost.')) {
                                            setLocalBranding({
                                                logo: globalBranding.logo,
                                                primaryColor: globalBranding.primaryColor || '#00236F'
                                            });
                                            setLogoPreview(globalBranding.logo ? (globalBranding.logo.startsWith('http') ? globalBranding.logo : `${API_URL.replace('/api', '')}${globalBranding.logo}`) : null);
                                            setLogoFile(null);
                                        }
                                    }}
                                    className="w-full sm:w-auto px-10 py-5 rounded-2xl text-[11px] font-black text-on-surface-variant uppercase tracking-widest hover:bg-surface-container-high transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button 
                                    disabled={!isBrandingChanged || isSaving}
                                    onClick={handleSaveBranding}
                                    className={`w-full sm:w-auto px-12 py-5 ${isBrandingChanged ? 'bg-primary text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50' : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'} rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] transition-all active:scale-95 font-headline flex items-center justify-center gap-3`}
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        'Save Branding'
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Modal isOpen={isAddRoleModalOpen} onClose={() => setIsAddRoleModalOpen(false)} title="Add HR Manager">
                 <form className="space-y-6" onSubmit={handleInitialize}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">First Name</label>
                            <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-surface-container-low border-none py-3.5 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all" placeholder="Ahmed" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Last Name</label>
                            <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-surface-container-low border-none py-3.5 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all" placeholder="Ali" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Email</label>
                        <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-surface-container-low border-none py-3.5 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all" placeholder="ahmed.ali@hr.so" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Password</label>
                        <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-surface-container-low border-none py-3.5 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all" placeholder="••••••••" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Branch</label>
                            <select value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full bg-surface-container-low border-none py-3.5 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all">
                                <option value="Mogadishu">Mogadishu</option>
                                <option value="Hargeisa">Hargeisa</option>
                                <option value="Garowe">Garowe</option>
                                <option value="Kismayo">Kismayo</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Initial Status</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-surface-container-low border-none py-3.5 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="w-full py-5 bg-primary text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all font-headline text-xs mt-4">Add Manager</button>
                 </form>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Permissions">
                 <form className="space-y-6" onSubmit={handleUpdate}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Branch</label>
                            <select value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full bg-surface-container-low border-none py-3.5 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all">
                                <option value="Mogadishu">Mogadishu</option>
                                <option value="Hargeisa">Hargeisa</option>
                                <option value="Garowe">Garowe</option>
                                <option value="Kismayo">Kismayo</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Status</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-surface-container-low border-none py-3.5 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Update Password (Leave blank to keep current)</label>
                        <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-surface-container-low border-none py-3.5 px-6 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all" placeholder="••••••••" />
                    </div>
                    <button type="submit" className="w-full py-5 bg-primary text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all font-headline text-xs mt-4">Save Changes</button>
                 </form>
            </Modal>
        </>
    );
};

export default Settings;
