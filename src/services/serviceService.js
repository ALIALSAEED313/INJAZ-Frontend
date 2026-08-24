import axios from "axios";

export async function searchServices(search) {
  const response = await axios.get(
    `http://localhost:3000/services?search=${encodeURIComponent(search)}`,
  );

  return response.data;
}

export async function getServicesByCategory(category) {
  const response = await axios.get(
    `http://localhost:3000/services?category=${encodeURIComponent(category)}`,
  );

  return response.data;
}
