import './App.css'
import Layout from "./components/Layout"

import { Route, Routes } from 'react-router-dom';
import NoSuchPage from './components/NoSuchPage';
import Home from './components/Home';
import Register from './components/Register';
import LoginForm from './components/Login';

function App() {
  

  return (
    
    <div className="App"  style={{ textAlign: "center", marginTop: "50px" }}>
      <Routes>
        <Route path = "/" element = {<Layout/>} > 
        <Route path="register" element={<Register />} /> 
        <Route path="login" element={<LoginForm />} /> 
        <Route index element={<Home />} />                  
        <Route path="*" element={<NoSuchPage />} />
        </Route>
      </Routes>
    </div>      
    
  )
}

export default App
