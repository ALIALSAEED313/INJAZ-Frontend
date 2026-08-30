import { useState } from "react";
import { useNavigate } from "react-router";
import { signUp } from "../services/authService";

function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConf: "",
    accountType: "buyer",
  });
  const [submitting, setSubmitting] = useState(false);

  const { username, email, password, passwordConf, accountType } = formData;

  function handleChange(event) {
    setError("");
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      await signUp({
        username,
        email,
        password,
        passwordConf,
        isSeller: accountType === "seller",
      });
      navigate("/sign-in");
    } catch (err) {
      setError(err.response?.data?.message || "Sign up failed");
      setSubmitting(false);
    }
  }

  function isFormInvalid() {
    return !(username && email && password && password === passwordConf);
  }

  return (
    <main>
      <h1>Sign Up</h1>

      <p className="error">{error}</p>
      <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            name="username"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            name="email"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="accountType">I am joining as a:</label>
          <select
            id="accountType"
            name="accountType"
            value={accountType}
            onChange={handleChange}
            required
          >
            <option value="buyer">Buyer (Looking to hire)</option>
            <option value="seller">Freelancer / Seller (Offering services)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            name="password"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm">Confirm Password:</label>
          <input
            type="password"
            id="confirm"
            value={passwordConf}
            name="passwordConf"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <button className="btn btn-primary" disabled={isFormInvalid() || submitting}>
            {submitting ? "Signing up..." : "Sign Up"}
          </button>

          <button className="btn btn-primary" type="button" onClick={() => navigate("/")}>
            Cancel
          </button>
        </div>
      </form>
      </div>
    </main>
  );
}

export default Signup;
