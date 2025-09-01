import './App.css'
import Layout from "./components/Layout"

import { Navigate, Route, Routes } from 'react-router-dom';
import NoSuchPage from './components/NoSuchPage';
import Home from './components/Home';
import LoginForm from './components/Login';
import { useAppSelector } from './redux/hooks';
import { selectIsAuthenticated, selectSessionChecked } from './features/auth/authSlice';
import Customers from './features/customers/components/Customers';
import CustomersWithNumber from './features/customers/components/CustomersWithNumber';
import CustomerCard from './features/customers/components/CustomerCard';
import ProductCategoryList from './features/products/components/category/ProductCategoryList';
import ProductCard from './features/products/components/ProductCard';
import CustomerWithNumberCard from './features/customers/components/CustomerWithNumberCard';
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
import CreateProductCategory from './features/products/components/category/CreateProductCategory';
import { Toaster } from 'react-hot-toast';
import SaleCard from './features/sales/components/SaleCard';
import Spinner from './components/Spinner';
import { JSX } from 'react';
import { useAutoLogout } from './hooks/useAutoLogout';
import AutoLogoutModal from './components/AutoLogoutModal';



function App() {
  useSessionCheck();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isSessionChecked = useAppSelector(selectSessionChecked);

  const { showWarning, endTime, warningTime } = useAutoLogout();

  if (!isSessionChecked) return <Spinner />;

  const Private = (component: JSX.Element) => <PrivateRoute>{component}</PrivateRoute>;

  return (
    <div className="App" style={{ textAlign: "center", marginTop: "50px" }}>
      <Toaster position="top-center" reverseOrder={false} />
      {isAuthenticated && (
         <AutoLogoutModal
          show={showWarning}
          endTime={endTime}
          warningTime={warningTime}
        />
      )}

      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Публичные страницы */}
          <Route path="login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />} />
          <Route path="register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />

          {/* Защищённые страницы */}
          <Route index element={Private(<Home />)} />
          <Route path="product-categories" element={Private(<ProductCategoryList />)} />
          <Route path="create-product-category" element={Private(<CreateProductCategory />)} />
          <Route path="lieferanten" element={Private(<Customers />)} />
          <Route path="kunden" element={Private(<CustomersWithNumber />)} />
          <Route path="customer/:customerId" element={Private(<CustomerCard />)} />
          <Route path="kunde/:customerId" element={Private(<CustomerWithNumberCard />)} />
          <Route path="product-card/:productId" element={Private(<ProductCard />)} />
          <Route path="purchases" element={Private(<Purchases />)} />
          <Route path="purchases/:purchaseId" element={Private(<PurchaseCard />)} />
          <Route path="sales" element={Private(<Sales />)} />
          <Route path="sales/:saleId" element={Private(<SaleCard />)} />
          <Route path="payments" element={Private(<Payments />)} />
          <Route path="payment-methods" element={Private(<PaymentMethodsList />)} />
          <Route path="payment-processes" element={Private(<PaymentProcessesList />)} />

          {/* 404 страница */}
          <Route path="*" element={<NoSuchPage />} />
        </Route>
      </Routes>
      <ModalManager />
    </div>
  );
}
export default App;