import type { ScaffoldConfig } from '../types';

export const scaffolds: ScaffoldConfig[] = [
  {
    id: 'vite',
    name: 'Vite',
    description: '下一代前端开发与构建工具',
    docs: 'https://vitejs.dev',
    templates: [
      {
        id: 'vite-react-ts',
        name: 'React + TypeScript',
        description: '使用 Vite 构建的 React + TypeScript 项目',
        command: 'npm create vite@latest {name} --template react-ts',
        features: ['React 18', 'TypeScript', 'ESLint', 'HMR']
      },
      {
        id: 'vite-vue-ts',
        name: 'Vue + TypeScript',
        description: '使用 Vite 构建的 Vue 3 + TypeScript 项目',
        command: 'npm create vite@latest {name} --template vue-ts',
        features: ['Vue 3', 'TypeScript', 'ESLint', 'Composition API']
      },
      {
        id: 'vite-svelte-ts',
        name: 'Svelte + TypeScript',
        description: '使用 Vite 构建的 Svelte + TypeScript 项目',
        command: 'npm create vite@latest {name} --template svelte-ts',
        features: ['Svelte 4', 'TypeScript', 'ESLint']
      }
    ]
  },
  {
    id: 'next',
    name: 'Next.js',
    description: 'React 全栈开发框架',
    docs: 'https://nextjs.org',
    templates: [
      {
        id: 'next-default',
        name: '默认模板',
        description: '包含所有 Next.js 最佳实践的默认模板',
        command: 'npx create-next-app@latest {name} --typescript --tailwind --eslint',
        features: ['App Router', 'TypeScript', 'Tailwind CSS', 'ESLint']
      },
      {
        id: 'next-dashboard',
        name: 'Dashboard 模板',
        description: '官方 Dashboard 示例模板',
        command: 'npx create-next-app@latest {name} --example with-mongodb-dashboard',
        features: ['MongoDB', 'NextAuth.js', 'Tailwind CSS', 'Dashboard UI']
      }
    ]
  },
  {
    id: 'nuxt',
    name: 'Nuxt',
    description: 'Vue 全栈开发框架',
    docs: 'https://nuxt.com',
    templates: [
      {
        id: 'nuxt-default',
        name: '默认模板',
        description: 'Nuxt 3 默认启动模板',
        command: 'npx nuxi@latest init {name}',
        features: ['Vue 3', 'Auto-imports', 'Nitro Server', 'SEO 友好']
      }
    ]
  },
  {
    id: 'remix',
    name: 'Remix',
    description: '全栈 Web 框架',
    docs: 'https://remix.run',
    templates: [
      {
        id: 'remix-default',
        name: '默认模板',
        description: 'Remix 官方启动模板',
        command: 'npx create-remix@latest {name}',
        features: ['React', 'TypeScript', '嵌套路由', '数据加载']
      }
    ]
  }
]; 