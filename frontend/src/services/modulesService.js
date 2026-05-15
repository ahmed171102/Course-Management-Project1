import apiClient from "./apiClient";

export async function getCourseModules(courseId) {
  const res = await apiClient.get(`/courses/${courseId}/modules`);
  return res.data;
}

export async function createModule(courseId, data) {
  const res = await apiClient.post(`/courses/${courseId}/modules`, data);
  return res.data;
}

export async function deleteModule(id) {
  await apiClient.delete(`/modules/${id}`);
}
