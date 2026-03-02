import axios from "axios";

// Backend base URL
const API_URL = "http://localhost:5000/api/auth";

// Register API
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(
      `${API_URL}/register`,
      userData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Registration failed" };
  }
};

// Login API
export const loginUser = async (userData) => {
  try {
    const response = await axios.post(
      `${API_URL}/login`,
      userData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Save token in localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Get logged-
