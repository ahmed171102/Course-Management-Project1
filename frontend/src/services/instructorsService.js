import apiClient from "./apiClient";

export async function getInstructors(pageNumber = 1, pageSize = 50) {
  const res = await apiClient.get("/instructors", {
    params: { pageNumber, pageSize },
  });
  return res.data;
}

export async function getInstructorById(id) {
  const res = await apiClient.get(`/instructors/${id}`);
  return res.data;
}

export async function createInstructor(payload) {
  const res = await apiClient.post("/instructors", payload);
  return res.data;
}

export async function updateInstructor(id, payload) {
  await apiClient.put(`/instructors/${id}`, payload);
}

export async function deleteInstructor(id) {
  await apiClient.delete(`/instructors/${id}`);
}
