import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_BACKEND_URL

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
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

    const { username, email, password } = formData;
    setMessage("");

    if (!username || !email || !password) {
      setMessage("Please fill in all fields.");
      setMessageColor("red");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      setMessageColor("red");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          data.message || "Registration successful! Redirecting to login..."
        );
        setMessageColor("green");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage(data.message || "Registration failed. Please try again.");
        setMessageColor("red");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again later.");
      setMessageColor("red");
    }
  };

  return (
    <section className="form-container">
      <h2>
        <i
          className="fa-solid fa-seedling"
          style={{ color: "#059669", marginRight: "0.5rem" }}
        ></i>
        Join Our Eco Community
      </h2>
      <p className="form-subtitle">
        <i
          className="fa-solid fa-earth-americas"
          style={{ color: "#d97706" }}
        ></i>
        Start your journey towards a more sustainable lifestyle today.
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="username">
          <i
            className="fa-solid fa-user"
            style={{ color: "#d97706", marginRight: "0.5rem" }}
          ></i>
          Username
        </label>
        <input
          type="text"
          id="username"
          placeholder="Choose a unique username"
          value={formData.username}
          onChange={handleChange}
          required
        />

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
          placeholder="Enter your email address"
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
          placeholder="Create a secure password (min. 8 characters)"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="8"
        />

        <button type="submit" className="btn">
          <i className="fa-solid fa-rocket"></i>
          Start Tracking My Footprint
        </button>
      </form>

      {message && (
        <p className="form-message" style={{ color: messageColor }}>
          {message}
        </p>
      )}

      <p className="form-alt">
        <i className="fa-solid fa-sign-in-alt" style={{ color: "#d97706" }}></i>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </section>
  );
};

export default Register;
