import "../styles/Auth.css";
import { API } from "../services/api";
import { useState } from "react";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post("/auth/register", form);
    alert("Registered Successfully");
  };

  return (
    <div className="auth-wrapper blue">
      <form className="auth-box" onSubmit={handleSubmit}>
        <h2>Welcome!</h2>
        <input
          placeholder="Your name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Your e-mail"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Create password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button>Create account</button>
      </form>
    </div>
  );
}

export default Register;
