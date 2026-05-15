import apiClient from "./apiClient";

export async function login(username, password) {
  const res = await apiClient.post("/authentication/login", { username, password });
  return res.data;
}

export async function register(username, email, password, role = "User") {
  const res = await apiClient.post("/authentication/register", {
    username,
    email,
    password,
    role,
  });
  return res.data;
}

export async function changePassword(currentPassword, newPassword) {
  const res = await apiClient.post("/authentication/change-password", { currentPassword, newPassword });
  return res.data;
}

export function saveAuthData(data) {
  localStorage.setItem("accessToken", data.token);
  localStorage.setItem("userRole", data.role || "User");
  localStorage.setItem("username", data.username || "");
  localStorage.setItem("userEmail", data.email || "");
}

export function getUserRole() {
  return localStorage.getItem("userRole");
}

export function getUsername() {
  return localStorage.getItem("username");
}

export function getUserEmail() {
  return localStorage.getItem("userEmail");
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("username");
  localStorage.removeItem("userEmail");
}

export function getCurrentUser() {
  return {
    token: localStorage.getItem("accessToken"),
    role: localStorage.getItem("userRole"),
    username: localStorage.getItem("username"),
    email: localStorage.getItem("userEmail"),
  };
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("accessToken"));
}