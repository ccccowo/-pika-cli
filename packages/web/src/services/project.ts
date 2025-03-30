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
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
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
  localPath: string;
  projectName: string;
  framework: string;
  variant: string;
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

// 创建本地项目
export async function createLocalProject(options: ProjectOptions): Promise<CreateResult> {
  try {
    const { default: create } = await import('@pika-cli/create');
    
    // 使用 create 方法创建项目
    const result = await create({
      scaffold: options.scaffold,
      name: options.name,
      targetPath: options.projectPath,
      framework: options.framework,
      variant: options.variant
    });

    return {
      success: true,
      localPath: result.path,
      projectName: options.name,
      framework: options.framework || 'react',
      variant: options.variant || 'typescript',
      nextSteps: [
        `cd ${options.name}`,
        'pnpm install',
        'pnpm run dev'
      ]
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建本地项目失败',
      localPath: '',
      projectName: options.name,
      framework: options.framework || 'react',
      variant: options.variant || 'typescript',
      nextSteps: []
    };
  }
}

// 创建 GitHub 仓库
export async function createGithubRepo(options: ProjectOptions): Promise<CreateResult> {
  try {
    // TODO: 实现 GitHub 仓库创建功能
    throw new Error('GitHub 仓库创建功能暂未实现');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建 GitHub 仓库失败',
      localPath: '',
      projectName: options.name,
      framework: options.framework || 'react',
      variant: options.variant || 'typescript',
      nextSteps: []
    };
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
      throw new Error(result.error || '创建项目失败');
    }

    return {
      success: true,
      localPath: result.localPath,
      projectName: result.projectName || options.name,
      framework: result.framework || options.framework || '',
      variant: result.variant || options.variant || '',
      nextSteps: result.nextSteps || [
        `cd ${options.name}`,
        'pnpm install',
        'pnpm run dev'
      ]
    };
  } catch (error) {
    console.error('创建项目失败:', error);
    throw new Error(error instanceof Error ? error.message : '服务器连接失败，请检查服务器是否正常运行');
  }
} 