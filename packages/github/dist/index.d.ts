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
declare function validateToken(token: string): Promise<boolean>;
export declare function createGithubRepo({ token, projectName, projectPath, description, isPrivate, }: CreateGithubRepoOptions): Promise<{
    success: boolean;
    error: string;
    repoUrl?: undefined;
} | {
    success: boolean;
    repoUrl: string;
    error?: undefined;
}>;
export declare function initGithubRepo(options: InitGithubRepoOptions): Promise<void>;
export { validateToken };
