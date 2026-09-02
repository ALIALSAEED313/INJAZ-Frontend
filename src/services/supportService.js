import api from "./api";

export async function askAiSupport({ message, conversation, page }) {
  const response = await api.post("/support/ai", { message, conversation, page });
  return response.data;
}
