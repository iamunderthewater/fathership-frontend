import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../App";

const ProtectedRoute = () => {
  const { userAuth } = useContext(UserContext);

  // Check if user is logged in
  const isLoggedIn = !!userAuth?.access_token;

  return isLoggedIn ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;