import apiClient from "./apiClient";

export async function getCourses() {
  const res = await apiClient.get("/courses");
  return res.data;
}

export async function getCourseById(id) {
  const res = await apiClient.get(`/courses/${id}`);
  return res.data;
}

export async function createCourse(payload) {
  const res = await apiClient.post("/courses", payload);
  return res.data;
}

export async function updateCourse(id, payload) {
  await apiClient.put(`/courses/${id}`, payload);
}

export async function deleteCourse(id) {
  await apiClient.delete(`/courses/${id}`);
}