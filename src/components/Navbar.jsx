import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { logout, user } = useAuth();

  return (
    <nav>
      <Link to="/">FreelanceHub</Link>

      <div>
        <Link to="/">Home</Link>
        <Link to="/services">Services</Link>

        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={logout}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/sign-up">Sign Up</Link>
            <Link to="/sign-in">Sign In</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
