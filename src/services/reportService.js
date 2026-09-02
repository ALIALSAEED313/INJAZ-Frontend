import api from "./api";

export async function submitReport(payload) {
  const response = await api.post("/reports", payload);
  return response.data;
}

export async function getReports() {
  const response = await api.get("/reports/admin");
  return response.data;
}

export async function updateReportStatus(reportId, status) {
  const response = await api.patch(`/reports/${reportId}/status`, { status });
  return response.data;
}
