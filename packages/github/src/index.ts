import { Octokit } from "@octokit/rest";

interface CreateGithubRepoOptions {
  token: string;
  projectName: string;
  description?: string;
  isPrivate?: boolean;
}

interface InitGithubRepoOptions {
  token: string;
  private?: boolean;
  description?: string;
  projectName: string;
}

interface GithubResult {
  success: boolean;
  error?: string;
  repoUrl?: string;
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

async function getGithubTokenWithOptions(token?: string): Promise<string> {
  if (token) {
    const isValid = await validateToken(token);
    if (isValid) {
      return token;
    }
    throw new Error('无效的 GitHub Token');
  }
  throw new Error('未提供有效的 GitHub Token');
}

// 仅服务端：直接用 token 创建远程仓库
async function createGithubRepoWithOptions(options: CreateGithubRepoOptions): Promise<GithubResult> {
  try {
    const octokit = new Octokit({
      auth: options.token,
    });

    const { data } = await octokit.repos.createForAuthenticatedUser({
      name: options.projectName,
      description: options.description,
      private: options.isPrivate,
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

// 统一入口：仅 API 模式
export async function initGithubRepo(options: InitGithubRepoOptions): Promise<GithubResult> {
  try {
    const token = await getGithubTokenWithOptions(options.token);
    const projectName = (options.projectName || '').trim();
    if (!projectName) return { success: false, error: '仓库名称不能为空' };
    return createGithubRepoWithOptions({
      token,
      projectName,
      description: options.description,
      isPrivate: options.private
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '创建 GitHub 仓库失败';
    if (typeof message === 'string' && /name already exists/i.test(message)) {
      return { success: false, error: '同名仓库已存在，请更换名称' };
    }
    return { success: false, error: message };
  }
}

export { validateToken };