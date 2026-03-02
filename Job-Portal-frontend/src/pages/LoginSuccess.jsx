import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const role = params.get("role");

    if (!token || !role) {
      navigate("/candidate/login");
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    navigate(role === "employer" ? "/employer/home" : "/candidate/home");
  }, []);

  return <p style={{ padding: 40 }}>Logging you in...</p>;
};

export default LoginSuccess;
