export type TemplateId = 'vite-react-ts' | 'vite-vue-ts' | 'vite-svelte-ts' | 'next-default' | 'next-dashboard' | 'nuxt-default' | 'remix-default';
export type ScaffoldId = 'vite' | 'next';
export interface TemplateConfig {
    id: string;
    name: string;
    description: string;
    features: string[];
    command: string;
    scaffold: string;
    createCommand: string;
}
export interface ScaffoldConfig {
    id: ScaffoldId;
    name: string;
    description: string;
    docs: string;
    templates: TemplateConfig[];
}
export interface ProjectOptions {
    scaffold: ScaffoldId;
    name: string;
    projectPath: string;
    framework?: string;
    variant?: string;
    description?: string;
    isPrivate?: boolean;
    token?: string;
    localPath?: string;
    createGithub?: boolean;
}
export interface TokenConfig {
    token: string;
    expiresAt?: string;
}
export interface CreateResult {
    success: boolean;
    localPath?: string;
    repoUrl?: string;
    command?: string;
    error?: string;
}
