import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
import { DISTRICT_MAP } from '../utils/constants';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Globe, 
  Briefcase, 
  ChevronDown,
  Lock,
  ShieldCheck
} from 'lucide-react';

const AddEmployee = ({ isEdit = false, isHR = false }) => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
        role: 'Software Engineer',
        hub: 'Mogadishu',
        city: 'Mogadishu',
        district: '',
        hireDate: '',
        salary: '',
        employeeType: 'full_time',
        password: '',
        confirmPassword: '',
        loginRole: 'employee'
    });

    const [districtOptions, setDistrictOptions] = useState(DISTRICT_MAP['Mogadishu'] || []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const deptData = await fetchWithAuth('/departments');
                setDepartments(deptData);
                
                if (isEdit && id) {
                    const empData = await fetchWithAuth(`/employees/${id}`);
                    setFormData({
                        name: `${empData.firstName} ${empData.lastName}`,
                        email: empData.email || '',
                        phone: empData.phone || '',
                        department: empData.department?._id || empData.department || (deptData.length > 0 ? deptData[0]._id : ''),
                        role: empData.position || 'HR Manager',
                        hub: empData.hub || 'Mogadishu',
                        city: empData.city || empData.hub || 'Mogadishu',
                        district: empData.district || '',
                        hireDate: empData.hireDate ? empData.hireDate.split('T')[0] : '',
                        salary: empData.salary ? empData.salary.toString() : '',
                        employeeType: empData.employeeType || 'full_time'
                    });
                    setDistrictOptions(DISTRICT_MAP[empData.hub || empData.city] || []);
                } else if (deptData.length > 0) {
                    setFormData(prev => ({ ...prev, department: deptData[0]._id }));
                }
            } catch (error) {
                console.error(error);
            }
        };
        loadData();
    }, [isEdit, id]);

    const basePath = isHR ? '/hr' : '/admin';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!isEdit && !formData.password) {
                alert('Password is required for employee login');
                return;
            }

            if (!isEdit && formData.password !== formData.confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            const [firstName, ...lastNameArr] = formData.name.split(' ');
            const lastName = lastNameArr.join(' ') || ' ';
            const payload = {
                firstName,
                lastName,
                email: formData.email,
                phone: formData.phone,
                department: formData.department,
                position: formData.role,
                hub: formData.hub,
                city: formData.hub,   // keep city in sync with hub
                district: formData.district,
                salary: parseFloat(formData.salary.toString().replace(/,/g, '')) || 0,
                hireDate: formData.hireDate,
                status: 'active',
                employeeType: formData.employeeType,
                // Login credentials
                password: formData.password,
                loginRole: 'employee'
            };

            const endpoint = isEdit ? `/employees/${id}` : '/employees';
            const method = isEdit ? 'PUT' : 'POST';

            await fetchWithAuth(endpoint, {
                method,
                body: JSON.stringify(payload)
            });
            navigate(`${basePath}/employees`);
        } catch (error) {
            console.error('Failed to save employee', error);
            alert(error?.response?.data?.message || error?.message || 'Action failed');
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
                    <h1 className="text-[40px] leading-tight font-black text-primary font-headline tracking-tighter">
                        {isEdit ? 'Edit Employee' : 'Add New Employee'}
                    </h1>
                    <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.3em] mt-1 ml-1 opacity-60">
                        {isEdit ? `Editing Employee ID: ${id}` : 'Add employee to the system'}
                    </p>
                </div>
            </div>

            <div className="bg-surface-container-lowest rounded-[32px] shadow-2xl border border-surface-container p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-container/10 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none"></div>

                <form className="space-y-12 relative z-10" onSubmit={handleSubmit}>
                    {/* Section 1: Personal Details */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 text-primary">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <User size={24} className="stroke-[3]" />
                            </div>
                            <div>
                                <h3 className="font-black font-headline text-2xl tracking-tight">Personal Details</h3>
                                <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Basic employee information.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Full Name</label>
                                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-base font-black text-primary placeholder:text-primary/20 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm" placeholder="E.g. Ahmed Hassan Ali" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Email Address</label>
                                <input required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-base font-black text-primary placeholder:text-primary/20 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm" type="email" placeholder="ahmed.h@hayaanhir.so" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Phone Number</label>
                                <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-base font-black text-primary placeholder:text-primary/20 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm" placeholder="+252 61 XXX XXXX" />
                            </div>
                             <div className="space-y-2">
                                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">City</label>
                                <div className="relative group">
                                    <select 
                                        value={formData.hub} 
                                        onChange={e => {
                                            const newCity = e.target.value;
                                            setFormData({...formData, hub: newCity, city: newCity, district: ''});
                                            setDistrictOptions(DISTRICT_MAP[newCity] || []);
                                        }} 
                                        className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-black text-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                                    >
                                        {Object.keys(DISTRICT_MAP).map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                    <MapPin size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-primary stroke-[3] pointer-events-none group-hover:translate-y-[-2px] transition-transform" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Assigned District</label>
                                <div className="relative group">
                                    <select 
                                        required
                                        value={formData.district} 
                                        onChange={e => setFormData({...formData, district: e.target.value})} 
                                        className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-black text-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer disabled:opacity-50"
                                        disabled={!formData.hub}
                                    >
                                        <option value="" disabled>Select District</option>
                                        {districtOptions.map(dist => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>
                                    <Globe size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-primary stroke-[3] pointer-events-none group-hover:translate-y-[-2px] transition-transform" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-surface-container-high/50"></div>

                    {/* Section 3: Account Security (Only for New Employees) */}
                    {!isEdit && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-4 text-primary">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Lock size={24} className="stroke-[3]" />
                                </div>
                                <div>
                                    <h3 className="font-black font-headline text-2xl tracking-tight">Account Security</h3>
                                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Login credentials for the Employee Portal</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Portal Password</label>
                                    <input 
                                        required={!isEdit}
                                        type="password"
                                        value={formData.password} 
                                        onChange={e => setFormData({...formData, password: e.target.value})} 
                                        className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-base font-black text-primary placeholder:text-primary/20 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm" 
                                        placeholder="••••••••" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Confirm Password</label>
                                    <input 
                                        required={!isEdit}
                                        type="password"
                                        value={formData.confirmPassword} 
                                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                                        className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-base font-black text-primary placeholder:text-primary/20 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm" 
                                        placeholder="••••••••" 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 2: Employment Details */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 text-primary">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Briefcase size={24} className="stroke-[3]" />
                            </div>
                            <div>
                                <h3 className="font-black font-headline text-2xl tracking-tight">Employment Information</h3>
                                <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Department and position details</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Department</label>
                                <div className="relative group">
                                    <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-black text-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer">
                                        <option value="" disabled>Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-primary stroke-[3] pointer-events-none group-hover:translate-y-[-2px] transition-transform" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Employment Type</label>
                                <div className="relative group">
                                    <select value={formData.employeeType} onChange={e => setFormData({...formData, employeeType: e.target.value})} className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-black text-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer">
                                        <option value="full_time">Full-Time</option>
                                        <option value="contractor">Contractor</option>
                                    </select>
                                    <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-primary stroke-[3] pointer-events-none group-hover:translate-y-[-2px] transition-transform" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Position</label>
                                <div className="relative group">
                                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-sm font-black text-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer">
                                        <option value="Software Engineer">Software Engineer</option>
                                        <option value="Logistics Specialist">Logistics Specialist</option>
                                        <option value="Financial Analyst">Financial Analyst</option>
                                        <option value="Marketing Specialist">Marketing Specialist</option>
                                        <option value="Operations Coordinator">Operations Coordinator</option>
                                    </select>
                                    <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-primary stroke-[3] pointer-events-none group-hover:translate-y-[-2px] transition-transform" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Join Date</label>
                                <input required value={formData.hireDate} onChange={e => setFormData({...formData, hireDate: e.target.value})} className="w-full bg-surface-container-low border-none py-4 px-6 rounded-2xl text-base font-black text-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm" type="date" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Monthly Salary</label>
                                <div className="relative">
                                    <input required value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} type="number" className="w-full bg-surface-container-low border-none py-4 pl-12 pr-6 rounded-2xl text-base font-black text-primary placeholder:text-primary/20 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm" placeholder="4500" />
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black">$</span>
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
                            {isEdit ? 'Discard Changes' : 'Cancel'}
                        </button>
                        <button 
                            type="submit"
                            className="px-16 py-5 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 uppercase text-[11px] tracking-[0.3em] font-headline"
                        >
                            {isEdit ? 'Save Changes' : 'Add Employee'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployee;
