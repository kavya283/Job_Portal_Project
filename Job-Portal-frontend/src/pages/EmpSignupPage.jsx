import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { useState } from "react";

const EmpSignupPage = () => {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/signup", {
        companyName,
        email,
        password,
        role: "employer"
      });
      navigate("/emplogin");
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="login-wrapper">
      <motion.div
        className="custom-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Employer Signup
        </motion.h2>

        <form onSubmit={handleSignup}>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            className="form-input mb-3"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            className="form-input mb-3"
            placeholder="Email"
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
            className="primary-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign up
          </motion.button>
        </form>

        <p>
          Already have an account?{" "}
          <Link to="/emplogin">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default EmpSignupPage;
