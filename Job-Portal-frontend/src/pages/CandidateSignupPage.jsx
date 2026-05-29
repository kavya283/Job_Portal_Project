import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../assets/index.css";
import api from "../api/axios";
import { useState } from "react";

const CandidateSignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/signup", {
        name,
        email,
        password,
        role: "candidate"
      });
      navigate("/candidate/login");
    } catch (error) {
      alert("Signup failed");
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
          Job Seeker Signup
        </motion.h2>

        <form onSubmit={handleSignup}>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            className="form-input mb-3"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <Link to="/candidate/login">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default CandidateSignupPage;
