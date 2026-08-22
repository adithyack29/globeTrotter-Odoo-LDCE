import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { z } from 'zod';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, HelpCircle, X, Check } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, showToast } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      const formattedErrors = {};
      validation.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      showToast('Logged in successfully! Welcome back.', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotError('');

    const validation = forgotPasswordSchema.safeParse({ email: forgotEmail });
    if (!validation.success) {
      setForgotError(validation.error.issues[0].message);
      return;
    }

    setForgotSuccess(true);
    showToast('Password reset link sent to your email!', 'success');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-3xl border border-slate-200 shadow-xl bg-white animate-fade-in">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/20">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign in to Globe Trotter
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Access your multi-city travel itineraries and budget analytics
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border text-slate-900 text-sm focus:outline-none transition-colors ${
                  errors.email ? 'border-rose-500 focus:border-rose-600' : 'border-slate-300 focus:border-indigo-600'
                }`}
              />
            </div>
            {errors.email && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotSuccess(false);
                  setForgotError('');
                  setIsForgotOpen(true);
                }}
                className="text-xs text-indigo-600 font-bold hover:text-indigo-700"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border text-slate-900 text-sm focus:outline-none transition-colors ${
                  errors.password ? 'border-rose-500 focus:border-rose-600' : 'border-slate-300 focus:border-indigo-600'
                }`}
              />
            </div>
            {errors.password && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Account Credentials Quick Fill (User & Admin) */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3 text-xs text-indigo-900">
          <div className="flex items-center gap-1.5 font-bold text-indigo-700 border-b border-indigo-100/80 pb-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Demo Test Credentials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            {/* Standard User */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 space-y-1">
              <span className="font-extrabold text-slate-800 uppercase text-[9px] px-1.5 py-0.5 rounded bg-slate-100">Standard User</span>
              <p className="text-slate-600 pt-0.5">
                Email: <code className="font-bold text-slate-900">elena@globetrotter.com</code><br />
                Pass: <code className="font-bold text-slate-900">Password123!</code>
              </p>
              <button
                type="button"
                onClick={() => setFormData({ email: 'elena@globetrotter.com', password: 'Password123!' })}
                className="text-indigo-600 font-bold hover:underline cursor-pointer pt-0.5 block"
              >
                Auto-fill User
              </button>
            </div>

            {/* Admin User */}
            <div className="p-2.5 rounded-xl bg-white border border-purple-200/80 space-y-1">
              <span className="font-extrabold text-purple-800 uppercase text-[9px] px-1.5 py-0.5 rounded bg-purple-100">Admin Privileges</span>
              <p className="text-slate-600 pt-0.5">
                Email: <code className="font-bold text-slate-900">admin@globetrotter.com</code><br />
                Pass: <code className="font-bold text-slate-900">Password123!</code>
              </p>
              <button
                type="button"
                onClick={() => setFormData({ email: 'admin@globetrotter.com', password: 'Password123!' })}
                className="text-purple-700 font-bold hover:underline cursor-pointer pt-0.5 block"
              >
                Auto-fill Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
            Create an Account
          </Link>
        </p>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                Password Recovery
              </h3>
              <button onClick={() => setIsForgotOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="py-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Reset Email Sent!</h4>
                <p className="text-xs text-slate-500">
                  Instructions to reset your password have been dispatched to <strong className="text-slate-800">{forgotEmail}</strong>.
                </p>
                <button
                  onClick={() => setIsForgotOpen(false)}
                  className="w-full py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your registered account email address. We'll generate a secure password reset authorization token.
                </p>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-indigo-600"
                  />
                  {forgotError && <p className="text-xs text-rose-600 mt-1 font-medium">{forgotError}</p>}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
