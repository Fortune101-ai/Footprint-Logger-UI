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