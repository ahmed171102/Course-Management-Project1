import apiClient from "./apiClient";

export async function getEnrollments() {
  const res = await apiClient.get("/enrollments");
  return res.data;
}

export async function getStudentEnrollments(studentId) {
  const res = await apiClient.get(`/enrollments/student/${studentId}`);
  return res.data;
}

export async function getCourseEnrollments(courseId) {
  const res = await apiClient.get(`/enrollments/course/${courseId}`);
  return res.data;
}

export async function createEnrollment(studentId, courseId) {
  const res = await apiClient.post("/enrollments", { studentId, courseId });
  return res.data;
}

export async function deleteEnrollment(studentId, courseId) {
  await apiClient.delete(`/enrollments/${studentId}/${courseId}`);
}
