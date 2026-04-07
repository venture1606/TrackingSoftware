import React, { useState } from "react";
import { Icon } from "@iconify/react";

// Importing Api
import Auth from "../services/Auth";

// Importing the styles.
import "../styles/login.css";
import Loading from "../hooks/Loading";
import Logo from "../assets/logo.jpg";

function Login() {
  const { handleLogin, loading } = Auth();

  // Form state
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    handleLogin(form);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="LoginContainer">
      <form className="LoginForm" onSubmit={handleLoginSubmit}>
        <div className="LoginHeader">
          <img src={Logo} alt="ADL Logo" className="LoginLogo" />
          <h2>Welcome Back</h2>
          <p>Please enter your details to sign in</p>
        </div>
        <div className="InputGroup">
          <label>Business Email</label>
          <div className="InputWithIcon">
            <Icon icon="mdi:email-outline" className="InputIcon" />
            <input
              type="email"
              name="email"
              placeholder="email@adlhre.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="InputGroup">
          <label>Password</label>
          <div className="InputWithIcon">
            <Icon icon="mdi:lock-outline" className="InputIcon" />
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <button type="submit" className="PrimaryButton">
          Sign In
        </button>
        <div className="LoginFooter">
          <p
            style={{
              fontSize: "0.85rem",
              color: "#64748b",
              textAlign: "center",
              marginTop: "1rem",
            }}
          >
            Internal Enterprise Resources Tracking Software
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;
