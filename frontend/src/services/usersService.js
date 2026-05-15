import apiClient from "./apiClient";

export async function getUsers() {
  const res = await apiClient.get("/users");
  return res.data;
}

export async function updateUser(id, payload) {
  const res = await apiClient.put(`/users/${id}`, payload);
  return res.data;
}

export async function deleteUser(id) {
  await apiClient.delete(`/users/${id}`);
}
