import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User, KeyRound, ArrowRight, RefreshCw, ArrowLeft, Briefcase, AlertCircle, ChevronDown, Check, Loader2 } from 'lucide-react';
import TraceGuardLogo from '../components/TraceGuardLogo';

// Aligned with process.env.PORT (5000) and versioned route (/api/v1/auth)
const API_BASE = 'http://localhost:5000/api/v1/auth';

async function handleResponse(res) {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      throw { status: res.status, message: data.message || 'Request failed' };
    }
    return data;
  }
  
  throw {
    status: res.status,
    message: `Server error (${res.status} ${res.statusText}). Confirm route exists under ${API_BASE}`
  };
}

export default function Auth({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState('credentials');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Developer',
    customRole: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const inputRefs = useRef([]);
  const dropdownRef = useRef(null);

  const inputStyleClass = "w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500 [color-scheme:dark] autofill:bg-slate-950 autofill:text-slate-100 [-webkit-text-fill-color:#f8fafc] [transition:background-color_50000s_ease-in-out_0s]";

  const roleOptions = [
    'Developer',
    'DevOps Engineer',
    'Security Analyst',
    'System Admin',
    'Other'
  ];

  useEffect(() => {
    let interval;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabSwitch = (registerState) => {
    setIsRegister(registerState);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.email || !formData.password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        if (!formData.name.trim()) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role === 'Other' ? formData.customRole : formData.role
          })
        });

        const data = await handleResponse(res);
        setSuccessMsg(data.message || 'OTP sent to your email.');
        setStep('otp');
        setTimer(30);
      } else {
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await handleResponse(res);
        const activeRole = formData.role === 'Other' ? formData.customRole : formData.role;
        const sessionUser = {
          name: formData.name || data.user.email.split('@')[0],
          email: data.user.email,
          role: activeRole,
          token: data.token
        };

        localStorage.setItem('traceguard_active_user', JSON.stringify(sessionUser));
        onLoginSuccess(sessionUser);
      }
    } catch (err) {
      if (err.status === 403) {
        setErrorMsg(err.message || 'Please verify your email.');
        setStep('otp');
        setTimer(30);
      } else {
        setErrorMsg(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) return;

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: enteredOtp
        })
      });

      await handleResponse(res);

      const loginRes = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const loginData = await handleResponse(loginRes);

      const activeRole = formData.role === 'Other' ? formData.customRole : formData.role;
      const sessionUser = {
        name: formData.name || loginData.user.email.split('@')[0],
        email: loginData.user.email,
        role: activeRole,
        token: loginData.token
      };

      localStorage.setItem('traceguard_active_user', JSON.stringify(sessionUser));
      onLoginSuccess(sessionUser);
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await handleResponse(res);
      setSuccessMsg(data.message || 'A new OTP has been sent.');
      setTimer(30);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="flex justify-center mb-8">
          <TraceGuardLogo size="md" showTagline={true} />
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2.5 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2.5 text-emerald-400 text-xs">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 'credentials' ? (
          <>
            <div className="flex border-b border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => handleTabSwitch(false)}
                className={`flex-1 py-2 cursor-pointer text-sm font-medium border-b-2 transition-colors ${
                  !isRegister ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch(true)}
                className={`flex-1 py-2 cursor-pointer text-sm font-medium border-b-2 transition-colors ${
                  isRegister ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Mercer"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={inputStyleClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Select Role</label>
                    <div className="relative" ref={dropdownRef}>
                      <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 z-10" />
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`${inputStyleClass} cursor-pointer flex items-center justify-between text-left pr-3`}
                      >
                        <span className="truncate">
                          {formData.role === 'Other' ? 'Other...' : formData.role}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 w-full mt-1.5 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-30 py-1 overflow-hidden">
                          {roleOptions.map((role) => {
                            const isSelected = formData.role === role;
                            return (
                              <button
                                key={role}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, role });
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-xs text-left cursor-pointer flex items-center justify-between transition-colors ${
                                  isSelected
                                    ? 'bg-indigo-600/20 text-indigo-400 font-semibold'
                                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
                                }`}
                              >
                                <span>{role === 'Other' ? 'Other...' : role}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {formData.role === 'Other' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Specify Role</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. QA Architect"
                        value={formData.customRole}
                        onChange={(e) => setFormData({ ...formData, customRole: e.target.value })}
                        className={inputStyleClass}
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="developer@traceguard.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputStyleClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={inputStyleClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isRegister ? 'Register & Get OTP' : 'Login & Continue'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 mb-4 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to {isRegister ? 'Register' : 'Login'}
              </button>
              <h2 className="text-base font-semibold text-slate-100">Two-Factor Authentication</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter code sent to <span className="text-indigo-400 font-mono">{formData.email}</span>
              </p>
              <div className="flex gap-2 justify-between mt-5">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-12 text-center text-lg font-bold bg-slate-950 border border-slate-800 rounded-lg text-indigo-400 focus:outline-none focus:border-indigo-500 [color-scheme:dark] autofill:bg-slate-950 autofill:text-slate-100 [-webkit-text-fill-color:#f8fafc] [transition:background-color_50000s_ease-in-out_0s]"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Launch Dashboard'}
              {!loading && <KeyRound className="w-4 h-4" />}
            </button>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-xs text-slate-500">
                  Resend code in <span className="text-slate-300 font-mono">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Resend Code
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}