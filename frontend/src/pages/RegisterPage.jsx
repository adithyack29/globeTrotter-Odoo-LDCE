import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Globe, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  language: z.string().optional()
});

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    language: 'English'
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    const validation = registerSchema.safeParse(formData);
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
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      if (err.details) {
        setErrors(err.details);
      } else {
        setServerError(err.message || 'Registration failed');
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
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-sm text-slate-500">Join Globe Trotter to design & track smart travel itineraries</p>
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
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g., Sarah Connor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border ${
                  errors.name ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                } text-slate-900 focus:outline-none focus:border-indigo-600 text-sm transition-colors`}
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="sarah@example.com"
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
              Password (min 6 characters)
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

          {/* Language */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Preferred Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600 text-sm"
            >
              <option value="English">English</option>
              <option value="French">French</option>
              <option value="Spanish">Spanish</option>
              <option value="Japanese">Japanese</option>
              <option value="German">German</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Register & Start Planning'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
