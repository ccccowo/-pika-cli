import { Octokit } from "@octokit/rest";
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
declare function validateToken(token: string): Promise<boolean>;
export declare function initGithubRepo(options: InitGithubRepoOptions): Promise<GithubResult>;
export { validateToken };
export interface GitHubPagesConfig {
    enabled: boolean;
    source: 'gh-pages' | 'main' | 'docs';
    buildCommand?: string;
    outputDir?: string;
    nodeVersion?: string;
    framework?: 'vite' | 'next' | 'react' | 'vue';
}
interface InitFromTemplateOptions {
    token: string;
    projectName: string;
    templateOwner: string;
    templateRepo: string;
    description?: string;
    private?: boolean;
    includeAllBranches?: boolean;
    pagesConfig?: GitHubPagesConfig;
}
export declare function initGithubRepoFromTemplate(options: InitFromTemplateOptions): Promise<GithubResult>;
export declare function setupGitHubPages(octokit: Octokit, owner: string, repo: string, config: GitHubPagesConfig): Promise<GithubResult>;
export declare function getPagesStatus(token: string, owner: string, repo: string): Promise<{
    status: string;
    url?: string;
}>;
export declare function getWorkflowStatus(token: string, owner: string, repo: string): Promise<{
    status: string;
    conclusion?: string;
}>;
