import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // 🔐 Not logged in → go to correct login page
  if (!token) {
    return (
      <Navigate
        to={role === "employer" ? "/emplogin" : "/candidate/login"}
        replace
      />
    );
  }

  // ⚠️ Token exists but role missing (corrupted storage)
  if (!userRole) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  // 🚫 Logged in but wrong role → redirect to correct dashboard
  if (role && userRole !== role) {
    return (
      <Navigate
        to={
          userRole === "employer"
            ? "/employer/home"
            : "/candidate/home"
        }
        replace
      />
    );
  }

  // ✅ Authorized
  return children;
};

export default ProtectedRoute;
