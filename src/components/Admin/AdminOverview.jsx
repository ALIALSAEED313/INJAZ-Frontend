function AdminOverview({ stats }) {
  return (
    <section>
      <h2>Statistics</h2>

      <p>Users: {stats?.users}</p>
      <p>Freelancers: {stats?.sellers}</p>
      <p>Services: {stats?.services}</p>
      <p>Orders: {stats?.orders}</p>
      <p>Reviews: {stats?.reviews}</p>
    </section>
  );
}

export default AdminOverview;