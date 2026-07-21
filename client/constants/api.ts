import axios from "axios";
import { Platform } from "react-native";

const BASE_URL =
  Platform.OS === "android"
    ? "http://10.137.182.6:3000/api" // Replace with your PC's IPv4 address
    : Platform.OS === "ios"
    ? "http://10.137.182.6:3000/api"
    : "http://localhost:3000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

export default api;