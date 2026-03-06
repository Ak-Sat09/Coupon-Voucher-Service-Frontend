import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import Dashboard from "./components/Dashboard";
import CouponDetail from "./components/CouponDetails";
import SellerDashboard from "./components/SellerDashboard";

function App() {
  return (
    <>
      <Routes>

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Coupons */}
        <Route path="/coupons" element={<Dashboard />} />
        <Route path="/coupon/:id" element={<CouponDetail />} />

        <Route path="/seller" element={<SellerDashboard />} />


        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>

      <Toaster position="bottom-right" />
    </>
  );
}

export default App;