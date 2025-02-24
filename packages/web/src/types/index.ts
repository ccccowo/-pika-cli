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
export type ScaffoldId = 'vite' | 'next' | 'nuxt' | 'remix';

// 模板配置
export interface TemplateConfig {
  id: TemplateId;
  name: string;
  description: string;
  command: string;
  features: string[];
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
  name: string;
  template: TemplateId;
  createType: 'local' | 'github' | 'both';
  description?: string;
  isPrivate?: boolean;
  token?: string;
  localPath?: string;
}

// GitHub Token 配置
export interface TokenConfig {
  token: string;
  expiresAt?: string;
}

// 创建结果
export interface CreateResult {
  success: boolean;
  error?: string;
  repoUrl?: string;
  localPath?: string;
  command?: string;
} 