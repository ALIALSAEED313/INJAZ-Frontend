import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../services/api";

function CreateServicePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    deliveryTime: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      await api.post("/services", {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        deliveryTime: Number(formData.deliveryTime),
        images: [],
      });

      navigate("/dashboard");
    } catch (err) {
      console.log(err);

      setError(err.response?.data?.message || "Failed to create service");

      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Create a Service</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Service Title</label>

          <input
            id="title"
            name="title"
            type="text"
            placeholder="Example: I will build a React website"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="description">Description</label>

          <textarea
            id="description"
            name="description"
            placeholder="Describe the service you are offering"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="category">Category</label>

          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>

            <option value="web development">Web Development</option>

            <option value="graphic design">Graphic Design</option>

            <option value="digital marketing">Digital Marketing</option>

            <option value="writing">Writing</option>

            <option value="video editing">Video Editing</option>
          </select>
        </div>

        <div>
          <label htmlFor="price">Price (BHD)</label>

          <input
            id="price"
            name="price"
            type="number"
            min="0"
            placeholder="10"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="deliveryTime">Delivery Time (days)</label>

          <input
            id="deliveryTime"
            name="deliveryTime"
            type="number"
            min="1"
            placeholder="3"
            value={formData.deliveryTime}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Service"}
        </button>

        <button type="button" onClick={() => navigate("/dashboard")}>
          Cancel
        </button>
      </form>
    </main>
  );
}

export default CreateServicePage;
