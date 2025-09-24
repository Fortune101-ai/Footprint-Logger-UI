import { Link } from "react-router-dom";

const Home = () => {
  return (
    <>
      <header className="hero">
        <h1>
          <i
            className="fa-solid fa-seedling"
            style={{ color: "#059669", marginRight: "1rem" }}
          ></i>
          Track Your Carbon Footprint
        </h1>
        <p>
          Join our community of eco-conscious individuals committed to making a
          positive environmental impact. Get personalized insights, track your
          progress, and compete with others to reduce your carbon footprint.
        </p>
        <Link to="/register" className="btn">
          <i className="fa-solid fa-rocket"></i>
          Start Your Eco Journey
        </Link>
      </header>

      <section className="features">
        <div className="feature">
          <h2>
            <i
              className="fa-solid fa-chart-line"
              style={{ color: "#d97706" }}
            ></i>{" "}
            Smart Tracking
          </h2>
          <p>
            Effortlessly log daily activities like transportation, energy
            consumption, and dietary choices to accurately measure your
            environmental impact.
          </p>
        </div>
        <div className="feature">
          <h2>
            <i className="fa-solid fa-trophy" style={{ color: "#d97706" }}></i>{" "}
            Eco Leaderboard
          </h2>
          <p>
            Compare your progress with fellow eco-warriors and challenge
            yourself to achieve the lowest carbon footprint in our community
            rankings.
          </p>
        </div>
        <div className="feature">
          <h2>
            <i className="fa-solid fa-fire" style={{ color: "#d97706" }}></i>{" "}
            Progress Streaks
          </h2>
          <p>
            Stay motivated with weekly progress tracking, achievement streaks,
            and personalized insights to maintain your sustainable lifestyle.
          </p>
        </div>
      </section>

      <footer className="footer">
        <p>
          <i className="fa-solid fa-copyright"></i> 2025 Carbon Footprint
          Logger.
          <i className="fa-solid fa-heart" style={{ color: "#059669" }}></i>
          Built with care for our planet.
        </p>
      </footer>
    </>
  );
};

export default Home;
