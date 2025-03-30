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
        features: [
          'React 18',
          'TypeScript',
          'HMR',
          'ESLint',
          'Prettier'
        ],
        command: 'pnpm create vite@latest my-app --template react-ts',
        createCommand: 'create vite@latest',
        scaffold: 'vite'
      },
      {
        id: 'vite-vue-ts',
        name: 'Vue + TypeScript',
        description: '使用 Vite 构建的 Vue + TypeScript 项目',
        features: [
          'Vue 3',
          'TypeScript',
          'HMR',
          'ESLint',
          'Prettier'
        ],
        command: 'pnpm create vite@latest my-app --template vue-ts',
        createCommand: 'create vite@latest',
        scaffold: 'vite'
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
        name: 'Next.js 默认模板',
        description: '使用 Next.js 构建的 React 全栈项目',
        features: [
          'React 18',
          'TypeScript',
          'App Router',
          'TailwindCSS',
          'ESLint'
        ],
        command: 'npx create-next-app@latest my-app',
        createCommand: 'create-next-app@latest',
        scaffold: 'next'
      }
    ]
  }
];