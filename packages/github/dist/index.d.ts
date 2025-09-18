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
interface InitFromTemplateOptions {
    token: string;
    projectName: string;
    templateOwner: string;
    templateRepo: string;
    description?: string;
    private?: boolean;
    includeAllBranches?: boolean;
}
export declare function initGithubRepoFromTemplate(options: InitFromTemplateOptions): Promise<GithubResult>;
