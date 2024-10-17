import { Outlet, Navigate } from "react-router-dom"

const ProtectedRoutes = () => {
  const cookie = document.cookie.match(/user_id=([^;]*)/);
  const user_id = cookie ? cookie[1] : ''
  return user_id ? <Outlet/> : <Navigate to='/login'/>
}

export default ProtectedRoutes