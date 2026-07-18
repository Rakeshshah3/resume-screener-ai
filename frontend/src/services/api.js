import axios from "axios";

// Read the backend URL from the Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create a reusable Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token (if available)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ======================
// Job Services
// ======================

export const jobService = {
  // Get all jobs
  getJobs: async () => {
    const response = await apiClient.get("/jobs/");
    return response.data;
  },

  // Create a new job
  createJob: async (jobData) => {
    const response = await apiClient.post("/jobs/", jobData);
    return response.data;
  },

  // Get recommendations for a job
  getJobRecommendations: async (jobId) => {
    const response = await apiClient.get(
      `/jobs/${jobId}/recommendations`
    );
    return response.data;
  },
};

// ======================
// Resume Services
// ======================

export const resumeService = {
  // Upload Resume
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
      "/resume/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  // Download Resume
  downloadResume: async (resumeId) => {
    const response = await apiClient.get(
      `/resume/download/${resumeId}`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  },
};

export default apiClient;