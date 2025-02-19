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

function App() {
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
          {/* Страница 404 */}
          <Route path="*" element={<NoSuchPage />} />
        </Route>
      </Routes>
    </div>      
    
  )
}

export default App
