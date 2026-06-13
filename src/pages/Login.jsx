import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorMsg = params.get('error');
    if (errorMsg) {
      setError(errorMsg);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    if (result.success) {
      if (result.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.role === 'hr_manager') {
        navigate('/hr/employees');
      } else {
        navigate('/employee/dashboard');
      }
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full font-label">
      <section className="hidden lg:flex lg:w-1/2 relative architectural-gradient items-center justify-center p-20">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            className="w-full h-full object-cover mix-blend-overlay" 
            alt="monochrome architectural photograph" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAyr51pAYChBONGyl8VFu-QQHLDgSiH8hxZ_Qc18CrOWVwzWD09Dy47z60cShIVhiynH0Zv_FzCMtWKgGTj4PeokGktAB7_Qf27vvdDlo5_tVimz1XxexJhQCDKJ6MBJLvkbdKEgDgijB9XwAQKGPvCGsn_BWuWMnu3oQ-9c_fsa4AUkmxm41xp-EqcEqO0YSJWDd58qgotZ9zIgpdD7KFGstJctX6D3SKmFnp3QI6gsgoQaFA11rrm6T7KfU9iMA8wosRC9Ka8OA"
          />
        </div>
        <div className="relative z-10 max-w-lg">
          <div className="mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-container/20 text-primary-fixed-dim font-label text-xs tracking-widest uppercase mb-6">
              Established 2024
            </span>
            <h1 className="font-headline text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
              The Modern Standard in HR Management.
            </h1>
            <p className="text-primary-fixed-dim text-lg leading-relaxed font-light opacity-90">
              Elevating Human Resources from clerical tasks to modern workflows through intentional design and structural integrity.
            </p>
          </div>
          <div className="flex gap-8 items-center pt-8 border-t border-white/10">
            <div>
              <p className="text-white font-headline text-2xl font-bold">12k+</p>
              <p className="text-primary-fixed-dim text-xs uppercase tracking-widest mt-1">Employees Managed</p>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div>
              <p className="text-white font-headline text-2xl font-bold">99.9%</p>
              <p className="text-primary-fixed-dim text-xs uppercase tracking-widest mt-1">System Uptime</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full lg:w-1/2 h-screen overflow-y-auto bg-surface-container-lowest flex flex-col px-8 sm:px-16 lg:px-24 xl:px-32 py-8 sm:py-12">
        <header className="w-full shrink-0">
          <div className="text-2xl font-headline font-extrabold tracking-tight text-primary text-center lg:text-left">
            Hayaan HR
          </div>
        </header>
        
        <div className="w-full max-w-md mx-auto my-auto py-10 shrink-0">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-headline font-black text-on-surface mb-3 tracking-tighter">Sign In</h2>
            <p className="text-on-surface-variant font-medium">Access your professional workspace and manage organizational operations.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-4 animate-shake">
              <AlertCircle size={18} className="text-error stroke-[3]" />
              <p className="text-xs font-black text-error uppercase tracking-widest">{error}</p>
            </div>
          )}

          <form className="space-y-7" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1" htmlFor="email">Work Email</label>
              <div className="relative group">
                <input 
                  className="w-full px-6 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface placeholder:text-outline/40 focus:ring-2 focus:ring-primary/10 transition-all duration-300 font-bold" 
                  id="email" 
                  name="email" 
                  placeholder="name@company.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]" htmlFor="password">Password</label>
                <a className="text-[10px] font-black text-primary hover:opacity-80 transition-opacity uppercase tracking-widest" href="#">Forgot Password?</a>
              </div>
              <div className="relative group">
                <input 
                  className="w-full px-6 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface placeholder:text-outline/40 focus:ring-2 focus:ring-primary/10 transition-all duration-300 font-bold" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 bg-primary text-white rounded-2xl font-headline font-black text-base shadow-xl shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn size={20} className="stroke-[3]" />
                </>
              )}
            </button>
          </form>
          <div className="mt-12 pt-8 border-t border-surface-container flex flex-col items-center gap-6">
            <p className="text-on-surface-variant text-sm font-medium text-center">
              Need access? 
              <Link to="/signup" className="text-primary font-black ml-2 hover:underline underline-offset-4 transition-all uppercase text-[11px] tracking-widest">Register Organization</Link>
            </p>
          </div>
        </div>

        <footer className="w-full shrink-0 flex flex-col xl:flex-row justify-between items-center gap-4 mt-auto">
          <div className="text-[9px] font-black font-label uppercase tracking-[0.3em] text-outline/40 text-center xl:text-left">
            © 2024 Hayaan HR. Structural Integrity in Operations.
          </div>
          <div className="flex gap-4 sm:gap-6 font-label justify-center">
            <a className="text-[9px] font-black uppercase tracking-widest text-outline/40 hover:text-primary transition-colors" href="#">Security Policy</a>
            <a className="text-[9px] font-black uppercase tracking-widest text-outline/40 hover:text-primary transition-colors" href="#">Help Center</a>
          </div>
        </footer>
      </section>
    </main>
  );
};

export default Login;
