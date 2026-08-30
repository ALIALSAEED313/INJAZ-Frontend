function AdminServices({
  services,
  filteredServices,
  serviceSearch,
  setServiceSearch,
  setDeleteConfirm,
}) {
  return (
    <section>
      <h2>Services</h2>
      <p>
        Showing: {filteredServices.length} of {services.length}
      </p>
      <input
        type="text"
        placeholder="Search services..."
        value={serviceSearch}
        onChange={(event) => setServiceSearch(event.target.value)}
      />

      {filteredServices.length === 0 ? (
        <p>No services found.</p>
      ) : (
        filteredServices.map((service) => (
          <div key={service._id}>
            <p>
              <strong>Title:</strong> {service.title}
            </p>

            <p>
              <strong>Freelancer:</strong>{" "}
              {service.freelancer?.name ||
                service.freelancer?.username ||
                "Unknown"}
            </p>

            <p>
              <strong>Price:</strong> {service.price}
            </p>

            <button
              type="button"
              onClick={() =>
                setDeleteConfirm({
                  type: "service",
                  id: service._id,
                  name: service.title,
                })
              }
            >
              Delete Service
            </button>

            <hr />
          </div>
        ))
      )}
    </section>
  );
}

export default AdminServices;
