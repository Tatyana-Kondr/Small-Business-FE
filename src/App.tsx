import './App.css'

import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import NoSuchPage from './components/NoSuchPage';
import LoginForm from './components/Login';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { JSX, lazy, Suspense, useEffect, useState } from 'react';
import { refresh, selectIsAuthenticated, selectSessionChecked, setSessionChecked } from './features/auth/authSlice';
import { ModalManager } from './modal/ModalManager';
import { setNavigate } from './utils/apiFetch';
import { useAutoLogout } from './hooks/useAutoLogout';
import AutoLogoutModal from './components/AutoLogoutModal';
import PrivateRoute from './components/PrivateRoute';
import Spinner from './components/Spinner';

const Layout = lazy(() => import("./components/Layout"));
const Customers = lazy(() => import("./features/customers/components/Customers"));
const CustomersWithNumber = lazy(() =>import("./features/customers/components/CustomersWithNumber"));
const CustomerCard = lazy(() => import("./features/customers/components/CustomerCard"));
const CustomerWithNumberCard = lazy(() => import("./features/customers/components/CustomerWithNumberCard"));
const ProductCategoryList = lazy(() => import("./features/products/components/category/ProductCategoryList"));
const CreateProductCategory = lazy(() => import("./features/products/components/category/CreateProductCategory"));
const ProductCard = lazy(() => import("./features/products/components/ProductCard"));
const Products = lazy(() => import("./features/products/components/Products"));
const Purchases = lazy(() => import("./features/purchases/components/Purchases"));
const PurchaseCard = lazy(() => import("./features/purchases/components/PurchaseCard"));
const Sales = lazy(() => import("./features/sales/components/Sales"));
const SaleCard = lazy(() => import("./features/sales/components/SaleCard"));
const Payments = lazy(() => import("./features/payments/components/Payments"));
const PaymentMethodsList = lazy(() => import("./features/payments/components/paymentMetods/PaymentMethodsList"));
const PaymentProcessesList = lazy(() => import("./features/payments/components/paymentProcesses/PaymentProcessesList"));
const ProductionsList = lazy(() => import("./features/productions/components/ProductionsList"));
const EditProduction = lazy(() => import("./features/productions/components/EditProduction"));
const ShippingsList = lazy(() => import("./features/sales/components/shipping/ShippingsList"));
const UnitsList = lazy(() => import("./features/products/components/unitOfMeasurement/UnitsList"));
const DocumentTypesList = lazy(() => import("./features/purchases/documentTypes/DocumentTypesList"));
const TermOfPaymentList = lazy(() => import("./features/sales/termOfPayment/TermOfPaymentList"));
const AdminSettings = lazy(() => import("./components/AdminSettings"));

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
          <Route path="login" element={isAuthenticated ? <Navigate to="/products" replace /> : <LoginForm />} />
          <Route index element={isAuthenticated ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />} />

          {/* Защищённые страницы */}
          <Route path="products" element={<Suspense fallback={<Spinner />}> {Private(<Products />)} </Suspense>} />     
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