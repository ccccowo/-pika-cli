import { Octokit } from "@octokit/rest";
import { execSync } from "node:child_process";

interface CreateGithubRepoOptions {
  token: string;
  projectName: string;
  projectPath: string;
  description?: string;
  isPrivate?: boolean;
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

    const commands = [
      'git init',
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

export { validateToken };