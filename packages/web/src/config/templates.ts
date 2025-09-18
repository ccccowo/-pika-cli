import type { ScaffoldConfig } from '../types';

export const scaffolds: ScaffoldConfig[] = [
  {
    id: 'vite',
    name: 'Vite 模板',
    description: '仅保留两种模板: React + TS 与 Vue3 + TS',
    docs: 'https://vitejs.dev',
    templates: [
      {
        id: 'vite-react-ts',
        name: 'React + Vite + TypeScript',
        description: '官方 React + TS 模板',
        scaffold: 'vite',
        templateOwner: 'ccccowo',
        templateRepo: 'template-react-ts'
      },
      {
        id: 'vite-vue-ts',
        name: 'Vue3 + Vite + TypeScript',
        description: '官方 Vue3 + TS 模板',
        scaffold: 'vite',
        templateOwner: 'ccccowo',
        templateRepo: 'template-vue-ts'
      }
    ]
  }
];