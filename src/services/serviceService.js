import axios from "axios";
export async function searchServices(search) {
  const response = await axios.get(
    `http://localhost:3000/services?search=${encodeURIComponent(search)}`,
  );

  console.log("SEARCH RESPONSE:", response.data);

  return response.data;
}
