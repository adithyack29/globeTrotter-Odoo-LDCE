import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import TripModal from './components/TripModal';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MyTripsPage from './pages/MyTripsPage';
import TripDetailPage from './pages/TripDetailPage';
import CityExplorerPage from './pages/CityExplorerPage';
import PublicTripPage from './pages/PublicTripPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function MainApp() {
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  const handleOpenNewTrip = () => {
    setEditingTrip(null);
    setIsTripModalOpen(true);
  };

  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setIsTripModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800">
      <Navbar onOpenNewTripModal={handleOpenNewTrip} />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage onOpenNewTripModal={handleOpenNewTrip} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <MyTripsPage onOpenNewTripModal={handleOpenNewTrip} onEditTripModal={handleEditTrip} />
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

          <Route path="/explore" element={<CityExplorerPage />} />
          <Route path="/share/:shareSlug" element={<PublicTripPage />} />
          <Route path="/trip/share/:shareSlug" element={<PublicTripPage />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
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

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <Footer />
      <Toast />

      {/* Global Trip Creation / Editing Modal */}
      <TripModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        onSaveSuccess={() => {
          setIsTripModalOpen(false);
          window.location.reload();
        }}
        initialData={editingTrip}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <BrowserRouter>
          <MainApp />
        </BrowserRouter>
      </CurrencyProvider>
    </AuthProvider>
  );
}
