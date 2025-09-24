import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ isAuthenticated }) => {
  const navigate = useNavigate();

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <i
          className="fa-solid fa-leaf"
          style={{ color: "#d97706", marginRight: "0.5rem" }}
        ></i>
        Footprint Logger
      </div>
      <ul className="nav-links">
        <li>
          <a href="#" onClick={handleHomeClick}>
            <i className="fa-solid fa-home"></i>{" "}
            {isAuthenticated ? "Dashboard" : "Home"}
          </a>
        </li>
        {!isAuthenticated ? (
          <>
            <li>
              <Link to="/register">
                <i className="fa-solid fa-user-plus"></i> Register
              </Link>
            </li>
            <li>
              <Link to="/login">
                <i className="fa-solid fa-sign-in-alt"></i> Login
              </Link>
            </li>
          </>
        ) : (
          <li>
            <a href="#" onClick={handleLogout}>
              <i className="fa-solid fa-sign-out-alt"></i> Logout
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
