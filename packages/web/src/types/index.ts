// 模板 ID 类型
export type TemplateId = 'vite-react-ts' | 'vite-vue-ts';

// 脚手架 ID 类型
export type ScaffoldId = 'vite' | 'next';

// 模板配置
export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  scaffold: string;
  templateOwner: string;
  templateRepo: string;
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
  templateOwner: string;
  templateRepo: string;
  description?: string;
  isPrivate?: boolean;
  token?: string;
  createGithub?: boolean;
  enablePages?: boolean;
  framework?: string;
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