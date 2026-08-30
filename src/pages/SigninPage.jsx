// src/components/SignInForm/SignInForm.jsx

import { useState } from "react";
import { useNavigate } from "react-router";

import { signIn } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const SignInForm = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const signedInUser = await signIn(formData);

      setUser(signedInUser);
      navigate("/dashboard");
    } catch (err) {
      console.log(`Error: ${err}`);
      setError(err?.response?.data?.message);
    }
  }

  return (
    <main>
      <h1>Sign In</h1>
      <p className="error">{error}</p>
      <div className="form-container">
      <form autoComplete="off" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Username:</label>
          <input
            type="text"
            autoComplete="off"
            id="username"
            value={formData.username}
            name="username"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            autoComplete="off"
            id="password"
            value={formData.password}
            name="password"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <button className="btn btn-primary" >Sign In</button>
          <button className="btn btn-primary" onClick={() => navigate("/")}>Cancel</button>
        </div>
      </form>
      </div>
    </main>
  );
};

export default SignInForm;
