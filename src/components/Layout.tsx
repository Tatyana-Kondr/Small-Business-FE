import { Outlet } from 'react-router-dom'
import HeaderApp from './HeaderApp'
import FooterApp from './FooterApp'

export default function Layout() {
  return (
    <>
        <HeaderApp />
        <Outlet/>
        <FooterApp/>
    </>
  )
}