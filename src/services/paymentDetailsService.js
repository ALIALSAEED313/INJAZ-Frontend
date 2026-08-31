import api from "./api";

async function getPaymentDetails() {
  const response = await api.get("/payment-details");
  return response.data;
}

async function createPaymentDetails(payload) {
  const response = await api.post("/payment-details", payload);
  return response.data;
}

async function updatePaymentDetails(payload) {
  const response = await api.put("/payment-details", payload);
  return response.data;
}

async function deletePaymentDetails() {
  const response = await api.delete("/payment-details");
  return response.data;
}

export {
  getPaymentDetails,
  createPaymentDetails,
  updatePaymentDetails,
  deletePaymentDetails,
};
