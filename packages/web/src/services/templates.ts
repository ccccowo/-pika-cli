const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Template {
  id: number;
  name: string;
  description?: string;
  owner: string;
  repo: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  author?: {
    username: string;
    displayName?: string;
  };
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  owner: string;
  repo: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface UpdateTemplateData {
  id: number;
  name?: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
}

// 获取我的模板列表
export async function getMyTemplates(): Promise<{ success: boolean; templates: Template[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/my`, {
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
    console.error('获取我的模板失败:', error);
    return { success: false, templates: [] };
  }
}

// 获取公共模板列表
export async function getPublicTemplates(): Promise<{ success: boolean; templates: Template[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/public`, {
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
    console.error('获取公共模板失败:', error);
    return { success: false, templates: [] };
  }
}

// 创建模板
export async function createTemplate(data: CreateTemplateData): Promise<{ success: boolean; template?: Template; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/create`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('创建模板失败:', error);
    return { success: false, error: '创建模板失败' };
  }
}

// 更新模板
export async function updateTemplate(data: UpdateTemplateData): Promise<{ success: boolean; template?: Template; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/update`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('更新模板失败:', error);
    return { success: false, error: '更新模板失败' };
  }
}

// 删除模板
export async function deleteTemplate(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('删除模板失败:', error);
    return { success: false, error: '删除模板失败' };
  }
}

// 验证 GitHub 仓库是否存在
export async function validateGithubRepo(owner: string, repo: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 这里可以调用 GitHub API 来验证仓库是否存在
    // 暂时返回成功，实际实现需要调用 GitHub API
    return { success: true };
  } catch (error) {
    console.error('验证 GitHub 仓库失败:', error);
    return { success: false, error: '验证仓库失败' };
  }
}
