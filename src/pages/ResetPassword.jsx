import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import api from "../services/api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", text: "Passwords do not match!" });
      return;
    }

    if (newPassword.length < 6) {
      setStatus({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const response = await api.post(`/auth/reset-password/${token}`, { newPassword });
      setStatus({ type: "success", text: response.data.message });
      
      // توجيه المستخدم لصفحة تسجيل الدخول بعد 3 ثوانٍ
      setTimeout(() => {
        navigate("/");
        // يمكنك فتح نافذة الـ AuthModal هنا إذا أردت
      }, 3000);
      
    } catch (err) {
      setStatus({
        type: "error",
        text: err.response?.data?.message || "Invalid or expired token.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ marginTop: "60px" }}>
      <h1 className="page-title" style={{ textAlign: "center" }}>Create New Password</h1>

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
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Enter new password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm new password"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%" }}
          disabled={loading || status.type === "success"}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;