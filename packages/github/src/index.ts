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
  private?: boolean;
  description?: string;
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

async function getGithubToken(): Promise<string> {
  // 先尝试读取已保存的 token
  const savedToken = loadToken();
  if (savedToken) {
    // 验证已保存的 token 是否有效
    if (await validateToken(savedToken)) {
      return savedToken;
    } else {
      // token 无效，删除它
      removeToken();
      console.log('❌ 已保存的 GitHub Token 已过期，请重新输入');
    }
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

export async function createGithubRepo({
  token,
  projectName,
  projectPath,
  description = '',
  isPrivate = false,
}: CreateGithubRepoOptions) {
  if (!checkGitEnvironment()) {
    return {
      success: false,
      error: '请先安装 Git'
    };
  }

  try {
    const octokit = new Octokit({
      auth: token,
    });

    const { data } = await octokit.repos.createForAuthenticatedUser({
      name: projectName,
      description,
      private: isPrivate,
    });

    const sshUrl = data.ssh_url;

    // 初始化或重置 Git 仓库
    if (!isGitRepository(projectPath)) {
      initGitRepository(projectPath);
    }

    // 如果已经有远程仓库，先删除它
    if (hasRemoteOrigin(projectPath)) {
      execSync('git remote remove origin', { cwd: projectPath, stdio: 'inherit' });
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
        cwd: projectPath,
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

export async function initGithubRepo(options: InitGithubRepoOptions) {
  // 1. 检查 Git 环境
  if (!checkGitEnvironment()) {
    console.error('请先安装 Git');
    process.exit(1);
  }

  // 2. 获取项目信息
  const projectPath = process.cwd();
  const projectName = path.basename(projectPath);

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
      console.log('已取消操作');
      process.exit(0);
    }
  }

  // 4. 获取 GitHub Token
  const token = await getGithubToken();

  // 5. 创建并关联仓库
  const result = await createGithubRepo({
    token,
    projectName,
    projectPath,
    description: options.description || '',
    isPrivate: options.private || false
  });

  if (result.success) {
    console.log(`\n✨ GitHub 仓库创建成功：${result.repoUrl}`);
  } else {
    console.error(`\n❌ GitHub 仓库创建失败：${result.error}`);
    process.exit(1);
  }
}

export { validateToken };