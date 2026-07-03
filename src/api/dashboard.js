import apiClient from './client'; // Ensure this points to your configured Axios instance

// NEW: Trigger the async backend process
export const triggerJdAnalysisAsync = async (jdText) => {
    // Let the error bubble up exactly as it is to the DashboardPage
    const response = await apiClient.post('/v1/dashboard/analyze-jd-async', { jobDescription: jdText });
    return response.data;
};

// NEW: Fetch the saved AI plan on dashboard load
export const getAiPlan = async () => {
    const response = await apiClient.get('/v1/dashboard/ai-plan');
    return response;
};

// NEW: Fetch the history of analyzed JDs
export const getJdHistory = async () => {
    const response = await apiClient.get('/v1/dashboard/jd-history');
    return response.data;
};

// NEW: Switch the active JD analysis
export const switchActiveJd = async (planId) => {
    const response = await apiClient.post(`/v1/dashboard/jd-history/${planId}/activate`);
    return response.data;
};