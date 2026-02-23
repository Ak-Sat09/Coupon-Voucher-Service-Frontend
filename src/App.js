import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Dashboard from './components/coupons';
import SellerDashboard from './components/SellerDashboard';

function App() {
  return (
    <>
      <Routes>
        {/* Default → login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

 <Route path="/coupons" element={<Dashboard />} />
 <Route path="/sellerDashboard" element={<SellerDashboard />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "'Mulish', sans-serif",
            fontSize: '13px',
            background: '#1a3328',
            color: '#f5f0e8',
            borderRadius: '8px',
            padding: '12px 16px',
            border: '1px solid rgba(255,255,255,0.08)',
          },
        }}
      />
    </>
  );
}

export default App;