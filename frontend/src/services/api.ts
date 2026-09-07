import { ApiResponse, SystemStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function fetchHealth(): Promise<ApiResponse<SystemStatus>> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API health check failed with status: ${response.status}`);
  }

  return response.json();
}
