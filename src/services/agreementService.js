import api from "./api";

export const getCurrentAgreement = () => api.get("/agreements/current").then(r => r.data.agreement);
export const getAgreementById = id => api.get(`/agreements/by-id/${id}`).then(r => r.data.agreement);
export const getAgreementStatus = () => api.get("/agreements/my-status").then(r => r.data);
export const getAgreementHistory = () => api.get("/agreements/my-history").then(r => r.data.history);
export const acceptAgreement = agreementId => api.post("/agreements/accept", { agreementId }).then(r => r.data);
export const getAdminAgreements = () => api.get("/agreements/admin").then(r => r.data.agreements);
export const getAdminAgreement = id => api.get(`/agreements/admin/${id}`).then(r => r.data);
export const createAgreement = data => api.post("/agreements/admin", data).then(r => r.data.agreement);
export const updateAgreement = (id, data) => api.put(`/agreements/admin/${id}`, data).then(r => r.data.agreement);
export const createAgreementNewVersion = (id, data) => api.post(`/agreements/admin/${id}/new-version`, data).then(r => r.data.agreement);
export const seedDefaultAgreement = () => api.post("/agreements/admin/seed-defaults").then(r => r.data);
export const publishAgreement = id => api.post(`/agreements/admin/${id}/publish`).then(r => r.data.agreement);
export const unpublishAgreement = id => api.post(`/agreements/admin/${id}/unpublish`).then(r => r.data.agreement);
