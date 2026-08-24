function Homepage() {
  const categories = [
    "Web Development",
    "Graphic Design",
    "Digital Marketing",
    "Writing",
    "Video Editing",
  ];

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
            />

            <button>Search</button>
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
      </section>
    </main>
  );
}

export default Homepage;
