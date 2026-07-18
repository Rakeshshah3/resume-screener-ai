import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function AuthGateway({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // Tracks registration success view

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidate'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccessMessage(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'candidate'
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isLogin) {
      if (formData.name.trim().length < 3) {
        setError("Name must be at least 3 characters long.");
        return;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const params = new URLSearchParams();
        params.append('username', formData.email);
        params.append('password', formData.password);

        const response = await axios.post(`${API_URL}/auth/login`, params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        let access_token = null;
        if (response.data) {
          access_token = response.data.access_token || response.data.token || (typeof response.data === 'string' ? response.data : null);
        }
        
        if (access_token) {
          localStorage.setItem('token', access_token);
          onAuthSuccess();
        } else {
          setError("Authorized successfully, but client-side token mapping failed.");
        }
      } else {
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        };

        await axios.post(`${API_URL}/auth/signup`, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // 🚀 INLINE SUCCESS TRIGGER: Replaces alert popups with a clean card view state
        setSuccessMessage("Account created successfully!");
        setFormData({ name: '', email: payload.email, password: '', confirmPassword: '', role: 'candidate' });
      }
    } catch (err) {
      console.error("Authentication error:", err.response || err);
      
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          const mainErr = err.response.data.detail[0];
          setError(`Validation Error: ${mainErr.msg}`);
        } else {
          setError(err.response.data.detail);
        }
      } else if (err.response?.status === 404) {
        setError("Account does not exist.");
      } else if (err.response?.status === 401) {
        setError("Invalid credentials.");
      } else if (err.response?.status === 409) {
        setError("Email is already registered.");
      } else {
        setError(`Server connection failure: ${err.message || "Connection dropped."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060D1A] flex flex-col md:flex-row font-sans antialiased selection:bg-blue-600/30 selection:text-white relative overflow-hidden">
      
      {/* Background Vector Layout */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none z-0 mix-blend-screen" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0,20 Q50,5 100,20 T100,80 Q50,95 0,80 Z" fill="none" stroke="white" strokeWidth="0.15" />
        <path d="M0,35 Q50,10 100,35" fill="none" stroke="white" strokeWidth="0.08" />
        <path d="M0,65 Q50,90 100,65" fill="none" stroke="white" strokeWidth="0.08" />
      </svg>

      {/* Left Column: Branding Section */}
      <div className="flex-1 bg-[#060D1A]/40 bg-radial-[at_top_right,_var(--tw-gradient-stops)] from-[#0F2447]/50 via-transparent to-transparent flex flex-col justify-center items-start p-12 lg:p-24 relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800/40 z-10">
        <div className="space-y-4 max-w-sm">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase leading-tight">
            SECURE<br />ACCESS
          </h1>
          <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
          <p className="text-xs text-slate-400 font-medium leading-relaxed pt-2 tracking-wide">
            Integrated talent processing dashboard client. Authenticate credentials to manage live candidate pipelines.
          </p>
        </div>
      </div>

      {/* Right Column: Dynamic Form Workspace */}
      <div className="flex-1 bg-[#060D1A]/20 bg-radial-[at_bottom_left,_var(--tw-gradient-stops)] from-[#0F2447]/30 via-transparent to-transparent flex items-center justify-center p-6 md:p-12 lg:p-16 z-10">
        <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-[0_30px_80px_-15px_rgba(0,0,0,0.8)] p-8 lg:p-10 space-y-7 border border-slate-200/50 relative">
          
          {/* Dynamic Render: Check if registration was successful */}
          {successMessage ? (
            <div className="text-center space-y-6 py-6 transition-all duration-300">
              <div className="h-16 w-16 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm flex items-center justify-center text-emerald-600 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{successMessage}</h2>
                <p className="text-xs text-slate-500 font-semibold tracking-wide">Your platform security container has been registered</p>
              </div>
              <button 
                onClick={() => { setIsLogin(true); setSuccessMessage(null); }}
                className="w-full bg-[#1A56DB] hover:bg-[#1E40AF] text-white font-extrabold text-xs py-3.5 rounded-xl transition-all uppercase tracking-wider mt-4 cursor-pointer"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <>
              {/* Top Shield Emblem */}
              <div className="flex justify-center">
                <div className="h-14 w-14 rounded-full bg-blue-50/80 border border-blue-100 shadow-sm flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
              </div>

              <div className="text-center space-y-1.5">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {isLogin ? "Welcome Back" : "Register Account"}
                </h2>
                <p className="text-xs text-slate-500 font-semibold tracking-wide">
                  {isLogin ? "Please sign in to your dashboard console" : "Establish secure identity record profiles"}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 text-xs rounded-xl font-bold text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div>
                      <input 
                        required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name"
                        className="w-full bg-slate-50 border border-slate-200/80 text-slate-900 text-xs rounded-xl px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-semibold tracking-wide"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Role</label>
                      <select 
                        name="role" value={formData.role} onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200/80 text-slate-700 text-xs rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold tracking-wide cursor-pointer"
                      >
                        <option value="candidate">Candidate</option>
                        <option value="recruiter">Recruiter</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <input 
                    required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email"
                    className="w-full bg-slate-50 border border-slate-200/80 text-slate-900 text-xs rounded-xl px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-semibold tracking-wide"
                  />
                </div>

                <div>
                  <input 
                    required type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password"
                    className="w-full bg-slate-50 border border-slate-200/80 text-slate-900 text-xs rounded-xl px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-semibold tracking-wide"
                  />
                </div>

                {!isLogin && (
                  <div>
                    <input 
                      required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm Password"
                      className="w-full bg-slate-50 border border-slate-200/80 text-slate-900 text-xs rounded-xl px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-semibold tracking-wide"
                    />
                  </div>
                )}

                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-[#1A56DB] hover:bg-[#1E40AF] disabled:opacity-50 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-blue-700/10 active:scale-[0.99] cursor-pointer tracking-wider uppercase mt-2"
                >
                  {loading ? "Processing..." : isLogin ? "Log In" : "Create Account"}
                </button>
              </form>

              <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100 text-[11px] font-bold text-center">
                {isLogin && (
                  <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors tracking-wide">
                    Forgot password?
                  </button>
                )}
                <button 
                  onClick={toggleAuthMode}
                  className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer tracking-wider uppercase text-[10px]"
                >
                  {isLogin ? "Create account" : "Back to sign in"}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}