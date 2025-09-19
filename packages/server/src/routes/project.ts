import { Router } from 'express';
import { initGithubRepoFromTemplate, type GitHubPagesConfig, getPagesStatus, getWorkflowStatus } from '@pika-cli/github';
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

    // 准备Pages配置
    let pagesConfig: GitHubPagesConfig | undefined;
    if (body.enablePages) {
      pagesConfig = getPagesConfig(body.framework || 'vite');
    }

    console.log('开始调用 GitHub API...');
    const githubResult = await initGithubRepoFromTemplate({
      token: body.token,
      projectName: body.name,
      templateOwner: body.templateOwner,
      templateRepo: body.templateRepo,
      description: body.description,
      private: body.isPrivate,
      includeAllBranches: false,
      pagesConfig
    });

    console.log('GitHub API 结果:', githubResult);
    if (!githubResult.success) {
      return res.status(400).json({ success: false, error: githubResult.error });
    }

    // 构建响应数据
    const responseData: any = {
      success: true,
      repoUrl: githubResult.repoUrl,
      projectName: body.name,
      nextSteps: [
        `git clone ${githubResult.repoUrl}`,
        `cd ${body.name}`,
        'npm install',
        'npm run dev'
      ]
    };

    // 如果启用了Pages，添加Pages相关信息
    if (body.enablePages && pagesConfig) {
      // 从仓库URL中提取用户名
      const repoUrlMatch = githubResult.repoUrl?.match(/github\.com\/([^\/]+)\//);
      const username = repoUrlMatch ? repoUrlMatch[1] : 'yourusername';
      const pagesUrl = `https://${username}.github.io/${body.name}`;
      
      responseData.pagesUrl = pagesUrl;
      responseData.pagesEnabled = true;
      responseData.nextSteps.push(`🌐 网站将在几分钟后自动部署到: ${pagesUrl}`);
    }

    return res.json(responseData);

  } catch (error) {
    // 返回错误响应
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '创建项目失败',
      details: error instanceof Error ? error.stack : undefined
    });
  }
});

// 获取Pages配置
function getPagesConfig(framework: string): GitHubPagesConfig {
  const configs: Record<string, GitHubPagesConfig> = {
    vite: {
      enabled: true,
      source: 'main', // 使用main分支作为源，通过GitHub Actions部署
      buildCommand: 'npm run build',
      outputDir: './dist',
      nodeVersion: '18',
      framework: 'vite'
    },
    next: {
      enabled: true,
      source: 'main',
      buildCommand: 'npm run build && npm run export',
      outputDir: './out',
      nodeVersion: '18',
      framework: 'next'
    },
    react: {
      enabled: true,
      source: 'main',
      buildCommand: 'npm run build',
      outputDir: './build',
      nodeVersion: '18',
      framework: 'react'
    },
    vue: {
      enabled: true,
      source: 'main',
      buildCommand: 'npm run build',
      outputDir: './dist',
      nodeVersion: '18',
      framework: 'vue'
    }
  };
  
  return configs[framework] || configs.vite;
}

// 检查Pages部署状态
router.post('/check-pages-status', async (req, res) => {
  try {
    const { token, owner, repo } = req.body;
    
    if (!token || !owner || !repo) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: token, owner, repo'
      });
    }

    // 获取Pages状态
    const pagesStatus = await getPagesStatus(token, owner, repo);
    
    // 获取工作流状态
    const workflowStatus = await getWorkflowStatus(token, owner, repo);

    return res.json({
      success: true,
      pages: pagesStatus,
      workflow: workflowStatus,
      isDeployed: pagesStatus.status === 'built' && pagesStatus.url,
      isBuilding: workflowStatus.status === 'in_progress' || workflowStatus.status === 'queued'
    });

  } catch (error) {
    console.error('检查Pages状态失败:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '检查状态失败'
    });
  }
}); 