import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedAuth({ auth }) {
  const token = localStorage.getItem("authToken");

  return token !== null && token !== "" ? (
    <Navigate to="/profile" />
  ) : (
    <Outlet />
  );
}
