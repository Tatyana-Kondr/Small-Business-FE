import './App.css'
import Layout from "./components/Layout"

import { Route, Routes } from 'react-router-dom';
import NoSuchPage from './components/NoSuchPage';
import Home from './components/Home';

function App() {
  

  return (
    
    <div className="App"  style={{ textAlign: "center", marginTop: "50px" }}>
      <Routes>
        <Route path = "/" element = {<Layout/>} >   
          <Route index element={<Home />} />                  
          <Route path="*" element={<NoSuchPage />} />
        </Route>
      </Routes>
    </div>      
    
  )
}

export default App
