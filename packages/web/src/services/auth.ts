const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface User {
  id: number;
  githubId: number;
  username: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  githubUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User | null;
  isAuthenticated?: boolean;
}

// 获取当前用户信息
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return { success: false, user: null };
  }
}

// 检查登录状态
export async function checkAuthStatus(): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/status`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return { success: false, user: null, isAuthenticated: false };
  }
}

// 登出
export async function logout(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('登出失败:', error);
    return false;
  }
}

// 获取 GitHub 登录 URL
export function getGitHubLoginUrl(): string {
  return `${API_BASE_URL}/auth/github`;
}
