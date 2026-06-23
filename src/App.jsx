import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import SmartHeader from './components/SmartHeader';
import SmartFooter from './components/SmartFooter';
import MobileBottomNav from './components/MobileBottomNav';
import Toast from './components/Toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { useCart } from './context/CartContext';
import HomePage from './pages/HomePage';
import ShoppingPage from './pages/ShoppingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdvertisementsPage from './pages/AdvertisementsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersPage from './pages/OrdersPage';
import AddressManagementPage from './pages/AddressManagementPage';
import AdminDashboard from './pages/AdminDashboard';
import CartPage from './pages/checkout/CartPage';
import ShippingPage from './pages/checkout/ShippingPage';
import BillingPage from './pages/checkout/BillingPage';
import PaymentPage from './pages/checkout/PaymentPage';
import ConfirmationPage from './pages/checkout/ConfirmationPage';

function AppLayout() {
  const { pathname } = useLocation();
  const { toast } = useCart();
  const isStandalone = pathname === '/login' || pathname === '/register' || pathname === '/admin';

  if (isStandalone) {
    return (
      <>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        <Toast toast={toast} />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SmartHeader />
      <main className="grow pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/advertisements" element={<AdvertisementsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/addresses" element={<AddressManagementPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout/shipping" element={<ShippingPage />} />
          <Route path="/checkout/billing" element={<BillingPage />} />
          <Route path="/checkout/payment" element={<PaymentPage />} />
          <Route path="/checkout/confirmation" element={<ConfirmationPage />} />
        </Routes>
      </main>
      <SmartFooter />
      <MobileBottomNav />
      <Toast toast={toast} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
    <CartProvider>
    <Router>
      <AppLayout />
    </Router>
    </CartProvider>
    </AuthProvider>
  );
}

export default App;
