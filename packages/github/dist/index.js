"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGithubRepo = initGithubRepo;
exports.validateToken = validateToken;
exports.initGithubRepoFromTemplate = initGithubRepoFromTemplate;
exports.setupGitHubPages = setupGitHubPages;
exports.getPagesStatus = getPagesStatus;
exports.getWorkflowStatus = getWorkflowStatus;
const rest_1 = require("@octokit/rest");
function validateToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const octokit = new rest_1.Octokit({ auth: token });
            yield octokit.rest.users.getAuthenticated();
            return true;
        }
        catch (_a) {
            return false;
        }
    });
}
function getGithubTokenWithOptions(token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (token) {
            const isValid = yield validateToken(token);
            if (isValid) {
                return token;
            }
            throw new Error('无效的 GitHub Token');
        }
        throw new Error('未提供有效的 GitHub Token');
    });
}
// 仅服务端：直接用 token 创建远程仓库
function createGithubRepoWithOptions(options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const octokit = new rest_1.Octokit({
                auth: options.token,
            });
            const { data } = yield octokit.repos.createForAuthenticatedUser({
                name: options.projectName,
                description: options.description,
                private: options.isPrivate,
            });
            return {
                success: true,
                repoUrl: data.html_url
            };
        }
        catch (error) {
            console.error('详细错误：', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '创建 GitHub 仓库失败'
            };
        }
    });
}
function initGithubRepo(options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = yield getGithubTokenWithOptions(options.token);
            const projectName = (options.projectName || '').trim();
            if (!projectName)
                return { success: false, error: '仓库名称不能为空' };
            return createGithubRepoWithOptions({
                token,
                projectName,
                description: options.description,
                isPrivate: options.private
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : '创建 GitHub 仓库失败';
            if (typeof message === 'string' && /name already exists/i.test(message)) {
                return { success: false, error: '同名仓库已存在，请更换名称' };
            }
            return { success: false, error: message };
        }
    });
}
function initGithubRepoFromTemplate(options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const token = yield getGithubTokenWithOptions(options.token);
            const name = (options.projectName || '').trim();
            if (!name)
                return { success: false, error: '仓库名称不能为空' };
            if (!options.templateOwner || !options.templateRepo)
                return { success: false, error: '缺少模板仓库信息' };
            const octokit = new rest_1.Octokit({ auth: token });
            const { data } = yield octokit.repos.createUsingTemplate({
                template_owner: options.templateOwner,
                template_repo: options.templateRepo,
                name,
                private: options.private,
                description: options.description,
                include_all_branches: (_a = options.includeAllBranches) !== null && _a !== void 0 ? _a : false,
            });
            // 如果启用了Pages，设置CI/CD
            if ((_b = options.pagesConfig) === null || _b === void 0 ? void 0 : _b.enabled) {
                // 等待更长时间让仓库完全创建
                console.log('等待仓库创建完成...');
                yield new Promise(resolve => setTimeout(resolve, 5000));
                const pagesResult = yield setupGitHubPages(octokit, data.owner.login, name, options.pagesConfig);
                if (!pagesResult.success) {
                    console.warn('Pages设置失败:', pagesResult.error);
                    // 不返回错误，只是警告
                }
            }
            return { success: true, repoUrl: data.html_url };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : '使用模板创建仓库失败';
            if (typeof message === 'string' && /name already exists/i.test(message)) {
                return { success: false, error: '同名仓库已存在，请更换名称' };
            }
            return { success: false, error: message };
        }
    });
}
// 设置GitHub Pages
function setupGitHubPages(octokit, owner, repo, config) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            console.log(`开始为 ${owner}/${repo} 设置GitHub Pages...`);
            // 首先检查仓库是否存在和可访问，并等待仓库完全就绪
            let repoReady = false;
            let attempts = 0;
            const maxAttempts = 10;
            while (!repoReady && attempts < maxAttempts) {
                try {
                    const { data: repoInfo } = yield octokit.repos.get({ owner, repo });
                    console.log(`✅ 仓库访问成功 (尝试 ${attempts + 1}/${maxAttempts}):`, repoInfo.full_name);
                    // 尝试获取仓库的默认分支内容来确认仓库完全就绪
                    try {
                        yield octokit.repos.getContent({
                            owner,
                            repo,
                            path: '',
                        });
                        repoReady = true;
                        console.log('✅ 仓库完全就绪，可以创建文件');
                    }
                    catch (contentError) {
                        if (contentError.status === 404) {
                            console.log(`⏳ 仓库尚未完全就绪 (尝试 ${attempts + 1}/${maxAttempts})，等待中...`);
                            yield new Promise(resolve => setTimeout(resolve, 2000));
                            attempts++;
                        }
                        else {
                            throw contentError;
                        }
                    }
                }
                catch (repoError) {
                    console.error(`❌ 无法访问仓库 (尝试 ${attempts + 1}/${maxAttempts}):`, repoError.message);
                    if (attempts >= maxAttempts - 1) {
                        return { success: false, error: `无法访问仓库: ${repoError.message}` };
                    }
                    yield new Promise(resolve => setTimeout(resolve, 2000));
                    attempts++;
                }
            }
            if (!repoReady) {
                return { success: false, error: '仓库在超时时间内未能完全就绪' };
            }
            // 1. 创建GitHub Actions工作流文件（使用不同的触发条件避免重复触发）
            const workflowContent = generateWorkflowYaml(config);
            console.log('生成的工作流内容长度:', workflowContent.length);
            // 首先检查token权限
            try {
                console.log('🔐 检查token权限...');
                const { data: user } = yield octokit.users.getAuthenticated();
                console.log('✅ Token有效，用户:', user.login);
                // 检查仓库权限
                const { data: repoInfo } = yield octokit.repos.get({ owner, repo });
                console.log('✅ 仓库权限检查通过:', repoInfo.full_name);
                console.log('📊 仓库信息:', {
                    private: repoInfo.private,
                    permissions: repoInfo.permissions,
                    defaultBranch: repoInfo.default_branch
                });
            }
            catch (authError) {
                console.error('❌ 权限检查失败:', authError.message);
                return { success: false, error: `权限检查失败: ${authError.message}` };
            }
            // 尝试直接创建工作流文件，GitHub会自动创建必要的目录
            console.log('🚀 尝试直接创建工作流文件...');
            // 使用重试机制创建工作流文件
            let retryCount = 0;
            const maxRetries = 3;
            while (retryCount < maxRetries) {
                try {
                    // 首先检查文件是否已存在
                    let fileSha;
                    try {
                        const { data: existingFile } = yield octokit.repos.getContent({
                            owner,
                            repo,
                            path: '.github/workflows/pages.yml',
                        });
                        if (existingFile && !Array.isArray(existingFile)) {
                            fileSha = existingFile.sha;
                            console.log('📄 文件已存在，将更新文件');
                        }
                    }
                    catch (getError) {
                        if (getError.status === 404) {
                            console.log('📄 文件不存在，将创建新文件');
                        }
                        else {
                            console.log('⚠️ 检查文件存在性时出错:', getError.message);
                            // 继续尝试创建文件
                        }
                    }
                    // 创建或更新文件
                    const fileParams = {
                        owner,
                        repo,
                        path: '.github/workflows/pages.yml',
                        message: 'Add GitHub Pages deployment workflow',
                        content: Buffer.from(workflowContent).toString('base64'),
                    };
                    // 如果文件已存在，需要提供sha
                    if (fileSha) {
                        fileParams.sha = fileSha;
                    }
                    console.log('📝 尝试创建文件，参数:', {
                        owner: fileParams.owner,
                        repo: fileParams.repo,
                        path: fileParams.path,
                        hasSha: !!fileParams.sha,
                        contentLength: fileParams.content.length
                    });
                    // 尝试使用不同的API调用方式
                    try {
                        const result = yield octokit.repos.createOrUpdateFileContents(fileParams);
                        console.log('✅ 工作流文件创建成功:', result.data.commit.sha);
                        break;
                    }
                    catch (apiError) {
                        // 如果标准API失败，尝试使用更底层的请求
                        console.log('⚠️ 标准API失败，尝试替代方法...');
                        // 尝试使用REST API直接调用
                        const response = yield octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', Object.assign({ owner: fileParams.owner, repo: fileParams.repo, path: fileParams.path, message: fileParams.message, content: fileParams.content }, (fileParams.sha && { sha: fileParams.sha })));
                        console.log('✅ 工作流文件创建成功 (替代方法):', response.data.commit.sha);
                        break;
                    }
                }
                catch (fileError) {
                    retryCount++;
                    console.error(`❌ 工作流文件创建失败 (尝试 ${retryCount}/${maxRetries}):`, {
                        status: fileError.status,
                        message: fileError.message,
                        owner,
                        repo,
                        path: '.github/workflows/pages.yml',
                        response: ((_a = fileError.response) === null || _a === void 0 ? void 0 : _a.data) || 'No response data'
                    });
                    if (retryCount >= maxRetries) {
                        // 最后一次尝试失败，返回错误
                        return {
                            success: false,
                            error: `工作流文件创建失败: ${fileError.message}. 状态码: ${fileError.status}`
                        };
                    }
                    // 等待一段时间后重试
                    console.log(`等待 ${retryCount * 2} 秒后重试...`);
                    yield new Promise(resolve => setTimeout(resolve, retryCount * 2000));
                }
            }
            // 启用GitHub Pages
            try {
                console.log('🚀 启用GitHub Pages...');
                yield octokit.request('POST /repos/{owner}/{repo}/pages', {
                    owner,
                    repo,
                    source: {
                        branch: 'main',
                        path: '/'
                    }
                });
                console.log('✅ GitHub Pages启用成功');
            }
            catch (pagesError) {
                console.warn('⚠️ GitHub Pages启用失败:', pagesError.message);
                console.log('💡 Pages可能已经启用或将通过工作流配置');
            }
            // 立即触发工作流运行
            try {
                console.log('🚀 触发工作流运行...');
                yield octokit.actions.createWorkflowDispatch({
                    owner,
                    repo,
                    workflow_id: '.github/workflows/pages.yml',
                    ref: 'main',
                });
                console.log('✅ 工作流已触发，开始自动部署');
            }
            catch (dispatchError) {
                console.warn('⚠️ 触发工作流失败:', dispatchError.message);
                console.log('💡 您可以稍后手动触发工作流或推送代码到main分支');
            }
            return { success: true };
        }
        catch (error) {
            console.error('Pages设置详细错误:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to setup Pages'
            };
        }
    });
}
// 生成GitHub Actions工作流YAML
function generateWorkflowYaml(config) {
    const buildCommand = config.buildCommand || 'npm run build';
    const outputDir = config.outputDir || './dist';
    const nodeVersion = config.nodeVersion || '18';
    return `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
    paths-ignore:
      - '.github/workflows/pages.yml'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write
  actions: read
  deployments: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8
          
      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=\$(pnpm store path --silent)" >> \$GITHUB_ENV
          
      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: \${{ env.STORE_PATH }}
          key: \${{ runner.os }}-pnpm-store-\${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            \${{ runner.os }}-pnpm-store-
          
      - name: Install dependencies
        run: |
          if [ -f "pnpm-lock.yaml" ]; then
            echo "Found pnpm-lock.yaml, installing with frozen lockfile"
            pnpm install --frozen-lockfile
          else
            echo "No pnpm-lock.yaml found, installing without frozen lockfile"
            pnpm install --no-frozen-lockfile
          fi
        
      - name: Configure Vite for GitHub Pages
        run: |
          echo "Configuring Vite for GitHub Pages..."
          cat > vite.config.ts << 'EOF'
          import { defineConfig } from 'vite'
          import react from '@vitejs/plugin-react'
          
          // https://vite.dev/config/
          export default defineConfig({
            plugins: [react()],
            base: '/\${{ github.event.repository.name }}/',
          })
          EOF
          echo "Vite configuration updated"
          cat vite.config.ts
        
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Build
        run: pnpm run build
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ${outputDir}
          
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;
}
// 获取Pages状态
function getPagesStatus(token, owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const octokit = new rest_1.Octokit({ auth: token });
            const { data } = yield octokit.repos.getPages({ owner, repo });
            return {
                status: data.status || 'building',
                url: data.html_url
            };
        }
        catch (error) {
            return { status: 'not_configured' };
        }
    });
}
// 获取工作流运行状态
function getWorkflowStatus(token, owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const octokit = new rest_1.Octokit({ auth: token });
            const { data } = yield octokit.actions.listWorkflowRuns({
                owner,
                repo,
                workflow_id: 'pages.yml'
            });
            const latestRun = data.workflow_runs[0];
            return {
                status: (latestRun === null || latestRun === void 0 ? void 0 : latestRun.status) || 'queued',
                conclusion: (latestRun === null || latestRun === void 0 ? void 0 : latestRun.conclusion) || undefined
            };
        }
        catch (error) {
            return { status: 'unknown' };
        }
    });
}
//# sourceMappingURL=index.js.map