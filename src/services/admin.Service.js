import api from "./api"

async function getAdminStats() {
  const response = await api.get("/admin/stats")
  return response.data
}

async function getUsers() {
  const response = await api.get("/admin/users")
  return response.data
}

async function getServices() {
  const response = await api.get("/admin/services")
  return response.data
}

async function getOrders() {
  const response = await api.get("/admin/orders")
  return response.data
}

async function getReviews() {
  const response = await api.get("/admin/reviews")
  return response.data
}

async function updateUserRole(userId, role) {
  const response = await api.put(`/admin/users/${userId}/role`, { role })
  return response.data
}

async function deleteUser(userId) {
  const response = await api.delete(`/admin/users/${userId}`)
  return response.data
}

async function deleteService(serviceId) {
  const response = await api.delete(`/admin/services/${serviceId}`)
  return response.data
}

async function deleteOrder(orderId) {
  const response = await api.delete(`/admin/orders/${orderId}`)
  return response.data
}

async function deleteReview(reviewId) {
  const response = await api.delete(`/admin/reviews/${reviewId}`)
  return response.data
}

export {
  getAdminStats,
  getUsers,
  getServices,
  getOrders,
  getReviews,
  updateUserRole,
  deleteUser,
  deleteService,
  deleteOrder,
  deleteReview,
}