import React, { useState } from 'react';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Front-end sanity validation requirements mapping Pydantic rules
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

    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: "candidate" // Injects required backend literal token signature
    };

    // 🚀 BULLETPROOF NETWORKING: Try 127.0.0.1 first, fall back to localhost if blocked
    try {
      await axios.post('http://127.0.0.1:8000/auth/signup', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      setSuccess(true);
    } catch (firstErr) {
      console.warn("Loopback IP failed, attempting Localhost fallback...", firstErr);
      
      try {
        await axios.post('http://localhost:8000/auth/signup', payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        setSuccess(true);
      } catch (err) {
        console.error("Complete Connection Failure Details:", err);
        
        // Expose the absolute raw error so we aren't guessing anymore
        if (err.response?.data?.detail) {
          if (Array.isArray(err.response.data.detail)) {
            setError(`Backend Schema Error: ${err.response.data.detail[0].msg}`);
          } else {
            setError(err.response.data.detail);
          }
        } else if (err.message) {
          setError(`Network Error: ${err.message} (Check if FastAPI server terminal is active on port 8000)`);
        } else {
          setError("Server connection failure. Connection dropped completely.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-200 font-sans antialiased flex items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="w-full max-w-4xl bg-[#0b0f19] border border-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[550px]">
        
        {/* Left Informative Panel Grid */}
        <div className="w-full md:w-1/2 bg-[#090d16] p-8 md:p-12 flex flex-col justify-center relative border-b md:border-b-0 md:border-r border-slate-900">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase leading-none">
            SECURE <br/><span className="text-blue-500">ACCESS</span>
          </h1>
          <p className="text-slate-400 text-xs mt-6 leading-relaxed max-w-xs">
            Integrated talent processing dashboard client. Authenticate credentials to manage live candidate pipelines.
          </p>
        </div>

        {/* Right Input Processing Desk Component */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center text-slate-900">
          <div className="text-center mb-6">
            <div className="h-10 w-10 bg-blue-50/80 border border-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-sm mx-auto shadow-sm mb-3">🔒</div>
            <h2 className="text-xl font-bold tracking-tight">Register Account</h2>
            <p className="text-slate-500 text-[11px] mt-0.5">Establish secure identity record profiles</p>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-red-50 border border-red-100 text-red-600 text-[11px] font-semibold rounded-xl text-center">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4 py-6">
              <div className="h-10 w-10 rounded-full bg-green-50 text-green-600 border border-green-100 flex items-center justify-center text-sm mx-auto">✓</div>
              <h3 className="text-sm font-bold">Account Created!</h3>
              <p className="text-slate-500 text-[11px]">User context has been cleanly appended to the SQL system registry.</p>
              <button onClick={() => window.location.reload()} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all">
                Go to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <input 
                type="text" name="name" required placeholder="Full Name" 
                value={formData.name} onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 px-4 py-2.5 rounded-xl outline-none text-xs transition-all placeholder:text-slate-400"
              />

              <input 
                type="email" name="email" required placeholder="Email Address" 
                value={formData.email} onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 px-4 py-2.5 rounded-xl outline-none text-xs transition-all placeholder:text-slate-400"
              />

              <input 
                type="password" name="password" required placeholder="Password" 
                value={formData.password} onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 px-4 py-2.5 rounded-xl outline-none text-xs transition-all placeholder:text-slate-400"
              />

              <input 
                type="password" name="confirmPassword" required placeholder="Confirm Password" 
                value={formData.confirmPassword} onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 px-4 py-2.5 rounded-xl outline-none text-xs transition-all placeholder:text-slate-400"
              />

              <button 
                type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-all cursor-pointer active:scale-[0.99] uppercase tracking-wider"
              >
                {loading ? 'Executing Transaction...' : 'Create Account'}
              </button>
            </form>
          )}

          <button type="button" className="mt-5 text-[11px] text-blue-600 hover:text-blue-700 font-bold tracking-wide text-center uppercase focus:outline-none">
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}