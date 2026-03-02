import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../assets/index.css";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";

const CandidateLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        role: "candidate",
      });

      const { token, user } = res.data;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role); // 🔥 REQUIRED
      localStorage.setItem("user", JSON.stringify(res.data.user));

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      navigate("/candidate/home");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="custom-card">
        <h2 className="text-center mb-4">Job Seeker Login</h2>

        {/* OAuth */}
        <div className="d-flex flex-column gap-2 mb-3">
          <a
            href="http://localhost:5000/api/auth/google"
            className="social-btn google-btn text-decoration-none"
          >
            <span className="icon-circle">
              <FcGoogle size={20} />
            </span>
            Continue with Google
          </a>

          <a
            href="http://localhost:5000/api/auth/linkedin"
            className="social-btn linkedin-btn text-decoration-none"
          >
            <span className="icon-circle">
              <FaLinkedin size={18} />
            </span>
            Continue with LinkedIn
          </a>
        </div>

        <div className="divider">
          <span>Or continue with email</span>
        </div>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            required
            className="form-input mb-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />

          <input
            type="password"
            required
            className="form-input mb-4"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />

          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-center mt-3">
          New here? <Link to="/signup">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default CandidateLoginPage;
