import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_BACKEND_URL

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      setMessageColor("red");
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessageColor("green");
        setMessage(
          data.message || "Login successful! Redirecting to dashboard..."
        );
        localStorage.setItem("token", data.token);
        setIsAuthenticated(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setMessageColor("red");
        setMessage(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessageColor("red");
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <section className="form-container">
      <h2>
        <i
          className="fa-solid fa-sign-in-alt"
          style={{ color: "#d97706", marginRight: "0.5rem" }}
        ></i>
        Welcome Back
      </h2>
      <p className="form-subtitle">
        <i className="fa-solid fa-leaf" style={{ color: "#059669" }}></i>
        Continue your eco-journey by logging into your account.
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">
          <i
            className="fa-solid fa-envelope"
            style={{ color: "#d97706", marginRight: "0.5rem" }}
          ></i>
          Email Address
        </label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">
          <i
            className="fa-solid fa-lock"
            style={{ color: "#d97706", marginRight: "0.5rem" }}
          ></i>
          Password
        </label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className="btn">
          <i className="fa-solid fa-sign-in-alt"></i>
          Login to Dashboard
        </button>

        {message && (
          <p className="form-message" style={{ color: messageColor }}>
            {message}
          </p>
        )}
      </form>

      <p className="form-alt">
        <i className="fa-solid fa-user-plus" style={{ color: "#d97706" }}></i>
        Don't have an account? <Link to="/register">Create one here</Link>
      </p>
    </section>
  );
};

export default Login;
