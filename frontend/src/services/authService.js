import apiClient from "./apiClient";
import {
  decodeToken,
  getRoleFromDecodedToken,
  getUsernameFromDecodedToken,
} from "./jwtUtils";

export async function login(username, password) {
  const res = await apiClient.post("/authentication/login", { username, password });
  return res.data;
}


export function saveToken(token) {
  localStorage.setItem("accessToken", token);

  const decoded = decodeToken(token);
  if (decoded) {
    const role = getRoleFromDecodedToken(decoded) || "User";
    const username = getUsernameFromDecodedToken(decoded) || "";

    localStorage.setItem("userRole", role);
    localStorage.setItem("username", username);
  }
}

export function saveUserRole(role) {
  localStorage.setItem("userRole", role);
}

export function getUserRole() {
  return localStorage.getItem("userRole");
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
    username: localStorage.getItem("username")
  };
}