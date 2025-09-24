import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Home from "./components/Home"
import Login from "./components/Login"
import Register from "./components/Register"
import Dashboard from "./pages/Dashboard"
import Navbar from "./components/Navbar"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Router>
      <div className="App">
        <Navbar isAuthenticated={isAuthenticated} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App








// export default function App() {
//   return (
//     <>
//       <nav className="navbar">
//         <div className="logo">
//           <i
//             className="fa-solid fa-leaf"
//             style={{ color: "#d97706", marginRight: "0.5rem" }}
//           ></i>
//           Footprint Logger
//         </div>
//         <ul className="nav-links">
//           <li>
//             <a href="#" id="homeBtn">
//               <i className="fa-solid fa-house"></i> Home
//             </a>
//           </li>
//           <li>
//             <a href="register.html">
//               <i className="fa-solid fa-user-plus"></i> Register
//             </a>
//           </li>
//           <li>
//             <a href="login.html">
//               <i className="fa-solid fa-sign-in-alt"></i> Login
//             </a>
//           </li>
//         </ul>
//       </nav>

//       <header className="hero">
//         <h1>
//           <i
//             className="fa-solid fa-seedling"
//             style={{ color: "#059669", marginRight: "1rem" }}
//           ></i>
//           Track Your Carbon Footprint
//         </h1>
//         <p>
//           Join our community of eco-conscious individuals committed to making a
//           positive environmental impact. Get personalized insights, track your
//           progress, and compete with others to reduce your carbon footprint.
//         </p>
//         <a href="register.html" className="btn">
//           <i className="fa-solid fa-rocket"></i> Start Your Eco Journey
//         </a>
//       </header>

//       <section className="features">
//         <div className="feature">
//           <h2>
//             <i
//               className="fa-solid fa-chart-line"
//               style={{ color: "#d97706" }}
//             ></i>{" "}
//             Smart Tracking
//           </h2>
//           <p>
//             Effortlessly log daily activities like transportation, energy use,
//             and dietary choices to accurately measure your environmental impact.
//           </p>
//         </div>
//         <div className="feature">
//           <h2>
//             <i className="fa-solid fa-trophy" style={{ color: "#d97706" }}></i>{" "}
//             Eco Leaderboard
//           </h2>
//           <p>
//             Compare your progress with fellow users and climb the ranks by
//             reducing your carbon footprint.
//           </p>
//         </div>
//         <div className="feature">
//           <h2>
//             <i className="fa-solid fa-fire" style={{ color: "#d97706" }}></i>{" "}
//             Progress Streaks
//           </h2>
//           <p>
//             Stay motivated with weekly progress tracking and achievement
//             streaks, and personalized insights to maintain your sustainable
//             lifestyle
//           </p>
//         </div>
//       </section>

//       <footer className="footer">
//         <p>&copy; 2025 Carbon Footprint Logger. All rights reserved.</p>
//       </footer>
//     </>
//   );
// }
