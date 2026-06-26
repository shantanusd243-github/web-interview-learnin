import apiClient from './client'; // Ensure this points to your configured Axios instance

export const analyzeJobDescription = async (jdText) => {
  try {
    const response = await apiClient.post('/v1/dashboard/analyze-jd', {
      jobDescription: jdText
    });
    return response.data; // This returns the perfectly formatted AI JSON
  } catch (error) {
    console.error("Failed to analyze JD:", error);
    throw new Error(error.response?.data?.message || "Failed to analyze Job Description.");
  }
};

// NEW: Trigger the async backend process
export const triggerJdAnalysisAsync = async (jdText) => {
    const response = await apiClient.post('/v1/dashboard/analyze-jd-async', { jobDescription: jdText });
    return response.data;
};

// NEW: Fetch the saved AI plan on dashboard load
export const getAiPlan = async () => {
    const response = await apiClient.get('/v1/dashboard/ai-plan');
    return response;
};