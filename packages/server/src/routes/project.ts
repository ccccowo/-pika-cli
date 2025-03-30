import { Router } from 'express';
import create from '@pika-cli/create';
import { initGithubRepo } from '@pika-cli/github';
import type { ProjectOptions } from '@pika-cli/types';
import path from 'node:path';

export const router = Router();

// 创建项目
router.post('/create', async (req, res) => {
  try {
    const options: ProjectOptions = req.body;
    
    // 创建本地项目
    const result = await create({
      scaffold: options.scaffold,
      name: options.name,
      targetPath: options.projectPath,
      framework: options.framework,
      variant: options.variant
    });

    // 如果需要创建 GitHub 仓库
    if (options.createGithub && options.token) {
      const githubResult = await initGithubRepo({
        token: options.token,
        projectName: options.name,
        projectPath: result.path,
        description: options.description,
        private: options.isPrivate
      });

      if (!githubResult.success) {
        return res.status(400).json({
          success: false,
          error: githubResult.error,
          localPath: result.path,
          nextSteps: [
            `cd ${options.name}`,
            'pnpm install',
            'pnpm run dev'
          ]
        });
      }

      return res.json({
        success: true,
        localPath: result.path,
        repoUrl: githubResult.repoUrl,
        nextSteps: [
          `cd ${options.name}`,
          'pnpm install',
          'pnpm run dev'
        ]
      });
    }

    // 返回成功响应
    return res.json({
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
    });

  } catch (error) {
    // 返回错误响应
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '创建项目失败',
      details: error instanceof Error ? error.stack : undefined
    });
  }
}); 