// src/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(endpoint: string, method: string = 'GET', body?: any, isFile: boolean = false) {
  // 1. Get the token from storage (if we have one)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // 2. If it is NOT a file upload, we must say we are sending JSON
  if (!isFile) {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    method,
    headers,
    body: isFile ? body : (body ? JSON.stringify(body) : undefined),
  };

  // 3. Send the request
  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // 4. Handle errors (like 401 Unauthorized or 400 Bad Request)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    console.error("API Request Failed:", error);
    throw error;
  }
}