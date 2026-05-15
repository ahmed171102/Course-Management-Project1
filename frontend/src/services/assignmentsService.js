import apiClient from "./apiClient";

export async function createAssignment(moduleId, data) {
  const res = await apiClient.post(`/modules/${moduleId}/assignments`, data);
  return res.data;
}

export async function deleteAssignment(id) {
  await apiClient.delete(`/assignments/${id}`);
}

export async function submitAssignment(id, content) {
  const res = await apiClient.post(`/assignments/${id}/submit`, { content });
  return res.data;
}

export async function getSubmissions(id) {
  const res = await apiClient.get(`/assignments/${id}/submissions`);
  return res.data;
}

export async function gradeSubmission(id, score, feedback) {
  const res = await apiClient.put(`/submissions/${id}/grade`, { score, feedback });
  return res.data;
}
