// 项目模板类型
export type Template = 'react' | 'vue';

// 项目创建选项
export interface ProjectOptions {
  name: string;
  template: Template;
  createType: 'local' | 'github' | 'both';
  description?: string;
  isPrivate?: boolean;
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
} 