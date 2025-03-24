import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedAuth({ auth }) {
  const user = localStorage.getItem("user");

  return user !== null && user !== "" ? <Navigate to="/" /> : <Outlet />;
}
