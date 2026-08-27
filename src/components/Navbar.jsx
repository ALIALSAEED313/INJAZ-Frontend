import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { logout, user } = useAuth();
  console.log("User Data in navbar:", user)
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">INJAZ</Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/services">Services</Link>

        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {user.isSeller && <Link to="/services/create">Create Service</Link>}
            <Link to="/profile">
              <img
                src={user?.avatarUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWC-v0HrKYp0-av4D0eTZv5hoIHoW35GhmKG2djTVP4Q&s'}
                alt="Profile"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: 'block',
                  border: '2px solid #ccc' // إضافة إطار خفيف لتبدو أجمل
                }}
              />
            </Link>
            <button onClick={logout} className="logout-btn">Sign Out</button>
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
