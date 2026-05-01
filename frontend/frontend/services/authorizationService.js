import apiClient from "./apiClient";

export async function login(username, password) {
    const res =await apiClient.post("/auth/login", { username, password });
    
    return res.data;
}

export function saveToken(token)
{
    localStorage.setItem("accessToken", token);
}

export function logout() {
    localStorage.removeItem("accessToken");
}