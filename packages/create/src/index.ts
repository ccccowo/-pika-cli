import { select, input } from "@inquirer/prompts";
import path from "node:path";
import ora from "ora";
import { executeInteractiveCommand } from "./utils/interactive.js";
import { parseScaffoldCommand, type Scaffold } from "./utils/command.js";

interface CreateOptions {
  scaffold: Scaffold;
  name: string;
  targetPath: string;
  framework?: string;
  variant?: string;
}

// API 模式：直接使用传入的参数创建项目
async function createWithOptions(options: CreateOptions) {
  const { scaffold, name, targetPath, framework, variant } = options;

  const spinner = ora('创建项目中...').start();
  try {
    // 获取命令配置
    const commandConfig = parseScaffoldCommand(scaffold, framework, variant);
    
    // 使用交互式命令创建项目
    const success = await executeInteractiveCommand({
      scaffold,
      ...commandConfig,
      projectName: name,
      projectPath: targetPath
    });

    if (!success) {
      throw new Error('项目创建失败');
    }

    spinner.succeed('项目创建成功');
    return { path: path.join(targetPath, name) };
  } catch (error) {
    spinner.fail('项目创建失败');
    throw error;
  }
}

// CLI 模式：通过命令行交互获取参数
async function createWithPrompts() {
  // 选择脚手架
  const scaffold = await select<Scaffold>({
    message: '请选择脚手架',
    choices: [
      {
        name: 'Vite',
        value: 'vite'
      },
      {
        name: 'Next.js',
        value: 'next'
      }
    ],
  });

  // 如果选择了 Vite，还需要选择框架和变体
  let framework: string | undefined;
  let variant: string | undefined;

  if (scaffold === 'vite') {
    framework = await select({
      message: '请选择框架',
      choices: [
        { name: 'React', value: 'react' },
        { name: 'Vue', value: 'vue' },
        { name: 'Svelte', value: 'svelte' }
      ]
    });

    variant = await select({
      message: '请选择变体',
      choices: [
        { name: 'TypeScript', value: 'typescript' },
        { name: 'JavaScript', value: 'javascript' }
      ]
    });
  }

  // 输入项目名
  let projectName = '';
  while(!projectName) {
    projectName = await input({ message: '请输入项目名' });
  }

  // 输入项目路径
  const projectPath = await input({ 
    message: '请输入项目路径',
    default: process.cwd()
  });

  return createWithOptions({
    scaffold,
    name: projectName,
    targetPath: projectPath,
    framework,
    variant
  });
}

// 统一入口：根据是否传入参数决定使用哪种模式
async function create(options?: CreateOptions) {
  if (options?.scaffold && options?.name && options?.targetPath) {
    return createWithOptions(options);
  }
  return createWithPrompts();
}

export default create;
