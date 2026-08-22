import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';

import Navbar from './components/Navbar';
import TripModal from './components/TripModal';
import Toast from './components/Toast';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PlanTripPage from './pages/PlanTripPage';
import BuildItineraryPage from './pages/BuildItineraryPage';
import MyTripsPage from './pages/MyTripsPage';
import ProfilePage from './pages/ProfilePage';
import CityExplorerPage from './pages/CityExplorerPage';
import TripDetailPage from './pages/TripDetailPage';
import CommunityPage from './pages/CommunityPage';
import CalendarViewPage from './pages/CalendarViewPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PublicTripPage from './pages/PublicTripPage';

function ProtectedRoute({ children }) {
  const { user, token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function MainLayout() {
  const { user, toast, hideToast } = useAuth();
  const navigate = useNavigate();

  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  const handleOpenNewTripModal = () => {
    setEditingTrip(null);
    setIsNewTripModalOpen(true);
  };

  const handleOpenEditTripModal = (trip) => {
    setEditingTrip(trip);
    setIsNewTripModalOpen(true);
  };

  const handleTripSaved = (trip) => {
    setIsNewTripModalOpen(false);
    navigate(`/builder/${trip.id}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <Navbar onOpenNewTripModal={handleOpenNewTripModal} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/share/:shareSlug" element={<PublicTripPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage onOpenNewTripModal={handleOpenNewTripModal} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plan"
            element={
              <ProtectedRoute>
                <PlanTripPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/builder/:id"
            element={
              <ProtectedRoute>
                <BuildItineraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <MyTripsPage
                  onOpenNewTripModal={handleOpenNewTripModal}
                  onEditTripModal={handleOpenEditTripModal}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id"
            element={
              <ProtectedRoute>
                <TripDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <CityExplorerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Clean Production Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2 font-medium">
          <p>© 2026 GlobalTrotter Travel Intelligence. All rights reserved.</p>
          <p className="text-slate-400">Production Engine v2.0</p>
        </div>
      </footer>

      {/* Global Modals & Toast */}
      {isNewTripModalOpen && (
        <TripModal
          isOpen={isNewTripModalOpen}
          onClose={() => setIsNewTripModalOpen(false)}
          onSuccess={handleTripSaved}
          initialData={editingTrip}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <MainLayout />
      </CurrencyProvider>
    </AuthProvider>
  );
}
