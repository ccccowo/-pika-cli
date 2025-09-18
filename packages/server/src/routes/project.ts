import { Router } from 'express';
import { initGithubRepoFromTemplate } from '@pika-cli/github';
import type { ProjectOptions } from '@pika-cli/types';
import path from 'node:path';

export const router = Router();

// 使用模板仓库在 GitHub 上创建新仓库
router.post('/create', async (req, res) => {
  try {
    const body = req.body as any;
    console.log('收到请求数据:', body);
    if (!body?.token || !body?.name || !body?.templateOwner || !body?.templateRepo) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必要参数',
        received: {
          token: !!body?.token,
          name: !!body?.name,
          templateOwner: !!body?.templateOwner,
          templateRepo: !!body?.templateRepo
        }
      });
    }

    console.log('开始调用 GitHub API...');
    const githubResult = await initGithubRepoFromTemplate({
      token: body.token,
      projectName: body.name,
      templateOwner: body.templateOwner,
      templateRepo: body.templateRepo,
      description: body.description,
      private: body.isPrivate,
      includeAllBranches: false
    });

    console.log('GitHub API 结果:', githubResult);
    if (!githubResult.success) {
      return res.status(400).json({ success: false, error: githubResult.error });
    }

    return res.json({ 
      success: true, 
      repoUrl: githubResult.repoUrl, 
      projectName: body.name,
      nextSteps: [
        `git clone ${githubResult.repoUrl}`,
        `cd ${body.name}`,
        'npm install',
        'npm run dev'
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