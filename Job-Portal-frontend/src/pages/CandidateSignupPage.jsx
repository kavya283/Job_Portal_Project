import { Link, useNavigate } from "react-router-dom";
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
      await api.post("/auth/signup", { name, email, password, role: "candidate" });
      navigate("/candidate/login");
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="custom-card">
        <h2 className="text-center mb-4">Job Seeker Signup</h2>
        <form onSubmit={handleSignup}>
          <input type="text" required className="form-input mb-3" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="email" required className="form-input mb-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" required className="form-input mb-4" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="primary-btn">Sign up</button>
        </form>
        <p className="text-center mt-4">Already have an account? <Link to="/candidate/login">Log in</Link></p>
      </div>
    </div>
  );
};
export default CandidateSignupPage;