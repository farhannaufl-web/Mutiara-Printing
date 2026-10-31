/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AdminAuthProvider } from './context/AdminAuthContext';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { StickyWhatsAppMobile } from './components/layout/StickyWhatsAppMobile';

import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminClients } from './pages/admin/AdminClients';


// Automatically scroll window to top on route navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Layout wrapper for public pages
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-[#0B1120] text-slate-100">
      <Navbar />
      <div className="flex-1 pb-16 md:pb-0">{children}</div>
      <StickyWhatsAppMobile />
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <HelmetProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Routes with Navbar, Footer, and Sticky WhatsApp */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <HomePage />
                </PublicLayout>
              }
            />
            <Route
              path="/katalog"
              element={
                <PublicLayout>
                  <CatalogPage />
                </PublicLayout>
              }
            />
            <Route
              path="/produk/:slug"
              element={
                <PublicLayout>
                  <ProductDetailPage />
                </PublicLayout>
              }
            />
            <Route
              path="/kontak"
              element={
                <PublicLayout>
                  <ContactPage />
                </PublicLayout>
              }
            />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/klien" element={<AdminClients />} />


            {/* 404 Fallback */}
            <Route
              path="*"
              element={
                <PublicLayout>
                  <NotFoundPage />
                </PublicLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </HelmetProvider>
  );
}
