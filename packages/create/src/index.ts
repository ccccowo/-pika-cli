import { select, input } from "@inquirer/prompts";
import path from "node:path";
import ora from "ora";
import { executeInteractiveCommand } from "./utils/interactive.js";
import { parseScaffoldCommand, type Scaffold } from "./utils/command.js";

async function createWithPrompts() {
  const scaffold = await select<Scaffold>({
    message: '请选择脚手架',
    choices: [
      { name: 'Vite', value: 'vite' },
      { name: 'Next.js', value: 'next' }
    ],
  });

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

  let projectName = '';
  while (!projectName) {
    projectName = (await input({ message: '请输入项目名（仅限字母/数字/连字符/下划线）' })).trim();
    const valid = /^[a-zA-Z0-9-_]+$/.test(projectName);
    if (!valid) {
      console.log('无效的项目名，请仅使用字母、数字、连字符或下划线。');
      projectName = '';
    }
  }

  const projectPath = process.cwd();

  const spinner = ora('创建项目中...').start();
  try {
    const commandConfig = parseScaffoldCommand(scaffold, framework, variant);
    const success = await executeInteractiveCommand({
      scaffold,
      ...commandConfig,
      projectName,
      projectPath
    });
    if (!success) throw new Error('项目创建失败');
    spinner.succeed('项目创建成功');
    return { path: path.join(projectPath, projectName) };
  } catch (error) {
    spinner.fail('项目创建失败');
    throw error;
  }
}

async function create() {
  return createWithPrompts();
}

export default create;
