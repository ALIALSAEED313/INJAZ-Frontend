function AdminOrders({
  orders,
  filteredOrders,
  orderSearch,
  setOrderSearch,
  orderStatusFilter,
  setOrderStatusFilter,
  orderStatuses,
  setDeleteConfirm,
}) {
  return (
    <section>
      <h2>Orders</h2>

      <p>
        Showing: {filteredOrders.length} of {orders.length}
      </p>

      <input
        type="text"
        placeholder="Search orders..."
        value={orderSearch}
        onChange={(event) => setOrderSearch(event.target.value)}
      />

      <select
        value={orderStatusFilter}
        onChange={(event) => setOrderStatusFilter(event.target.value)}
      >
        <option value="all">All Statuses</option>

        {orderStatuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      {filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        filteredOrders.map((order) => (
          <div key={order._id}>
            <p>
              <strong>Service:</strong> {order.service?.title || "Unknown"}
            </p>

            <p>
              <strong>Buyer:</strong>{" "}
              {order.buyer?.name || order.buyer?.username || "Unknown"}
            </p>

            <p>
              <strong>Seller:</strong>{" "}
              {order.seller?.name || order.seller?.username || "Unknown"}
            </p>

            <p>
              <strong>Status:</strong> {order.status}
            </p>

            <button
              type="button"
              onClick={() =>
                setDeleteConfirm({
                  type: "order",
                  id: order._id,
                  name: order.service?.title || "this order",
                })
              }
            >
              Delete Order
            </button>

            <hr />
          </div>
        ))
      )}
    </section>
  );
}

export default AdminOrders;
