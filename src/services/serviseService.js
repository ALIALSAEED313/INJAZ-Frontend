import axios from "axios";

const BASE_URL = "http://localhost:3000/services";

export async function searchServices(search) {
  const response = await axios.get(`${BASE_URL}?search=${search}`);
  return response.data;
}
