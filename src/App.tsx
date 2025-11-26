import './App.css'
import Layout from "./components/Layout"

import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import NoSuchPage from './components/NoSuchPage';
import LoginForm from './components/Login';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { refresh, selectIsAuthenticated, selectSessionChecked, setSessionChecked } from './features/auth/authSlice';
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
import CreateProductCategory from './features/products/components/category/CreateProductCategory';
import SaleCard from './features/sales/components/SaleCard';
import Spinner from './components/Spinner';
import { JSX, useEffect, useState } from 'react';
import { setNavigate } from './utils/apiFetch';
import { useAutoLogout } from './hooks/useAutoLogout';
import AutoLogoutModal from './components/AutoLogoutModal';
import AdminSettings from './components/AdminSettings';
import ProductionsList from './features/productions/components/ProductionsList';
import EditProduction from './features/productions/components/EditProduction';
import ShippingsList from './features/sales/components/shipping/ShippingsList';
import UnitsList from './features/products/components/unitOfMeasurement/UnitsList';
import DocumentTypesList from './features/purchases/documentTypes/DocumentTypesList';
import Products from './features/products/components/Products';
import TermOfPaymentList from './features/sales/termOfPayment/TermOfPaymentList';

function App() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isSessionChecked = useAppSelector(selectSessionChecked);
  const navigate = useNavigate();

   // Динамический таймер автологаута
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState<number>(
    Number(localStorage.getItem("autoLogoutMinutes")) ||
      Number(import.meta.env.VITE_AUTOLOGOUT_TIMEOUT) ||
      30
  );

  const { showModal, endTime, warningTime, handleLogout } = useAutoLogout({
    timeout: autoLogoutMinutes * 60 * 1000, // в миллисекундах
  });

  // Передаем navigate в apiFetch
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  // Проверка сессии при загрузке
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      dispatch(refresh());
    } else {
      dispatch(setSessionChecked(true));
    }
  }, [dispatch]);

  if (!isSessionChecked && location.pathname !== "/login") return <Spinner />;

  const Private = (component: JSX.Element, role?: "USER" | "ADMIN") => {
    return <PrivateRoute role={role}>{component}</PrivateRoute>;
  };

  return (
    <div className="App" style={{ textAlign: "center", marginTop: "50px" }}>

      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Публичные страницы */}
          <Route path="login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />} />

          {/* Защищённые страницы */}
          <Route path="/" element={<Products />} />     
          <Route path="product-categories" element={Private(<ProductCategoryList />, "ADMIN")} />
          <Route path="create-product-category" element={Private(<CreateProductCategory />, "ADMIN")} />
          <Route path="lieferanten" element={Private(<Customers />)} />
          <Route path="kunden" element={Private(<CustomersWithNumber />)} />
          <Route path="customer/:customerId" element={Private(<CustomerCard />)} />
          <Route path="kunde/:customerId" element={Private(<CustomerWithNumberCard />)} />
          <Route path="product-card/:productId" element={Private(<ProductCard />)} />
          <Route path="purchases" element={Private(<Purchases />)} />
          <Route path="purchases/:purchaseId" element={Private(<PurchaseCard />, "ADMIN")} />
          <Route path="sales" element={Private(<Sales />)} />
          <Route path="sales/:saleId" element={Private(<SaleCard />)} />
          <Route path="payments" element={Private(<Payments />, "ADMIN")} />
          <Route path="payment-methods" element={Private(<PaymentMethodsList />, "ADMIN")} />
          <Route path="payment-processes" element={Private(<PaymentProcessesList />, "ADMIN")} />
          <Route path="shippings" element={Private(<ShippingsList />, "ADMIN")} />
          <Route path="units" element={Private(<UnitsList />, "ADMIN")} />
          <Route path="payment-terms" element={Private(<TermOfPaymentList />, "ADMIN")} />
          <Route path="document-types" element={Private(<DocumentTypesList />, "ADMIN")} />
          <Route path="productions" element={Private(<ProductionsList />, "ADMIN")} />
          <Route path="productions/:productionId" element={Private(<EditProduction />)} />
          <Route
            path="settings"
            element={
              Private(
                <AdminSettings
                  autoLogoutMinutes={autoLogoutMinutes}
                  setAutoLogoutMinutes={(minutes) => {
                    setAutoLogoutMinutes(minutes);
                    localStorage.setItem("autoLogoutMinutes", String(minutes));
                  }}
                />,
                "ADMIN"
              )
            }
          />

          {/* 404 страница */}
          <Route path="*" element={<NoSuchPage />} />
        </Route>
      </Routes>
      <ModalManager />
      
        <AutoLogoutModal
        show={showModal}
        endTime={endTime}
        warningTime={warningTime}
        onLogout={handleLogout}
      />
    
    </div>
  );
}

export default App;