const Header = ({ username }) => (
  <header className="container">
    <h1>
      <i
        className="fa-solid fa-chart-line"
        style={{ color: "#d97706", marginRight: "0.5rem" }}
      ></i>
      Welcome, <span>{username}</span>!
    </h1>
    <p>
      Track your carbon footprint and make a positive impact on our planet every
      day.
    </p>
  </header>
);

export default Header;
