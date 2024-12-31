import React from 'react';
    import { Routes, Route } from 'react-router-dom';
    import LoginPage from './components/LoginPage';
    import AdminPage from './components/AdminPage';
    import ProductsPage from './components/ProductsPage';
    import ProductDetails from './components/ProductDetails';
    import CheckoutPage from './components/CheckoutPage';
    import { StripeProvider } from './components/StripeProvider';

    function App() {
      return (
        <StripeProvider>
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </StripeProvider>
      );
    }

    export default App;
