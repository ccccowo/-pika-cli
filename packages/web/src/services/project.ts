import { create } from '@pika-cli/create';
import { initGithubRepo } from '@pika-cli/github';
import type { ProjectOptions, CreateResult } from '../types';

// 创建本地项目
export async function createLocalProject(options: ProjectOptions): Promise<CreateResult> {
  try {
    const result = await create({
      template: options.template,
      name: options.name
    });
    
    return {
      success: true,
      localPath: result.path
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建本地项目失败'
    };
  }
}

// 创建 GitHub 仓库
export async function createGithubRepo(options: ProjectOptions): Promise<CreateResult> {
  try {
    const result = await initGithubRepo({
      private: options.isPrivate,
      description: options.description
    });
    
    return {
      success: true,
      repoUrl: result.repoUrl
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建 GitHub 仓库失败'
    };
  }
}

// 创建项目（根据选项决定创建类型）
export async function createProject(options: ProjectOptions): Promise<CreateResult> {
  try {
    switch (options.createType) {
      case 'local': {
        return await createLocalProject(options);
      }
      case 'github': {
        return await createGithubRepo(options);
      }
      case 'both': {
        const localResult = await createLocalProject(options);
        if (!localResult.success) {
          return localResult;
        }
        
        const githubResult = await createGithubRepo(options);
        if (!githubResult.success) {
          return {
            ...githubResult,
            localPath: localResult.localPath
          };
        }
        
        return {
          success: true,
          localPath: localResult.localPath,
          repoUrl: githubResult.repoUrl
        };
      }
      default:
        throw new Error('无效的创建类型');
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建项目失败'
    };
  }
} 