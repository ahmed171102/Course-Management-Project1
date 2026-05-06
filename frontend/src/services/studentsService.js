import apiClient from "./apiClient";

export async function getStudents() {
  const res = await apiClient.get("/students");
  return res.data;
}

export async function getStudentById(id) {
  const res = await apiClient.get(`/students/${id}`);
  return res.data;
}

export async function createStudent(payload) {
  const res = await apiClient.post("/students", payload);
  return res.data;
}

export async function updateStudent(id, payload) {
  await apiClient.put(`/students/${id}`, payload);
}

export async function deleteStudent(id) {
  await apiClient.delete(`/students/${id}`);
}
