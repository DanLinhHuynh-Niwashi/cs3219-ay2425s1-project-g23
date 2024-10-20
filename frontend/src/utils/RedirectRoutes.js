import { Outlet, Navigate } from "react-router-dom"

const RedirectRoutes = () => {
  const cookie = document.cookie.match(/user_id=([^;]*)/);
  const user_id = cookie ? cookie[1] : ''
  return user_id ? <Navigate to='/questions' /> : <Outlet/>
}

export default RedirectRoutes