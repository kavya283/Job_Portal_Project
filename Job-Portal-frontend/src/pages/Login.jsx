import "../styles/Auth.css";
import { API } from "../services/api";
import { useState } from "react";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      alert("Login Success");
    } catch (err) {
      alert("Login failed: " + err.response?.data?.msg);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const handleLinkedInLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/linkedin";
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-box" onSubmit={handleLogin}>
        <h2>Log in to your Account</h2>

        <input
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button type="submit">Log in</button>

        <div className="social-login-separator">
          <span>OR</span>
        </div>
        <div className="social-buttons">
          <button 
            type="button" 
            className="google-btn" 
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </button>
          
          <button 
            type="button" 
            className="linkedin-btn" 
            onClick={handleLinkedInLogin}
          >
            Continue with LinkedIn
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;