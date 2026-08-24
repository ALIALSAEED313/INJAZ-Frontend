import { Link } from "react-router";

function Footer() {
  return (
    <footer>
      <div>
        <h2>FreelanceHub</h2>
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
        <p>support@freelancehub.com</p>
      </div>

      <div>
        <p>© 2026 FreelanceHub. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
