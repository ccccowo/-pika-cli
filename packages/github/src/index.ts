import { Octokit } from "@octokit/rest";
import { execSync } from "node:child_process";
import { select, input } from "@inquirer/prompts";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

interface CreateGithubRepoOptions {
  token: string;
  projectName: string;
  projectPath: string;
  description?: string;
  isPrivate?: boolean;
}

interface InitGithubRepoOptions {
  token?: string;
  private?: boolean;
  description?: string;
  projectPath?: string;
  projectName?: string;
}

interface GithubResult {
  success: boolean;
  error?: string;
  repoUrl?: string;
}

const CONFIG_DIR = path.join(os.homedir(), '.pika-cli');
const TOKEN_PATH = path.join(CONFIG_DIR, 'github-token');

// 确保配置目录存在
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

// 保存 token 到本地
function saveToken(token: string) {
  ensureConfigDir();
  fs.writeFileSync(TOKEN_PATH, token);
  console.log('✨ GitHub Token 已保存，后续可以直接使用');
}

// 从本地读取 token
function loadToken(): string | null {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      return fs.readFileSync(TOKEN_PATH, 'utf-8').trim();
    }
  } catch {}
  return null;
}

// 删除已保存的 token
function removeToken() {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      fs.unlinkSync(TOKEN_PATH);
    }
  } catch {}
}

async function validateToken(token: string): Promise<boolean> {
  try {
    const octokit = new Octokit({ auth: token });
    await octokit.rest.users.getAuthenticated();
    return true;
  } catch {
    return false;
  }
}

function checkGitEnvironment() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isGitRepository(dirPath: string): boolean {
  return fs.existsSync(path.join(dirPath, '.git'));
}

function hasRemoteOrigin(dirPath: string): boolean {
  if (!isGitRepository(dirPath)) {
    return false;
  }

  try {
    const configPath = path.join(dirPath, '.git', 'config');
    const config = fs.readFileSync(configPath, 'utf-8');
    return config.includes('[remote "origin"]');
  } catch {
    return false;
  }
}

function initGitRepository(dirPath: string) {
  if (!isGitRepository(dirPath)) {
    execSync('git init', { cwd: dirPath, stdio: 'inherit' });
    console.log('✨ Git 仓库初始化成功');
  }
}

// API 模式：使用传入的 token
async function getGithubTokenWithOptions(token?: string): Promise<string> {
  if (token) {
    const isValid = await validateToken(token);
    if (isValid) {
      return token;
    }
    throw new Error('无效的 GitHub Token');
  }

  // 尝试使用保存的 token
  const savedToken = loadToken();
  if (savedToken) {
    const isValid = await validateToken(savedToken);
    if (isValid) {
      return savedToken;
    }
    removeToken();
  }

  throw new Error('未提供有效的 GitHub Token');
}

// CLI 模式：通过命令行交互获取 token
async function getGithubTokenWithPrompts(): Promise<string> {
  // 先尝试读取已保存的 token
  const savedToken = loadToken();
  if (savedToken) {
    if (await validateToken(savedToken)) {
      return savedToken;
    }
    removeToken();
    console.log('❌ 已保存的 GitHub Token 已过期，请重新输入');
  }

  console.log('\n关于 GitHub Token:');
  console.log('1. Token 用于访问 GitHub API，创建仓库');
  console.log('2. 获取方式：');
  console.log('   - 访问 https://github.com/settings/tokens');
  console.log('   - 点击 "Generate new token (classic)"');
  console.log('   - 填写 Note（备注）');
  console.log('   - 选择有效期（建议30天）');
  console.log('   - 勾选 repo 权限（完整仓库访问权限）');
  console.log('   - 点击底部的 "Generate token"\n');

  let token = '';
  let isValid = false;

  while (!isValid) {
    token = await input({ 
      message: '请输入 GitHub Token'
    });

    isValid = await validateToken(token);

    if (!isValid) {
      console.log('\n❌ Token 无效或权限不足');
      console.log('可能的原因：');
      console.log('1. Token 输入错误');
      console.log('2. Token 已过期');
      console.log('3. Token 没有 repo 权限\n');

      const retry = await select({
        message: '请选择操作',
        choices: [
          { 
            name: '重新输入 Token', 
            value: 'retry' 
          },
          { 
            name: '查看 Token 创建教程', 
            value: 'guide' 
          },
          { 
            name: '退出', 
            value: 'exit' 
          }
        ]
      });

      if (retry === 'guide') {
        console.log('\n创建 Token 步骤：');
        console.log('1. 访问 https://github.com/settings/tokens');
        console.log('2. 点击 "Generate new token (classic)"');
        console.log('3. 填写 Note: pika-cli');
        console.log('4. 选择有效期（建议30天）');
        console.log('5. 勾选 repo 权限');
        console.log('6. 点击底部的 "Generate token"');
        console.log('7. 复制生成的 token（注意：token 只显示一次）\n');
        continue;
      }

      if (retry === 'exit') {
        process.exit(0);
      }
    }
  }

  // 保存有效的 token
  saveToken(token);
  return token;
}

// API 模式：直接使用传入的参数创建仓库
async function createGithubRepoWithOptions(options: CreateGithubRepoOptions): Promise<GithubResult> {
  if (!checkGitEnvironment()) {
    return {
      success: false,
      error: '请先安装 Git'
    };
  }

  try {
    const octokit = new Octokit({
      auth: options.token,
    });

    const { data } = await octokit.repos.createForAuthenticatedUser({
      name: options.projectName,
      description: options.description,
      private: options.isPrivate,
    });

    const sshUrl = data.ssh_url;

    // 初始化或重置 Git 仓库
    if (!isGitRepository(options.projectPath)) {
      initGitRepository(options.projectPath);
    }

    // 如果已经有远程仓库，先删除它
    if (hasRemoteOrigin(options.projectPath)) {
      execSync('git remote remove origin', { cwd: options.projectPath, stdio: 'inherit' });
    }

    const commands = [
      'git add .',
      'git commit -m "Initial commit"',
      'git branch -M main',
      `git remote add origin ${sshUrl}`,
      'git push -u origin main'
    ];

    commands.forEach(cmd => {
      execSync(cmd, { 
        cwd: options.projectPath,
        stdio: 'inherit' 
      });
    });

    return {
      success: true,
      repoUrl: data.html_url
    };
  } catch (error) {
    console.error('详细错误：', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建 GitHub 仓库失败'
    };
  }
}

// CLI 模式：通过命令行交互创建仓库
async function createGithubRepoWithPrompts(options: InitGithubRepoOptions): Promise<GithubResult> {
  // 1. 检查 Git 环境
  if (!checkGitEnvironment()) {
    return {
      success: false,
      error: '请先安装 Git'
    };
  }

  // 2. 获取项目信息
  const projectPath = options.projectPath || process.cwd();
  const projectName = options.projectName || path.basename(projectPath);

  // 3. 检查是否已有远程仓库
  const hasOrigin = hasRemoteOrigin(projectPath);

  if (hasOrigin) {
    const override = await select({
      message: '当前项目已经关联了远程仓库，是否覆盖？',
      choices: [
        { name: '是', value: true },
        { name: '否', value: false }
      ]
    });

    if (!override) {
      return {
        success: false,
        error: '用户取消操作'
      };
    }
  }

  // 4. 获取 GitHub Token
  let token: string;
  try {
    token = await getGithubTokenWithPrompts();
  } catch (error) {
    return {
      success: false,
      error: '获取 Token 失败'
    };
  }

  // 5. 创建并关联仓库
  return createGithubRepoWithOptions({
    token,
    projectName,
    projectPath,
    description: options.description,
    isPrivate: options.private
  });
}

// 统一入口：根据是否传入 token 决定使用哪种模式
export async function initGithubRepo(options: InitGithubRepoOptions = {}): Promise<GithubResult> {
  try {
    if (options.token) {
      // API 模式
      const token = await getGithubTokenWithOptions(options.token);
      const projectPath = options.projectPath || process.cwd();
      const projectName = options.projectName || path.basename(projectPath);
      
      return createGithubRepoWithOptions({
        token,
        projectName,
        projectPath,
        description: options.description,
        isPrivate: options.private
      });
    } else {
      // CLI 模式
      return createGithubRepoWithPrompts(options);
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建 GitHub 仓库失败'
    };
  }
}

export { validateToken };