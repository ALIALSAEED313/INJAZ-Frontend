import { useState } from "react";
import { Link } from "react-router";
import api from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      
      const response = await api.post("/auth/forgot-password", { email });
      setStatus({ type: "success", text: response.data.message });
      setEmail("");
    } catch (err) {
      setStatus({
        type: "error",
        text: err.response?.data?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ marginTop: "60px" }}>
      <h1 className="page-title" style={{ textAlign: "center" }}>Forgot Password?</h1>
      <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "30px" }}>
        Enter your email address and we will send you a link to reset your password.
      </p>

      {status && (
        <div
          style={{
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "4px",
            backgroundColor: status.type === "success" ? "#d4edda" : "#f8d7da",
            color: status.type === "success" ? "#155724" : "#721c24",
            textAlign: "center",
          }}
        >
          {status.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", marginBottom: "15px" }}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <Link to="/" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Back to Home
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;