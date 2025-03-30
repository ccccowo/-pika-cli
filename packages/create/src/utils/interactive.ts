import { spawn } from 'child_process';
import type { Scaffold } from './command.js';

interface CommandOptions {
  scaffold: Scaffold;
  packageManager: string;
  createCommand: string[];
  projectName: string;
  projectPath: string;
  framework?: string;
  variant?: string;
}

// 不同脚手架的交互提示
const scaffoldPrompts: Record<Scaffold, string[]> = {
  vite: ['Project name:', 'Select a framework:', 'Select a variant:'],
  next: ['Project name:']
};

// 按键映射
const KEYS = {
  ENTER: '\r',
  UP: '\u001b[A',
  DOWN: '\u001b[B'
};

// 框架选项的顺序
const FRAMEWORK_ORDER = [
  'vanilla',
  'vue',
  'react',
  'preact',
  'lit',
  'svelte',
  'solid',
  'qwik',
  'angular'
];

// 变体选项的顺序
const VARIANT_ORDER = [
  'typescript',
  'javascript'
];

function getKeysForSelection(current: string, target: string, options: string[]): string[] {
  const currentIndex = options.indexOf(current);
  const targetIndex = options.indexOf(target);
  
  if (currentIndex === -1 || targetIndex === -1) {
    return [];
  }

  const keys: string[] = [];
  const distance = targetIndex - currentIndex;
  const key = distance > 0 ? KEYS.DOWN : KEYS.UP;
  const times = Math.abs(distance);

  for (let i = 0; i < times; i++) {
    keys.push(key);
  }

  return keys;
}

export async function executeInteractiveCommand(options: CommandOptions): Promise<boolean> {
  try {
    console.log('开始创建项目...');
    console.log('项目路径:', options.projectPath);
    console.log('项目名称:', options.projectName);
    console.log('选择框架:', options.framework || 'react');
    console.log('选择变体:', options.variant || 'typescript');

    // 构建命令参数
    const args = [
      'create',
      'vite@latest',
      options.projectName
    ];

    return new Promise((resolve) => {
      const child = spawn('npm', args, {
        cwd: options.projectPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let buffer = '';
      let currentStep = 0;
      let success = false;

      // 监听输出
      child.stdout?.on('data', (data) => {
        const output = data.toString();
        buffer += output;
        
        // 检查是否包含成功提示
        if (output.includes('Done. Now run:')) {
          success = true;
          console.log('✨ 项目创建成功！');
          console.log(`📁 项目路径: ${options.projectPath}\\${options.projectName}`);
          
          // 立即结束进程
          child.kill();
          resolve(true);
          return;
        }

        // 根据输出内容判断当前步骤
        if (buffer.includes('Select a framework:') && currentStep === 0) {
          currentStep = 1;
          console.log('🎯 选择框架中...');
          // 选择框架
          setTimeout(() => {
            const keys = getKeysForSelection('vanilla', options.framework || 'react', FRAMEWORK_ORDER);
            for (const key of keys) {
              child.stdin?.write(key);
            }
            child.stdin?.write(KEYS.ENTER);
            console.log(`✅ 已选择框架: ${options.framework || 'react'}`);
          }, 500);
        } 
        else if (buffer.includes('Select a variant:') && currentStep === 1) {
          currentStep = 2;
          console.log('🎯 选择变体中...');
          // 选择变体
          setTimeout(() => {
            const keys = getKeysForSelection('typescript', options.variant || 'typescript', VARIANT_ORDER);
            for (const key of keys) {
              child.stdin?.write(key);
            }
            child.stdin?.write(KEYS.ENTER);
            console.log(`✅ 已选择变体: ${options.variant || 'typescript'}`);
          }, 500);
        }
      });

      // 监听错误
      child.stderr?.on('data', (data) => {
        console.error('❌ 错误输出:', data.toString());
      });

      // 监听进程结束
      child.on('exit', (code) => {
        if (success) {
          console.log('🎉 命令执行完成！');
          console.log('👉 下一步:');
          console.log(`   cd ${options.projectName}`);
          console.log('   pnpm install');
          console.log('   pnpm run dev');
          resolve(true);
        } else {
          console.error('❌ 命令执行失败，退出码:', code);
          resolve(false);
        }
      });

      // 监听错误
      child.on('error', (error) => {
        console.error('❌ 进程错误:', error);
        resolve(false);
      });
    });

  } catch (error) {
    console.error('❌ 执行命令出错:', error);
    return false;
  }
} 