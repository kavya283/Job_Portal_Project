import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const role = params.get("role");

    if (token && role) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      
      // Redirect based on the role stored in the database
      if (role === "employer") {
        navigate("/employer/home");
      } else {
        navigate("/candidate/home");
      }
    } else {
      navigate("/candidate/login");
    }
  }, [navigate, location]);

  return <div className="text-center mt-5">Authenticating...</div>;
};

export default LoginSuccess;