import { Navigate, Outlet } from "react-router-dom";
import parseJwt from "../../utils/checkToken";
export default function ProtectedRoutes() {
  const token = localStorage.getItem("authToken");
  if (token !== null) {
    parseJwt(token);
  }
  return token !== null && token !== "" ? <Outlet /> : <Navigate to="/" />;
}
