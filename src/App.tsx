import "./App.css";

import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { lazy, Suspense, useEffect, useState } from "react";

import type { JSX } from "react";

import NoSuchPage from "./components/NoSuchPage";
import LoginForm from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import Spinner from "./components/Spinner";
import AutoLogoutModal from "./components/AutoLogoutModal";

import { useAppDispatch, useAppSelector } from "./redux/hooks";

import {
  clearAuth,
  initializeSession,
  selectIsAuthenticated,
  selectSessionChecked,
  setSessionChecked,
} from "./features/auth/authSlice";

import { getSessionVersion, hasRefreshToken } from "./features/auth/session";

import { ModalManager } from "./modal/ModalManager";
import { setNavigate, setClearAuthHandler } from "./utils/apiFetch";
import { useAutoLogout } from "./hooks/useAutoLogout";

import SalesReport from "./features/reports/components/SalesReport";
import { Toaster } from "react-hot-toast";

// --------------------------------------------------
// LAZY COMPONENTS
// --------------------------------------------------

const Layout = lazy(() => import("./components/Layout"));

const Customers = lazy(
  () => import("./features/customers/components/Customers"),
);

const CustomersWithNumber = lazy(
  () => import("./features/customers/components/CustomersWithNumber"),
);

const CustomerCard = lazy(
  () => import("./features/customers/components/CustomerCard"),
);

const ProductCategoryList = lazy(
  () => import("./features/products/components/category/ProductCategoryList"),
);

const ProductCard = lazy(
  () => import("./features/products/components/ProductCard"),
);

const Products = lazy(() => import("./features/products/components/Products"));

const Purchases = lazy(
  () => import("./features/purchases/components/Purchases"),
);

const PurchaseCard = lazy(
  () => import("./features/purchases/components/PurchaseCard"),
);

const Sales = lazy(() => import("./features/sales/components/Sales"));

const SaleCard = lazy(() => import("./features/sales/components/SaleCard"));

const Payments = lazy(() => import("./features/payments/components/Payments"));

const PaymentMethodsList = lazy(
  () =>
    import("./features/payments/components/paymentMetods/PaymentMethodsList"),
);

const PaymentProcessesList = lazy(
  () =>
    import("./features/payments/components/paymentProcesses/PaymentProcessesList"),
);

const ProductionsList = lazy(
  () => import("./features/productions/components/ProductionsList"),
);

const EditProduction = lazy(
  () => import("./features/productions/components/EditProduction"),
);

const ShippingsList = lazy(
  () => import("./features/sales/components/shipping/ShippingsList"),
);

const UnitsList = lazy(
  () => import("./features/products/components/unitOfMeasurement/UnitsList"),
);

const DocumentTypesList = lazy(
  () => import("./features/purchases/documentTypes/DocumentTypesList"),
);

const TermOfPaymentList = lazy(
  () => import("./features/sales/components/termOfPayment/TermOfPaymentList"),
);

const TaxRatesList = lazy(
  () => import("./features/sales/components/taxRate/TaxRatesList"),
);

const DiscountRatesList = lazy(
  () => import("./features/sales/components/discountRate/DiscountRatesList"),
);

const AdminSettings = lazy(() => import("./components/AdminSettings"));

// --------------------------------------------------
// SESSION INITIALIZATION
// --------------------------------------------------

// Общий Promise защищает от повторного
// initializeSession при React StrictMode.

let initializationPromise: Promise<unknown> | null = null;

let initializationVersion: number | null = null;

// --------------------------------------------------
// AUTO LOGOUT HANDLER
// --------------------------------------------------

type AutoLogoutHandlerProps = {
  timeout: number;
};

function AutoLogoutHandler({ timeout }: AutoLogoutHandlerProps) {
  const { showModal, endTime, warningTime } = useAutoLogout({ timeout });

  return (
    <AutoLogoutModal
      show={showModal}
      endTime={endTime}
      warningTime={warningTime}
    />
  );
}

// --------------------------------------------------
// APP
// --------------------------------------------------

function App() {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isSessionChecked = useAppSelector(selectSessionChecked);

  // --------------------------------------------------
  // AUTO LOGOUT SETTINGS
  // --------------------------------------------------

  const envMinutes = Number(import.meta.env.VITE_AUTOLOGOUT_TIMEOUT);

  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState<number>(() => {
    if (!Number.isFinite(envMinutes) || envMinutes <= 0) {
      return 0;
    }

    const savedValue = localStorage.getItem("autoLogoutMinutes");

    if (savedValue !== null) {
      const minutes = Number(savedValue);

      if (Number.isFinite(minutes) && minutes >= 0) {
        return minutes;
      }
    }

    return envMinutes;
  });

  const autoLogoutEnabled = autoLogoutMinutes > 0;

  // --------------------------------------------------
  // NAVIGATE AND AUTH HANDLER FOR API FETCH
  // --------------------------------------------------

  useEffect(() => {
    setNavigate(navigate);

    setClearAuthHandler(() => {
      dispatch(clearAuth());
    });
  }, [navigate, dispatch]);

  // --------------------------------------------------
  // INITIALIZE SESSION
  // --------------------------------------------------

  useEffect(() => {
    // Нет refresh token — восстанавливать нечего.
    if (!hasRefreshToken()) {
      dispatch(setSessionChecked(true));
      return;
    }

    const version = getSessionVersion();

    // Не запускаем второй initializeSession,
    // если для этой версии сессии уже есть запрос.
    if (initializationPromise && initializationVersion === version) {
      return;
    }

    initializationVersion = version;

    const promise = dispatch(initializeSession()).unwrap();

    initializationPromise = promise;

    // Очищаем ссылку после завершения запроса.
    // Старый запрос не должен очищать ссылку
    // на новый initializeSession.
    void promise
      .finally(() => {
        if (initializationPromise === promise) {
          initializationPromise = null;
          initializationVersion = null;
        }
      })
      .catch(() => {
        // Ошибка уже обрабатывается в authSlice.
      });
  }, [dispatch]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "forceLogout" && event.newValue) {
        dispatch(clearAuth());
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [dispatch, navigate]);

  // --------------------------------------------------
  // WAIT FOR SESSION CHECK
  // --------------------------------------------------

  if (!isSessionChecked) {
    return <Spinner />;
  }

  // --------------------------------------------------
  // PRIVATE ROUTE HELPER
  // --------------------------------------------------

  const Private = (component: JSX.Element, role?: "USER" | "ADMIN") => {
    return <PrivateRoute role={role}>{component}</PrivateRoute>;
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="App" style={{ textAlign: "center" }}>
      <Suspense fallback={<Spinner />}>
        <Routes>
          {/* --------------------------------------
              PUBLIC ROUTES
          -------------------------------------- */}

          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/products" replace />
              ) : (
                <LoginForm />
              )
            }
          />

          {/* --------------------------------------
              PROTECTED ROUTES
          -------------------------------------- */}

          <Route path="/" element={<Layout />}>
            <Route
              index
              element={
                isAuthenticated ? (
                  <Navigate to="/products" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* PRODUCTS */}

            <Route path="products" element={Private(<Products />)} />

            <Route
              path="product-categories"
              element={Private(<ProductCategoryList />, "ADMIN")}
            />

            <Route
              path="product-card/:productId"
              element={Private(<ProductCard />)}
            />

            {/* CUSTOMERS */}
            <Route path="lieferanten" element={Private(<Customers />)} />
            <Route path="kunden" element={Private(<CustomersWithNumber />)} />
            <Route
              path="customer/:customerId"
              element={Private(<CustomerCard />)}
            />
            <Route
              path="kunde/:customerId"
              element={Private(<CustomerCard />)}
            />

            {/* PURCHASES */}

            <Route path="purchases" element={Private(<Purchases />)} />

            <Route
              path="purchases/:purchaseId"
              element={Private(<PurchaseCard />)}
            />

            {/* SALES */}

            <Route path="sales" element={Private(<Sales />)} />

            <Route path="sales/:saleId" element={Private(<SaleCard />)} />

            <Route
              path="reports/sales"
              element={Private(<SalesReport />, "ADMIN")}
            />

            {/* PAYMENTS */}

            <Route path="payments" element={Private(<Payments />, "ADMIN")} />

            <Route
              path="payment-methods"
              element={Private(<PaymentMethodsList />, "ADMIN")}
            />
            <Route
              path="payment-processes"
              element={Private(<PaymentProcessesList />, "ADMIN")}
            />

            {/* SHIPPING */}
            <Route
              path="shippings"
              element={Private(<ShippingsList />, "ADMIN")}
            />

            {/* SETTINGS / REFERENCES */}
            <Route path="units" element={Private(<UnitsList />, "ADMIN")} />
            <Route
              path="payment-terms"
              element={Private(<TermOfPaymentList />, "ADMIN")}
            />
            <Route
              path="tax-rates"
              element={Private(<TaxRatesList />, "ADMIN")}
            />
            <Route
              path="discount-rates"
              element={Private(<DiscountRatesList />, "ADMIN")}
            />
            <Route
              path="document-types"
              element={Private(<DocumentTypesList />, "ADMIN")}
            />

            {/* PRODUCTIONS */}
            <Route path="productions" element={Private(<ProductionsList />)} />
            <Route
              path="productions/:productionId"
              element={Private(<EditProduction />)}
            />

            {/* ADMIN SETTINGS */}

            <Route
              path="settings"
              element={Private(
                <AdminSettings
                  autoLogoutMinutes={autoLogoutMinutes}
                  setAutoLogoutMinutes={(minutes) => {
                    setAutoLogoutMinutes(minutes);

                    localStorage.setItem("autoLogoutMinutes", String(minutes));
                  }}
                />,
                "ADMIN",
              )}
            />

            {/* NOT FOUND */}

            <Route path="*" element={<NoSuchPage />} />
          </Route>
        </Routes>
      </Suspense>

      {/* GLOBAL MODALS */}

      <ModalManager />

      {/* AUTO LOGOUT */}

      {isAuthenticated && autoLogoutEnabled && (
        <AutoLogoutHandler timeout={autoLogoutMinutes * 60 * 1000} />
      )}

      {/* GLOBAL TOAST NOTIFICATIONS */}
      <Toaster
        containerStyle={{
          zIndex: 1500,
        }}
      />
    </div>
  );
}

export default App;
