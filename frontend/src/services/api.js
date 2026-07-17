import axios from 'axios';

// Set up the base URL pointing directly to your local FastAPI instance
const API_BASE_URL = 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject your JWT auth token to every request if it exists in localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const jobService = {
  /**
   * Fetches all active jobs from the backend database.
   * Maps to your backend endpoint that returns JobResponse[]
   */
  getJobs: async () => {
    const response = await apiClient.get('/jobs/'); 
    return response.data;
  },

  /**
   * Submits a newly created job description to the pipeline.
   * Maps to your backend endpoint that consumes JobCreate and returns JobResponse
   * @param {Object} jobData - { title, company, location, description }
   */
  createJob: async (jobData) => {
    const response = await apiClient.post('/jobs/', jobData);
    return response.data;
  },

  /**
   * Fetches the ranked AI candidate recommendations for a specific job profile.
   * Maps to your backend endpoint returning JobRecommendation[]
   * @param {number} jobId 
   */
  getJobRecommendations: async (jobId) => {
    // 🚀 FIXED: Removed trailing slash to prevent 307 redirects and match @router.get("/{job_id}/recommendations")
    const response = await apiClient.get(`/jobs/${jobId}/recommendations`);
    return response.data;
  }
};

export const resumeService = {
  /**
   * Uploads a candidate PDF resume file to the backend processor.
   * Maps to your POST /resume/upload backend endpoint.
   * @param {File} file - The raw PDF file from the input element or drag-and-drop zone.
   */
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    });
    return response.data;
  },

  /**
   * Downloads a physical resume file from the server.
   * Maps to your GET /resume/download/{resume_id} endpoint.
   * @param {number} resumeId
   */
  downloadResume: async (resumeId) => {
    // 🚀 FIXED: Removed trailing slash to line up exactly with @router.get("/download/{resume_id}")
    const response = await apiClient.get(`/resume/download/${resumeId}`, {
      // Directs Axios to treat the response as binary stream data (PDF preview/download)
      responseType: 'blob', 
    });
    return response.data;
  }
};

export default apiClient;