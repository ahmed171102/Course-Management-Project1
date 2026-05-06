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

export function saveAuthData(data) {
  localStorage.setItem("accessToken", data.token);
  localStorage.setItem("userRole", data.role || "User");
  localStorage.setItem("username", data.username || "");
}

export function getUserRole() {
  return localStorage.getItem("userRole");
}

export function getUsername() {
  return localStorage.getItem("username");
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("username");
}

export function getCurrentUser() {
  return {
    token: localStorage.getItem("accessToken"),
    role: localStorage.getItem("userRole"),
    username: localStorage.getItem("username"),
  };
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("accessToken"));
}