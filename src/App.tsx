import './App.css'
import Layout from "./components/Layout"

import { Navigate, Route, Routes } from 'react-router-dom';
import NoSuchPage from './components/NoSuchPage';
import Home from './components/Home';
import Register from './components/Register';
import LoginForm from './components/Login';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { selectIsAuthenticated, user } from './features/auth/authSlice';
import { useEffect } from 'react';
import Customers from './features/customers/Customers';
import CustomersWithNumber from './features/customers/CustomersWithNumber';
import CustomerCard from './features/customers/CustomerCard';
import CreateCustomer from './features/customers/CreateCustomer';
import ProductCategoryList from './features/products/components/ProductCategoryList';
import CreateProductCategory from './features/products/components/CreateProductCategory';
import ProductCard from './features/products/components/ProductCard';
import useSessionCheck from './hooks/useSessionCheck';


function App() {
  useSessionCheck();
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(user())
    }
  }, [isAuthenticated, dispatch])

  return (
    
    <div className="App"  style={{ textAlign: "center", marginTop: "50px" }}>
      <Routes>
      <Route path="/" element={<Layout />}>
          {/* Если пользователь не авторизован, показываем LoginForm */}
          <Route
            path="login"
            element={isAuthenticated ? <Navigate to="/" /> : <LoginForm />}
          />
          {/* Если пользователь авторизован, показываем Home */}
          <Route
            path="/"
            element={isAuthenticated ? <Home /> : <Navigate to="login" />}
          />
          <Route path="register" element={<Register />} />
          <Route path="lieferanten" element={<Customers />} />
          <Route path="/create-customer" element={<CreateCustomer />} />
          <Route path="kunden" element={<CustomersWithNumber />} />
          <Route path="/customer/:customerId" element={<CustomerCard />} />
          <Route path="/product-card/:productId" element={<ProductCard />} />
          <Route path="/product-categories" element={<ProductCategoryList />} />
          <Route path="/create-product-category" element={<CreateProductCategory />} />
          
          {/* Страница 404 */}
          <Route path="*" element={<NoSuchPage />} />
        </Route>
      </Routes>
    </div>      
    
  )
}

export default App
