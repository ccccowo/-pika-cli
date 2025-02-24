import { select, input, confirm } from "@inquirer/prompts";
import os from "node:os";
import { NpmPackage } from "@pika-cli/utils";
import path from "node:path";
import ora from "ora";
// @ts-ignore
import fse from "fs-extra";
import { glob } from "glob";
import ejs from "ejs";

interface CreateOptions {
  template?: string;
  name?: string;
  targetPath?: string;
}

// API 模式：直接使用传入的参数创建项目
async function createWithOptions(options: CreateOptions) {
  const { template, name, targetPath = process.cwd() } = options;
  if (!template || !name) {
    throw new Error('template 和 name 是必需的');
  }

  // 检查项目目录是否存在
  const projectPath = path.join(targetPath, name);
  if(fse.existsSync(projectPath)) {
    fse.emptyDirSync(projectPath);
  }

  // 下载/更新模版
  const pkg = new NpmPackage({
    name: template,
    targetPath: path.join(os.homedir(), '.guang-cli-template')
  });

  const spinner = ora('处理模板中...').start();
  try {
    if (!await pkg.exists()) {
      await pkg.install();
    } else {
      await pkg.update();
    }

    // 将模版复制到项目目录
    const templatePath = path.join(pkg.npmFilePath, 'template');
    fse.copySync(templatePath, projectPath);

    // 渲染ejs模版文件
    const renderData = { projectName: name };
    const files = await glob('**', {
      cwd: projectPath,
      nodir: true,
      ignore: 'node_modules/**'
    });

    for (const file of files) {
      const filePath = path.join(projectPath, file);
      const renderResult = await ejs.renderFile(filePath, renderData);
      fse.writeFileSync(filePath, renderResult);
    }

    spinner.succeed('项目创建成功');
    return { path: projectPath };
  } catch (error) {
    spinner.fail('项目创建失败');
    throw error;
  }
}

// CLI 模式：通过命令行交互获取参数
async function createWithPrompts() {
  // 选择项目模版
  const projectTemplate = await select({
    message: '请选择项目模版',
    choices: [
      {
        name: 'react 项目',
        value: '@pika-cli/template-react-ui-ts'
      },
      {
        name: 'vue 项目',
        value: '@guang-cli/template-vue'
      }
    ],
  });

  // 输入项目名
  let projectName = '';
  while(!projectName) {
    projectName = await input({ message: '请输入项目名' });
  }

  return createWithOptions({
    template: projectTemplate,
    name: projectName
  });
}

// 统一入口：根据是否传入参数决定使用哪种模式
async function create(options?: CreateOptions) {
  if (options?.template && options?.name) {
    return createWithOptions(options);
  }
  return createWithPrompts();
}

export default create;