const API_BASE_URL = 'http://127.0.0.1:8000';

export interface HealthResponse {
  status: string;
  service: string;
}

/**
 * Performs GET /health request to FastAPI backend (OpsPilot API).
 */
export const checkBackendHealth = async (): Promise<HealthResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }
    const data: HealthResponse = await response.json();
    return data;
  } catch (error) {
    console.warn('OpsPilot API connection note:', error);
    return null;
  }
};
