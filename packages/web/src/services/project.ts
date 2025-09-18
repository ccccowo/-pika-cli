import type { ProjectOptions } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    // 检查响应状态
    if (response.ok) {
      return response;
    }
    
    // 对于 4xx 错误（客户端错误），不重试，直接返回响应
    if (response.status >= 400 && response.status < 500) {
      return response;
    }
    
    // 对于 5xx 错误（服务器错误），可以重试
    if (response.status >= 500) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    // 只有网络错误或 5xx 错误才重试
    if (retries > 0 && (error instanceof TypeError || (error instanceof Error && error.message.includes('5')))) {
      console.log(`重试请求 (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export interface CreateResult {
  success: boolean;
  error?: string;
  projectName: string;
  repoUrl?: string;
  nextSteps: string[];
}

// 选择文件夹 - 直接返回输入的路径
export async function selectFolder(): Promise<string> {
  try {
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite'
    });
    return handle.name;
  } catch (error) {
    console.error('选择文件夹失败:', error);
    throw new Error('选择文件夹失败');
  }
}


// 创建项目（根据选项决定创建类型）
export async function createProject(options: ProjectOptions): Promise<CreateResult> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/project/create`, {
      method: 'POST',
      body: JSON.stringify(options),
    });

    const result = await response.json();
    
    if (!result.success) {
      // 直接返回错误结果，不抛出异常
      return {
        success: false,
        error: result.error || '创建项目失败',
        projectName: options.name,
        nextSteps: []
      };
    }

    return {
      success: true,
      projectName: result.projectName || options.name,
      repoUrl: result.repoUrl,
      nextSteps: result.nextSteps || [
        `git clone ${result.repoUrl}`,
        `cd ${options.name}`,
        'npm install',
        'npm run dev'
      ]
    };
  } catch (error) {
    console.error('创建项目失败:', error);
    // 返回错误结果而不是抛出异常
    return {
      success: false,
      error: error instanceof Error ? error.message : '服务器连接失败，请检查服务器是否正常运行',
      projectName: options.name,
      nextSteps: []
    };
  }
} 