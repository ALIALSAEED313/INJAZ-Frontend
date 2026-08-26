import { Link } from "react-router";

function Footer() {
  return (
    <footer>
      <div>
        <h2>injazFreelanceHub</h2>
        <p>Connect with skilled freelancers and get your work done.</p>
      </div>

      <div>
        <h3>Quick Links</h3>

        <Link to="/">Home</Link>
        <Link to="/services">Services</Link>
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms & Conditions</Link>
      </div>

      <div>
        <h3>Contact</h3>
        <p>support@injaz.com</p>
      </div>

      <div>
        <p>© 2026 InjazFreelanceHub. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
