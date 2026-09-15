import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})


export const createProfile = async (profileData) => {
    const response = await api.post("/api/profile", profileData);
    return response.data;
};


export const getProfile = async () => {
    const response = await api.get("/api/profile");
    return response.data;
}


export const updateProfile = async (profileData) => {
    const response = await api.put("/api/profile", profileData);
    return response.data;
};


export const deleteProfile = async () => {
  const response = await api.delete("/api/profile");
  return response.data;
};