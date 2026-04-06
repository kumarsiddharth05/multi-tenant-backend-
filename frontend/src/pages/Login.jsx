import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Login failed');
      }

      login(data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:24px_24px]">
      
      {/* Wavy Liquid Background Graphic */}
      <div className="absolute bottom-[-2px] left-0 w-full leading-[0] z-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[100px] md:h-[200px] xl:h-[300px]">
           <path 
             d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,111.47,192.39,84.18Z" 
             fill="#4285F4" 
             stroke="black"
             strokeWidth="3"
           ></path>
        </svg>
      </div>

      {/* Decorative Google-Brutalism Floating Elements */}
      <div className="absolute top-[2%] -left-6 w-24 h-24 sm:top-[10%] sm:left-[10%] sm:w-32 sm:h-32 bg-[#FBBC05] border-[2px] border-slate-800 rounded-full shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] sm:shadow-[6px_6px_0px_0px_rgba(30,41,59,1)] z-0 transition-transform hover:scale-110"></div>
      
      <div className="absolute bottom-[5%] -right-4 w-16 h-16 sm:bottom-[15%] sm:right-[15%] sm:w-24 sm:h-24 bg-[#4285F4] border-[2px] border-slate-800 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] sm:shadow-[6px_6px_0px_0px_rgba(30,41,59,1)] rotate-12 z-0 transition-transform hover:rotate-45"></div>
      
      <div className="absolute top-[18%] -right-2 sm:top-[25%] sm:right-[25%] px-4 py-1 sm:px-6 sm:py-2 bg-[#EA4335] border-[2px] border-slate-800 shadow-[3px_3px_0px_0px_rgba(30,41,59,1)] sm:shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] rounded-full -rotate-6 z-0 transition-transform hover:-rotate-12">
        <span className="text-white font-black tracking-widest uppercase text-xs sm:text-base">Admin</span>
      </div>

      <div
        className="w-full max-w-[400px] bg-white border-[3px] border-slate-800 rounded-[32px] p-6 sm:p-10 pt-8 sm:pt-10 pb-8 sm:pb-10 relative z-10 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1"
        style={{ boxShadow: '4px 4px 0px #4285F4, 8px 8px 0px #EA4335, 12px 12px 0px #FBBC05, 16px 16px 0px #34A853' }}
      >

        {/* 4 dot row */}
        <div className="flex gap-2 mb-6 mt-4">
          <div className="w-3.5 h-3.5 rounded-full bg-[#4285F4] border-[2px] border-slate-800 shadow-[1px_1px_0px_0px_rgba(30,41,59,1)]"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#EA4335] border-[2px] border-slate-800 shadow-[1px_1px_0px_0px_rgba(30,41,59,1)]"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#FBBC05] border-[2px] border-slate-800 shadow-[1px_1px_0px_0px_rgba(30,41,59,1)]"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#34A853] border-[2px] border-slate-800 shadow-[1px_1px_0px_0px_rgba(30,41,59,1)]"></div>
        </div>

        <h2 className="text-4xl font-black text-left mb-1 tracking-widest uppercase">LOGIN</h2>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Owner Dashboard</p>
        
        {error && (
          <div className="bg-[#EA4335] text-white border-[2px] border-slate-800 font-bold p-3 text-sm mb-6 text-center shadow-[3px_3px_0px_0px_rgba(30,41,59,1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="text-left">
            <label className="block text-[11px] font-black mb-2 tracking-widest uppercase text-slate-700">Phone Number</label>
            <input 
              id="phone-input"
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#F8F9FA] text-black border-[3px] border-slate-800 rounded-2xl px-5 py-3.5 font-bold text-base focus:outline-none transition-all duration-200 placeholder-gray-300 focus:bg-white focus:-translate-y-1 focus:shadow-[4px_4px_0px_0px_#4285F4] focus:border-[#4285F4]"
              placeholder="10-digit number"
              required
            />
          </div>
          <div className="text-left">
            <label className="block text-[11px] font-black mb-2 tracking-widest uppercase text-slate-700">Password</label>
            <input 
              id="password-input"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F8F9FA] text-black border-[3px] border-slate-800 rounded-2xl px-5 py-3.5 font-bold text-base focus:outline-none transition-all duration-200 placeholder-gray-300 focus:bg-white focus:-translate-y-1 focus:shadow-[4px_4px_0px_0px_#EA4335] focus:border-[#EA4335]"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="pt-5">
            <button 
              id="login-button"
              type="submit"
              className="w-full py-4 px-8 bg-black text-white border-[3px] border-slate-800 rounded-full font-black text-base tracking-widest uppercase shadow-[6px_6px_0px_0px_#34A853] transition-all duration-150 hover:-translate-y-1 hover:-translate-x-0.5 hover:shadow-[10px_10px_0px_0px_#34A853] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none active:bg-[#34A853] flex items-center justify-center gap-3 group"
            >
              <span>Sign In</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
