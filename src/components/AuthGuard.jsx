import { Navigate } from "react-router-dom"

const isTokenValid = (token) => {
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) // decode JWT payload
    const expiry = payload.exp * 1000 // convert seconds → ms
    return Date.now() < expiry
  } catch (err) {
    return false
  }
}

const AuthGuard = ({ children }) => {
  const token = localStorage.getItem("token")

  if (!token || !isTokenValid(token)) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default AuthGuard
