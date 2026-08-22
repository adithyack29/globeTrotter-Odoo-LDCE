import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { z } from 'zod';
import { UserPlus, Camera, Mail, Phone, MapPin, Globe, FileText, Lock, ArrowRight } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(5, 'Valid phone number is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  avatarUrl: z.string().optional(),
  additionalInfo: z.string().optional()
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, showToast } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    password: '',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    additionalInfo: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validation = registerSchema.safeParse(formData);
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
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      await register({
        name: fullName,
        email: formData.email,
        password: formData.password,
        avatarUrl: formData.avatarUrl
      });
      showToast('Registration successful! Welcome to GlobalTrotter.', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-2xl glass-panel p-8 rounded-3xl border border-slate-200 shadow-xl bg-white space-y-6 animate-fade-in">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <img
              src={formData.avatarUrl}
              alt="Photo Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200 mx-auto shadow-md"
            />
            <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 text-white shadow-sm cursor-pointer" title="Photo">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create User Account</h2>
          <p className="text-xs text-slate-500">Register your GlobalTrotter profile to start planning section-based itineraries</p>
        </div>

        {/* 2-Column Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Row 1: First Name | Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                placeholder="Elena"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-indigo-600"
              />
              {errors.firstName && <p className="text-xs text-rose-600 mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                placeholder="Rostova"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-indigo-600"
              />
              {errors.lastName && <p className="text-xs text-rose-600 mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Row 2: Email Address | Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                placeholder="elena@globetrotter.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-indigo-600"
              />
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                placeholder="+1 (555) 234-5678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-indigo-600"
              />
              {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Row 3: City | Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">City *</label>
              <input
                type="text"
                placeholder="Paris"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-indigo-600"
              />
              {errors.city && <p className="text-xs text-rose-600 mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Country *</label>
              <input
                type="text"
                placeholder="France"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-indigo-600"
              />
              {errors.country && <p className="text-xs text-rose-600 mt-1">{errors.country}</p>}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Password *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-indigo-600"
            />
            {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
          </div>

          {/* Row 4: Additional Information .... */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Additional Information ....</label>
            <textarea
              rows="3"
              placeholder="Travel preferences, dietary notes, passport validity..."
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-indigo-600"
            />
          </div>

          {/* Register Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register Users'}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
