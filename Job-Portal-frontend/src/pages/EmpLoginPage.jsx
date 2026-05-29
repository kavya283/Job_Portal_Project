import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import "../assets/index.css";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";

const EmpLoginPage = () => {
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
        role: "employer",
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user", JSON.stringify(user));

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      navigate("/employer/home");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper">
      <motion.div
        className="custom-card"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Employer Login
        </motion.h2>

        {/* OAuth */}
        <motion.div
          className="d-flex flex-column gap-2 mb-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } }
          }}
        >
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="http://localhost:5000/api/auth/google"
            className="social-btn google-btn text-decoration-none"
          >
            <FcGoogle size={20} /> Continue with Google
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="http://localhost:5000/api/auth/linkedin"
            className="social-btn linkedin-btn text-decoration-none"
          >
            <FaLinkedin size={18} /> Continue with LinkedIn
          </motion.a>
        </motion.div>

        <div className="divider">
          <span>Or continue with email</span>
        </div>

        <form onSubmit={handleLogin}>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            className="form-input mb-3"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="password"
            className="form-input mb-4"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <motion.button
            type="submit"
            className="primary-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </motion.button>
        </form>

        <p>
          Don’t have an account?{" "}
          <Link to="/empsignup">Create an account</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default EmpLoginPage;
