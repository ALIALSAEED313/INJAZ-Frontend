import { useState } from "react";
import { searchServices } from "../services/serviceService";

function Homepage() {
  const [search, setSearch] = useState("");
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");

  const categories = [
    "Web Development",
    "Graphic Design",
    "Digital Marketing",
    "Writing",
    "Video Editing",
  ];

  const steps = [
    {
      title: "Find a Service",
      description: "Search for the service you need.",
    },
    {
      title: "Choose a Freelancer",
      description: "Compare services and choose the right freelancer.",
    },
    {
      title: "Place Your Order",
      description: "Order the service and communicate with the freelancer.",
    },
  ];

  async function handleSearch() {
    if (!search.trim()) {
      return;
    }

    try {
      setError("");

      const data = await searchServices(search);
      setServices(data.services);
    } catch (err) {
      console.log(err);
      setError("Failed to search services");
    }
  }

  return (
    <main>
      <section>
        <div>
          <h1>Find the right freelancer for your project</h1>

          <p>Connect with skilled freelancers and get your work done.</p>

          <div>
            <input
              type="text"
              placeholder="What service are you looking for?"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <button onClick={handleSearch}>Search</button>
          </div>

          {error && <p>{error}</p>}

          <div>
            {services.map((service) => (
              <div key={service._id}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <p>{service.price} BHD</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2>Popular Services</h2>

        <div>
          {categories.map((category) => (
            <div key={category}>
              <h3>{category}</h3>
              <p>Find professional {category.toLowerCase()} services.</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>How It Works</h2>

        <div>
          {steps.map((step, index) => (
            <div key={step.title}>
              <span>{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Homepage;
