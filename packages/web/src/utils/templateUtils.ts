import { CustomTemplate } from '../components/TemplateManager';

// 模板导入/导出工具
export class TemplateUtils {
  // 导出模板为 JSON 文件
  static exportTemplates(templates: CustomTemplate[], filename?: string) {
    const dataStr = JSON.stringify(templates, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `templates_${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // 从 JSON 文件导入模板
  static importTemplates(file: File): Promise<CustomTemplate[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const templates = JSON.parse(content) as CustomTemplate[];
          
          // 验证模板格式
          const validTemplates = templates.filter(template => 
            template.id && 
            template.name && 
            template.templateOwner && 
            template.templateRepo
          );
          
          resolve(validTemplates);
        } catch (error) {
          reject(new Error('文件格式不正确'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsText(file);
    });
  }

  // 生成模板分享链接
  static generateShareLink(template: CustomTemplate): string {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      template: JSON.stringify(template)
    });
    return `${baseUrl}?import=${params.toString()}`;
  }

  // 从 URL 参数解析模板
  static parseTemplateFromUrl(): CustomTemplate | null {
    const urlParams = new URLSearchParams(window.location.search);
    const templateParam = urlParams.get('import');
    
    if (templateParam) {
      try {
        return JSON.parse(templateParam) as CustomTemplate;
      } catch (error) {
        console.error('解析模板参数失败:', error);
        return null;
      }
    }
    
    return null;
  }

  // 验证 GitHub 仓库是否存在
  static async validateGitHubRepo(owner: string, repo: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // 获取 GitHub 仓库信息
  static async getGitHubRepoInfo(owner: string, repo: string) {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (response.ok) {
        const data = await response.json();
        return {
          name: data.name,
          description: data.description,
          isTemplate: data.is_template,
          language: data.language,
          stars: data.stargazers_count,
          forks: data.forks_count,
          updatedAt: data.updated_at,
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // 生成模板预览信息
  static generateTemplatePreview(template: CustomTemplate) {
    return {
      name: template.name,
      description: template.description,
      repository: `${template.templateOwner}/${template.templateRepo}`,
      scaffold: template.scaffold,
      tags: template.tags,
      isPublic: template.isPublic,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}
