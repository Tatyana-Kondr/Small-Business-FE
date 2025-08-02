import './App.css'
import Layout from "./components/Layout"

import { Navigate, Route, Routes } from 'react-router-dom';
import NoSuchPage from './components/NoSuchPage';
import Home from './components/Home';
import LoginForm from './components/Login';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { selectIsAuthenticated, user } from './features/auth/authSlice';
import { useEffect } from 'react';
import Customers from './features/customers/Customers';
import CustomersWithNumber from './features/customers/CustomersWithNumber';
import CustomerCard from './features/customers/CustomerCard';
import ProductCategoryList from './features/products/components/ProductCategoryList';
import CreateProductCategory from './features/products/components/CreateProductCategory';
import ProductCard from './features/products/components/ProductCard';
import CustomerWithNumberCard from './features/customers/CustomerWithNumberCard';
import Purchases from './features/purchases/components/Purchases';
import PurchaseCard from './features/purchases/components/PurchaseCard';
import Sales from './features/sales/components/Sales';
import Payments from './features/payments/components/Payments';
import PaymentMethodsList from './features/payments/components/paymentMetods/PaymentMethodsList';
import PaymentProcessesList from './features/payments/components/paymentProcesses/PaymentProcessesList';
import { ModalManager } from './modal/ModalManager';
import PrivateRoute from './components/PrivateRoute';
import Register from './components/Register';
import { useSessionCheck } from './hooks/useSessionCheck';


function App() {
  useSessionCheck();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isSessionChecked = useAppSelector((state) => state.auth.isSessionChecked); 
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(user());
    }
  }, [isAuthenticated, dispatch]);

  console.log("auth", isAuthenticated, isSessionChecked);

  if (!isSessionChecked) {
    return <div>Laden...</div>; // или красивый спиннер
  }

  return (
    <div className="App" style={{ textAlign: "center", marginTop: "50px" }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="login" element={isAuthenticated ? <Navigate to="/" /> : <LoginForm />} />
          <Route path="register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />


            {/* Если пользователь авторизован, показываем Home */}
            <Route index element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
            />
            <Route
              path="/product-categories"
              element={
                <PrivateRoute>
                  <ProductCategoryList />
                </PrivateRoute>
              }
            />
            <Route
              path="/lieferanten"
              element={
                <PrivateRoute>
                  <Customers />
                </PrivateRoute>} />
            <Route
              path="/kunden"
              element={
                <PrivateRoute>
                  <CustomersWithNumber />
                </PrivateRoute>
              } />
            <Route
              path="/customer/:customerId"
              element={
                <PrivateRoute>
                  <CustomerCard />
                </PrivateRoute>} />
            <Route
              path="/kunde/:customerId"
              element={
                <PrivateRoute>
                  <CustomerWithNumberCard />
                </PrivateRoute>} />
            <Route
              path="/product-card/:productId"
              element={
                <PrivateRoute>
                  <ProductCard />
                </PrivateRoute>} />
            <Route
              path="/product-categories"
              element={
                <PrivateRoute>
                  <ProductCategoryList />
                </PrivateRoute>} />
            <Route
              path="/create-product-category"
              element={
                <PrivateRoute>
                  <CreateProductCategory />
                </PrivateRoute>} />
            <Route
              path="/purchases"
              element={
                <PrivateRoute>
                  <Purchases />
                </PrivateRoute>} />
            
            <Route
              path="/purchases/:purchaseId"
              element={
                <PrivateRoute>
                  <PurchaseCard />
                </PrivateRoute>} />
            <Route
              path="/sales"
              element={
                <PrivateRoute>
                  <Sales />
                </PrivateRoute>} />
            
            <Route
              path="/payments"
              element={
                <PrivateRoute>
                  <Payments />
                </PrivateRoute>} />
            <Route
              path="/payment-methods"
              element={
                <PrivateRoute>
                  <PaymentMethodsList />
                </PrivateRoute>} />
            <Route
              path="/payment-processes"
              element={
                <PrivateRoute>
                  <PaymentProcessesList />
                </PrivateRoute>} />

            {/* Страница 404 */}
            <Route path="*" element={<NoSuchPage />} />
          </Route>
        </Routes>
        <ModalManager />
      </div>

    )
  }

export default App
