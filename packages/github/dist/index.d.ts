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
declare function validateToken(token: string): Promise<boolean>;
export declare function initGithubRepo(options?: InitGithubRepoOptions): Promise<GithubResult>;
export { validateToken };
