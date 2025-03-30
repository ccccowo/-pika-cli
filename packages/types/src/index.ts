// 模板 ID 类型
export type TemplateId = 
  | 'vite-react-ts'
  | 'vite-vue-ts'
  | 'vite-svelte-ts'
  | 'next-default'
  | 'next-dashboard'
  | 'nuxt-default'
  | 'remix-default';

// 脚手架 ID 类型
export type ScaffoldId = 'vite' | 'next';

// 模板配置
export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  features: string[];
  command: string;
  scaffold: string;
  createCommand: string;
}

// 脚手架配置
export interface ScaffoldConfig {
  id: ScaffoldId;
  name: string;
  description: string;
  docs: string;
  templates: TemplateConfig[];
}

// 项目创建选项
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

// GitHub Token 配置
export interface TokenConfig {
  token: string;
  expiresAt?: string;
}

// 创建结果
export interface CreateResult {
  success: boolean;
  localPath?: string;
  repoUrl?: string;
  command?: string;
  error?: string;
} 