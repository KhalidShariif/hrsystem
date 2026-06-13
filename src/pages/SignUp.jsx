import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, UserPlus } from 'lucide-react';

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await register({ firstName, lastName, email, password });
    
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full">
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
              Join Us
            </span>
            <h1 className="font-headline text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Build the Future of HR.
            </h1>
            <p className="text-primary-fixed-dim text-lg leading-relaxed font-light opacity-90">
              Create an account to begin managing your employees with intentional design and structural integrity.
            </p>
          </div>
          <div className="flex gap-8 items-center pt-8 border-t border-white/10">
            <div>
              <p className="text-white font-headline text-2xl font-bold">500+</p>
              <p className="text-primary-fixed-dim text-xs uppercase tracking-widest mt-1">Organizations</p>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div>
              <p className="text-white font-headline text-2xl font-bold">100%</p>
              <p className="text-primary-fixed-dim text-xs uppercase tracking-widest mt-1">Compliant</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full lg:w-1/2 bg-surface-container-lowest flex flex-col justify-center items-center px-8 sm:px-16 lg:px-24 xl:px-32 relative">
        <header className="absolute top-12 left-8 sm:left-16 lg:left-24">
          <div className="text-2xl font-headline font-extrabold tracking-tight text-primary">
            Hayaan HR
          </div>
        </header>
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-headline font-bold text-on-surface mb-3 tracking-tight">Create Account</h2>
            <p className="text-on-surface-variant font-body">Get started with your Hayaan HR account.</p>
          </div>
          
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-4 animate-shake">
              <AlertCircle size={18} className="text-error stroke-[3]" />
              <p className="text-xs font-black text-error uppercase tracking-widest">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-label font-semibold text-on-surface-variant uppercase tracking-widest mb-2 ml-1" htmlFor="firstname">First Name</label>
                <input 
                  className="w-full px-5 py-4 bg-surface-container-low border-none rounded-xl text-on-surface focus:ring-0 focus:bg-white transition-all duration-300" 
                  id="firstname" 
                  placeholder="Ahmed"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-label font-semibold text-on-surface-variant uppercase tracking-widest mb-2 ml-1" htmlFor="lastname">Last Name</label>
                <input 
                  className="w-full px-5 py-4 bg-surface-container-low border-none rounded-xl text-on-surface focus:ring-0 focus:bg-white transition-all duration-300" 
                  id="lastname" 
                  placeholder="Hassan"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-label font-semibold text-on-surface-variant uppercase tracking-widest mb-2 ml-1" htmlFor="email">Work Email</label>
              <input 
                className="w-full px-5 py-4 bg-surface-container-low border-none rounded-xl text-on-surface focus:ring-0 focus:bg-white transition-all duration-300" 
                id="email" 
                type="email"
                placeholder="ahmed.hassan@hayaan.so"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-label font-semibold text-on-surface-variant uppercase tracking-widest mb-2 ml-1" htmlFor="password">Password</label>
              <input 
                className="w-full px-5 py-4 bg-surface-container-low border-none rounded-xl text-on-surface focus:ring-0 focus:bg-white transition-all duration-300" 
                id="password" 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 bg-primary text-white rounded-xl font-headline font-bold text-lg shadow-sm hover:shadow-xl hover:opacity-90 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 mt-4 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <UserPlus size={20} className="stroke-[3]" />
                </>
              )}
            </button>
          </form>
          <div className="mt-8 pt-8 border-t border-surface-container flex flex-col items-center gap-6">
            <p className="text-on-surface-variant text-sm">
              Already have an account? 
              <Link to="/login" className="text-primary font-black ml-1 hover:underline underline-offset-4 transition-all">Sign In</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SignUp;
