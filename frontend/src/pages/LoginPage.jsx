import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Globe, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: 'elena@globetrotter.com', password: 'Password123!' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      const formatted = {};
      validation.error.errors.forEach((err) => {
        formatted[err.path[0]] = err.message;
      });
      setErrors(formatted);
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      if (err.details) {
        setErrors(err.details);
      } else {
        setServerError(err.message || 'Invalid login credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 mb-2">
            <Globe className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-500">Sign in to manage your trip itineraries & budget analytics</p>
        </div>

        {/* Global Error Banner */}
        {serverError && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="elena@globetrotter.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border ${
                  errors.email ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                } text-slate-900 focus:outline-none focus:border-indigo-600 text-sm transition-colors`}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border ${
                  errors.password ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                } text-slate-900 focus:outline-none focus:border-indigo-600 text-sm transition-colors`}
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.password}</p>}
          </div>

          {/* Demo Login Hint */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900">
            <span className="font-bold block text-indigo-950 mb-1">Demo Credentials:</span>
            <div className="space-y-0.5">
              <p>Email: <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-semibold">elena@globetrotter.com</code></p>
              <p>Pass: <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-semibold">Password123!</code></p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
