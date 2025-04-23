import { Outlet, useLocation } from 'react-router-dom'
import HeaderApp from './HeaderApp'


export default function Layout() {
  const location = useLocation();

  return (
    <>
         {/* Если пользователь на странице логина, Header не показывается */}
        {location.pathname !== "/login" && <HeaderApp />}
        <Outlet />
        
    </>
  )
}